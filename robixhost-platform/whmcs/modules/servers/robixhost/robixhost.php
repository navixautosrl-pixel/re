<?php
/**
 * RobixHost provisioning module for WHMCS (7.10+ / 8.x).
 *
 * Billing, invoices and payments stay in WHMCS. RobixHost owns virtualisation, resource allocation and service state.
 * WHMCS only calls these functions after ITS OWN payment/fraud checks, and every call is HMAC-signed, so RobixHost never
 * trusts an unauthenticated "this order is paid" claim.
 *
 * Interfaces used are the documented ones: https://developers.whmcs.com/provisioning-modules/
 *   - robixhost_MetaData, robixhost_ConfigOptions
 *   - robixhost_CreateAccount, _SuspendAccount, _UnsuspendAccount, _TerminateAccount
 *   - robixhost_TestConnection, robixhost_AdminCustomButtonArray (+ the function it names)
 *
 * NOT implemented (so WHMCS correctly hides the corresponding buttons instead of pretending):
 *   ChangePassword, ChangePackage, Renew, and guest reinstall. See whmcs/docs/README.md "Limitations".
 */

if (!defined('WHMCS')) {
    die('This file cannot be accessed directly');
}

require_once __DIR__ . '/lib/RobixHostClient.php';

use RobixHost\WHMCS\RobixHostClient;
use RobixHost\WHMCS\RobixHostException;

function robixhost_MetaData()
{
    return [
        'DisplayName' => 'RobixHost VPS',
        'APIVersion' => '1.1',
        'RequiresServer' => true,
        'DefaultNonSSLPort' => '8080',
        'DefaultSSLPort' => '8443',
    ];
}

/**
 * Product-level defaults. Customer-selectable values come from WHMCS Configurable Options named
 * "CPU", "RAM", "Disk" and "OS" (the text before any "|" in the option name); they override these defaults.
 */
function robixhost_ConfigOptions()
{
    return [
        'Default vCPU cores' => ['Type' => 'text', 'Size' => '5', 'Default' => '1', 'Description' => 'Used when no "CPU" configurable option exists'],
        'Default RAM (MB)' => ['Type' => 'text', 'Size' => '8', 'Default' => '1024', 'Description' => 'Used when no "RAM" configurable option exists'],
        'Default disk (GB)' => ['Type' => 'text', 'Size' => '8', 'Default' => '20', 'Description' => 'Used when no "Disk" configurable option exists'],
        'Default OS template' => ['Type' => 'text', 'Size' => '25', 'Default' => '', 'Description' => 'Template key (file templates/<key>.qcow2 on the host); "OS" configurable option overrides'],
        'IP pool ID' => ['Type' => 'text', 'Size' => '5', 'Default' => '', 'Description' => 'RobixHost IP pool to allocate from (leave empty for no managed IP)'],
        'Wait seconds' => ['Type' => 'text', 'Size' => '4', 'Default' => '25', 'Description' => 'How long Create/Suspend/Unsuspend/Terminate wait for the job (5-50)'],
    ];
}

// ---------------------------------------------------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------------------------------------------------

function robixhost_CreateAccount(array $params)
{
    return robixhost_runJob($params, __FUNCTION__, 'provision', function (RobixHostClient $c) use ($params) {
        return $c->createService(robixhost_buildCreateRequest($params));
    }, function (RobixHostClient $c, array $params) {
        // Only now, with the job confirmed Succeeded, record what the hypervisor says (IP address) back into WHMCS.
        robixhost_syncFromServer($params, $c);
    });
}

function robixhost_SuspendAccount(array $params)
{
    return robixhost_runJob($params, __FUNCTION__, 'suspension', function (RobixHostClient $c) use ($params) {
        return $c->suspend($params['serviceid']);
    });
}

function robixhost_UnsuspendAccount(array $params)
{
    return robixhost_runJob($params, __FUNCTION__, 'reactivation', function (RobixHostClient $c) use ($params) {
        return $c->unsuspend($params['serviceid']);
    });
}

/**
 * Terminate RETAINS the customer's disks on the RobixHost server (recoverable). Freeing the space is a separate,
 * explicitly confirmed administrator action on the RobixHost side. A cancelled order is never instant data loss.
 */
function robixhost_TerminateAccount(array $params)
{
    return robixhost_runJob($params, __FUNCTION__, 'termination', function (RobixHostClient $c) use ($params) {
        return $c->terminate($params['serviceid']);
    });
}

function robixhost_TestConnection(array $params)
{
    try {
        $c = robixhost_client($params);
        $c->health();
        // A signed request for a job id that cannot exist. 404 "notfound.job" PROVES the signature/secret was accepted;
        // 401 means the secret does not match. No side effects either way.
        try {
            $c->jobStatus('connection-test');
        } catch (RobixHostException $e) {
            if ($e->apiCode === 'notfound.job') {
                return ['success' => true, 'error' => ''];
            }
            if ($e->httpStatus === 401) {
                return ['success' => false, 'error' => 'The server is reachable but rejected the signature: the shared secret in the server "Password" field does not match RobixHost\'s secrets/whmcs.secret (or the server clocks differ by more than 5 minutes).'];
            }
            throw $e;
        }
        return ['success' => true, 'error' => ''];
    } catch (\Exception $e) {
        logModuleCall('robixhost', __FUNCTION__, [], $e->getMessage(), '', robixhost_secrets($params));
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Admin: manual synchronisation button on the service page
// ---------------------------------------------------------------------------------------------------------------------

function robixhost_AdminCustomButtonArray()
{
    return ['Sync status from RobixHost' => 'syncstatus'];
}

function robixhost_syncstatus(array $params)
{
    try {
        $c = robixhost_client($params);
        $svc = robixhost_syncFromServer($params, $c);
        logModuleCall('robixhost', __FUNCTION__, ['serviceId' => $params['serviceid']], $svc, '', robixhost_secrets($params));
        if (($svc['powerState'] ?? '') === 'Missing') {
            return 'RobixHost has a record of this service but the hypervisor reports no such VM. Check the host before taking action.';
        }
        return 'success';
    } catch (\Exception $e) {
        logModuleCall('robixhost', __FUNCTION__, ['serviceId' => $params['serviceid']], $e->getMessage(), '', robixhost_secrets($params));
        return $e->getMessage();
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Internals (prefixed so they never collide with other modules)
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Submit a job, wait for it, and return "success" ONLY if RobixHost reports the job Succeeded.
 * Returns an error string otherwise; WHMCS then leaves the service in its previous state. Repeating the action is safe.
 */
function robixhost_runJob(array $params, $action, $what, callable $submit, ?callable $onSuccess = null)
{
    try {
        $c = robixhost_client($params, function ($m, $p, $req, $st, $res) use ($action, $params) {
            logModuleCall('robixhost', $action . ' ' . $m . ' ' . $p, $req, "HTTP $st: " . $res, '', robixhost_secrets($params));
        });
        $job = $submit($c);
        $jobId = isset($job['jobId']) ? $job['jobId'] : '';
        if ($jobId === '' && ($job['state'] ?? '') === 'Succeeded') {
            return 'success';   // server says there was nothing to do (e.g. terminate of an already-terminated service)
        }
        if ($jobId === '') {
            return 'RobixHost accepted the request but returned no job id; nothing can be confirmed. Use "Sync status" and check the host.';
        }
        $final = $c->waitForJob($jobId, robixhost_waitSeconds($params));
        $state = isset($final['state']) ? $final['state'] : '';
        if ($state === 'Succeeded') {
            if ($onSuccess) {
                $onSuccess($c, $params);
            }
            return 'success';
        }
        if ($state === 'Failed' || $state === 'Cancelled') {
            $step = !empty($final['step']) ? " at step '" . $final['step'] . "'" : '';
            $code = !empty($final['error']) ? ' [' . $final['error'] . ']' : '';
            return ucfirst($what) . " $state$step$code. RobixHost job $jobId has the details; the request can be retried.";
        }
        $step = !empty($final['step']) ? " (" . $final['step'] . ", " . (int)($final['progress'] ?? 0) . "%)" : '';
        return ucfirst($what) . " is still running$step. RobixHost job $jobId continues in the background; use 'Sync status from RobixHost' to confirm. Repeating the request never creates a duplicate VM.";
    } catch (\Exception $e) {
        logModuleCall('robixhost', $action, ['serviceId' => isset($params['serviceid']) ? $params['serviceid'] : ''], $e->getMessage(), '', robixhost_secrets($params));
        return $e->getMessage();
    }
}

function robixhost_client(array $params, $logger = null)
{
    return new RobixHostClient(
        isset($params['serverhostname']) && $params['serverhostname'] !== '' ? $params['serverhostname'] : (isset($params['serverip']) ? $params['serverip'] : ''),
        isset($params['serverport']) ? (int)$params['serverport'] : 0,
        !empty($params['serversecure']),
        isset($params['serverpassword']) ? $params['serverpassword'] : '',
        25,
        $logger
    );
}

/** Values logModuleCall must mask in the module log. */
function robixhost_secrets(array $params)
{
    $s = [];
    foreach (['serverpassword', 'serveraccesshash', 'password'] as $k) {
        if (!empty($params[$k])) {
            $s[] = $params[$k];
        }
    }
    return $s;
}

function robixhost_waitSeconds(array $params)
{
    $v = isset($params['configoption6']) && $params['configoption6'] !== '' ? (int)$params['configoption6'] : 25;
    return max(5, min(50, $v));   // WHMCS/PHP request time limits make anything longer unsafe
}

/** Case-insensitive lookup of a configurable option by the part of its name before "|". */
function robixhost_option(array $params, $name)
{
    $opts = isset($params['configoptions']) && is_array($params['configoptions']) ? $params['configoptions'] : [];
    foreach ($opts as $k => $v) {
        $label = strtolower(trim(explode('|', (string)$k)[0]));
        if ($label === strtolower($name) && $v !== '') {
            return $v;
        }
    }
    return null;
}

function robixhost_positiveInt($value, $label, $min, $max)
{
    if (!is_numeric($value) || (int)$value != $value || (int)$value < $min || (int)$value > $max) {
        throw new RobixHostException("$label must be a whole number between $min and $max (got '" . (string)$value . "').");
    }
    return (int)$value;
}

function robixhost_buildCreateRequest(array $params)
{
    $serviceId = isset($params['serviceid']) ? (string)$params['serviceid'] : '';
    if ($serviceId === '' || !ctype_digit($serviceId)) {
        throw new RobixHostException('Missing WHMCS service id.');
    }
    $cpu = robixhost_positiveInt(robixhost_option($params, 'CPU') ?? $params['configoption1'], 'vCPU cores', 1, 256);
    $ram = robixhost_positiveInt(robixhost_option($params, 'RAM') ?? $params['configoption2'], 'RAM (MB)', 128, 4194304);
    $disk = robixhost_positiveInt(robixhost_option($params, 'Disk') ?? $params['configoption3'], 'Disk (GB)', 1, 65536);
    $os = trim((string)(robixhost_option($params, 'OS') ?? $params['configoption4']));
    if ($os === '' || !preg_match('/^[A-Za-z0-9._-]{1,64}$/', $os)) {
        throw new RobixHostException('No valid operating-system template: set the "OS" configurable option or the product default.');
    }
    $hostname = isset($params['domain']) ? trim((string)$params['domain']) : '';
    $pool = isset($params['configoption5']) && trim($params['configoption5']) !== '' ? robixhost_positiveInt(trim($params['configoption5']), 'IP pool ID', 1, PHP_INT_MAX) : null;

    return [
        'serviceId' => $serviceId,
        'hostname' => $hostname,
        'osTemplate' => $os,
        'vCpus' => $cpu,
        'memoryMb' => $ram,
        'diskGb' => $disk,
        'ipPoolId' => $pool,
    ];
}

/**
 * Pull the hypervisor's view of the service and write the IP address back to WHMCS (tblhosting.dedicatedip).
 * Credentials are NOT written or emailed by this module: it never generates guest passwords.
 */
function robixhost_syncFromServer(array $params, RobixHostClient $c)
{
    $svc = $c->getService($params['serviceid']);
    $ips = isset($svc['ipAddresses']) && is_array($svc['ipAddresses']) ? $svc['ipAddresses'] : [];
    if (class_exists('\WHMCS\Database\Capsule')) {
        \WHMCS\Database\Capsule::table('tblhosting')->where('id', $params['serviceid'])->update([
            'dedicatedip' => count($ips) > 0 ? $ips[0] : '',
            'assignedips' => implode("\n", array_slice($ips, 1)),
        ]);
    }
    return $svc;
}
