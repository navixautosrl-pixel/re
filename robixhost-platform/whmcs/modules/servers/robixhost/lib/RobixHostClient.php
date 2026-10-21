<?php
/**
 * RobixHost API client for the WHMCS provisioning module.
 *
 * No WHMCS dependencies, so it can be tested stand-alone (see whmcs/tests/e2e.php).
 *
 * Authentication: every request is signed with HMAC-SHA256 over "<unix-ts>.<nonce>.<raw-body>" using the shared secret
 * (base64, from <DataDir>/secrets/whmcs.secret on the RobixHost server). The server rejects stale timestamps (>5 min),
 * bad signatures and REPLAYED nonces. The secret itself is never sent.
 */

namespace RobixHost\WHMCS;

class RobixHostException extends \RuntimeException
{
    /** @var string machine-readable error code from the RobixHost API (e.g. "notfound.service"), or "" for transport errors */
    public $apiCode;
    /** @var int HTTP status, 0 for transport errors */
    public $httpStatus;

    public function __construct($message, $apiCode = '', $httpStatus = 0)
    {
        parent::__construct($message);
        $this->apiCode = $apiCode;
        $this->httpStatus = $httpStatus;
    }
}

class RobixHostClient
{
    private $baseUrl;
    private $key;
    private $timeout;
    /** @var callable|null receives (method, path, requestBody, httpStatus, responseBody) for logModuleCall; never receives secrets */
    private $logger;

    /**
     * @param string $host      hostname or IP of the RobixHost API
     * @param int    $port      0 = default for the scheme
     * @param bool   $secure    use TLS. Plain HTTP is accepted ONLY for loopback/private addresses.
     * @param string $secretB64 shared secret, base64
     */
    public function __construct($host, $port, $secure, $secretB64, $timeout = 20, $logger = null)
    {
        $host = trim((string)$host);
        if ($host === '' || !preg_match('/^[A-Za-z0-9.\-:\[\]]+$/', $host)) {
            throw new RobixHostException('The server hostname is empty or contains invalid characters.');
        }
        $key = base64_decode(trim((string)$secretB64), true);
        if ($key === false || strlen($key) < 16) {
            throw new RobixHostException('The server "Password" field must contain the RobixHost shared secret (base64). It is missing or malformed.');
        }
        if (!$secure && !self::isPrivateOrLoopback($host)) {
            throw new RobixHostException('Refusing to send signed provisioning requests over plain HTTP to a public address. Enable "Secure" (TLS) on the WHMCS server entry.');
        }
        $scheme = $secure ? 'https' : 'http';
        $this->baseUrl = $scheme . '://' . $host . ($port ? ':' . (int)$port : '');
        $this->key = $key;
        $this->timeout = max(3, (int)$timeout);
        $this->logger = $logger;
    }

    public static function isPrivateOrLoopback($host)
    {
        $ip = filter_var($host, FILTER_VALIDATE_IP) ? $host : gethostbyname($host);
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return false;
        }
        // false => the address IS in a private or reserved range
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }

    /** Unauthenticated liveness probe. */
    public function health()
    {
        return $this->request('GET', '/health', null, false);
    }

    /** Submits a create request. Idempotent per service id: repeating it returns the same job, never a second VM. */
    public function createService(array $req)
    {
        return $this->request('POST', '/api/v1/whmcs/create', $req, true);
    }

    public function suspend($serviceId)
    {
        return $this->request('POST', '/api/v1/whmcs/suspend', ['serviceId' => (string)$serviceId], true);
    }

    public function unsuspend($serviceId)
    {
        return $this->request('POST', '/api/v1/whmcs/unsuspend', ['serviceId' => (string)$serviceId], true);
    }

    public function terminate($serviceId)
    {
        return $this->request('POST', '/api/v1/whmcs/terminate', ['serviceId' => (string)$serviceId], true);
    }

    /** What the HYPERVISOR reports for the service right now (power state, suspended flag, IP addresses). */
    public function getService($serviceId)
    {
        return $this->request('POST', '/api/v1/whmcs/service', ['serviceId' => (string)$serviceId], true);
    }

    public function jobStatus($jobId)
    {
        return $this->request('POST', '/api/v1/whmcs/status', ['jobId' => (string)$jobId], true);
    }

    /**
     * Polls a job until it reaches a terminal state or the time budget is spent.
     * @return array last status payload; check ['state'] in {Succeeded, Failed, Cancelled} for completion
     */
    public function waitForJob($jobId, $maxSeconds)
    {
        $deadline = microtime(true) + max(1, $maxSeconds);
        do {
            $st = $this->jobStatus($jobId);
            if (in_array($st['state'] ?? '', ['Succeeded', 'Failed', 'Cancelled'], true)) {
                return $st;
            }
            usleep(800000);
        } while (microtime(true) < $deadline);
        return $st;
    }

    public static function sign($key, $timestamp, $nonce, $body)
    {
        return hash_hmac('sha256', $timestamp . '.' . $nonce . '.' . $body, $key);
    }

    private function request($method, $path, $payload, $signed)
    {
        $body = $payload === null ? '' : json_encode($payload, JSON_UNESCAPED_SLASHES);
        if ($body === false) {
            throw new RobixHostException('Could not encode the request.');
        }
        $headers = ['Accept: application/json'];
        if ($method === 'POST') {
            $headers[] = 'Content-Type: application/json';
        }
        if ($signed) {
            $ts = (string)time();
            $nonce = bin2hex(random_bytes(16));
            $headers[] = 'X-Robix-Timestamp: ' . $ts;
            $headers[] = 'X-Robix-Nonce: ' . $nonce;
            $headers[] = 'X-Robix-Signature: ' . self::sign($this->key, $ts, $nonce, $body);
        }

        $ch = curl_init($this->baseUrl . $path);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_FOLLOWLOCATION => false,     // a redirect could replay a signed request elsewhere
            CURLOPT_SSL_VERIFYPEER => true,      // never disabled
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($this->logger) {
            call_user_func($this->logger, $method, $path, $body, $status, $raw === false ? "transport error: $err" : $raw);
        }
        if ($raw === false) {
            throw new RobixHostException('Cannot reach the RobixHost server: ' . $err);
        }
        $data = json_decode($raw, true);
        if ($status >= 200 && $status < 300) {
            return is_array($data) ? $data : [];
        }
        // RFC 7807 problem+json from the API: {title: "<code>", detail: "<message>", requestId}
        $code = is_array($data) && isset($data['title']) ? (string)$data['title'] : '';
        $detail = is_array($data) && isset($data['detail']) ? (string)$data['detail'] : 'HTTP ' . $status;
        $rid = is_array($data) && isset($data['requestId']) ? ' (request ' . $data['requestId'] . ')' : '';
        throw new RobixHostException($detail . $rid, $code, $status);
    }
}
