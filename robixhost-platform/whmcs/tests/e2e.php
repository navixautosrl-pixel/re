<?php
/**
 * End-to-end test of the WHMCS module against a RUNNING RobixHost API (see run_e2e.sh).
 * Usage: php e2e.php <host> <port> <secret-file> <ip-pool-id>
 *
 * WHMCS itself is not available here, so only logModuleCall() is stubbed. Everything else is the real module code
 * talking real HTTP to the real API, which drives real qemu-system-x86_64 / qemu-img.
 */
define('WHMCS', true);

$logs = [];
function logModuleCall($module, $action, $request, $response, $processed = '', $replace = [])
{
    global $logs;
    $logs[] = json_encode([$module, $action, $request, $response]);
}

require __DIR__ . '/../modules/servers/robixhost/robixhost.php';

use RobixHost\WHMCS\RobixHostClient;
use RobixHost\WHMCS\RobixHostException;

[$script, $host, $port, $secretFile, $poolId] = $argv + [null, '127.0.0.1', 5199, '', 1];
$secret = trim(file_get_contents($secretFile));
$passed = 0;
$failed = 0;

function check($cond, $what)
{
    global $passed, $failed;
    if ($cond) { $passed++; echo "PASS  $what\n"; } else { $failed++; echo "FAIL  $what\n"; }
}
function eq($expected, $actual, $what)
{
    check($expected === $actual, $what . ($expected === $actual ? '' : ' - expected ' . var_export($expected, true) . ' got ' . var_export($actual, true)));
}

$serviceId = (string)random_int(100000, 999999);
$params = [
    'serviceid' => $serviceId,
    'domain' => 'vps1.example.test',
    'serverhostname' => $host, 'serverport' => (int)$port, 'serversecure' => false, 'serverpassword' => $secret,
    'configoption1' => '1', 'configoption2' => '256', 'configoption3' => '1', 'configoption4' => 'test-os',
    'configoption5' => (string)$poolId, 'configoption6' => '40',
    'configoptions' => [],
];

echo "== connection ==\n";
$t = robixhost_TestConnection($params);
eq(true, $t['success'], 'TestConnection succeeds with the correct secret: ' . $t['error']);
$bad = $params; $bad['serverpassword'] = base64_encode(random_bytes(32));
$t = robixhost_TestConnection($bad);
eq(false, $t['success'], 'TestConnection fails with a wrong secret');
check(strpos($t['error'], 'rejected the signature') !== false, 'wrong-secret error is actionable: ' . $t['error']);
$t = robixhost_TestConnection(array_merge($params, ['serverpassword' => 'not base64 !!']));
eq(false, $t['success'], 'malformed secret is rejected locally');

echo "== transport safety ==\n";
try { new RobixHostClient('8.8.8.8', 0, false, $secret); check(false, 'plain HTTP to a public address must be refused'); }
catch (RobixHostException $e) { check(strpos($e->getMessage(), 'plain HTTP') !== false, 'plain HTTP to a public address is refused'); }

echo "== request authentication ==\n";
$key = base64_decode($secret, true);
$post = function ($path, $body, $ts, $nonce, $sig) use ($host, $port) {
    $ch = curl_init("http://$host:$port$path");
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', "X-Robix-Timestamp: $ts", "X-Robix-Nonce: $nonce", "X-Robix-Signature: $sig"]]);
    curl_exec($ch); $s = curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch); return $s;
};
$body = json_encode(['jobId' => 'auth-probe']); $ts = time(); $nonce = bin2hex(random_bytes(8));
$sig = RobixHostClient::sign($key, $ts, $nonce, $body);
eq(404, $post('/api/v1/whmcs/status', $body, $ts, $nonce, $sig), 'valid signature accepted (404 = authenticated, job unknown)');
eq(401, $post('/api/v1/whmcs/status', $body, $ts, $nonce, $sig), 'REPLAY of the same nonce is rejected');
$n2 = bin2hex(random_bytes(8));
eq(401, $post('/api/v1/whmcs/status', json_encode(['jobId' => 'tampered']), $ts, $n2, RobixHostClient::sign($key, $ts, $n2, $body)), 'tampered body is rejected');
$n3 = bin2hex(random_bytes(8));
eq(401, $post('/api/v1/whmcs/status', $body, $ts - 3600, $n3, RobixHostClient::sign($key, $ts - 3600, $n3, $body)), 'stale timestamp is rejected');
eq(401, $post('/api/v1/whmcs/status', $body, $ts, bin2hex(random_bytes(8)), ''), 'missing signature is rejected');

echo "== configuration validation (nothing is sent to the server) ==\n";
$r = robixhost_CreateAccount(array_merge($params, ['configoption1' => '0']));
check(strpos($r, 'vCPU cores must be') !== false, "invalid CPU is refused locally: $r");
$r = robixhost_CreateAccount(array_merge($params, ['configoption4' => '../../etc/passwd']));
check(strpos($r, 'operating-system template') !== false, "path-traversal OS key is refused locally: $r");
$req = robixhost_buildCreateRequest(array_merge($params, ['configoptions' => ['RAM|Memory' => '512', 'cpu' => '2', 'Disk' => '', 'OS' => 'other-os']]));
eq(2, $req['vCpus'], 'configurable option "cpu" overrides the product default');
eq(512, $req['memoryMb'], 'configurable option "RAM|Memory" overrides the product default (name before | is used)');
eq(1, $req['diskGb'], 'an empty configurable option falls back to the product default');
eq('other-os', $req['osTemplate'], 'configurable option "OS" overrides the default template');

echo "== provisioning ==\n";
$t0 = microtime(true);
$r = robixhost_CreateAccount($params);
eq('success', $r, sprintf('CreateAccount returns success only after the job succeeded (%.1fs): %s', microtime(true) - $t0, $r));
$r2 = robixhost_CreateAccount($params);
eq('success', $r2, 'repeating CreateAccount (simulated timeout/retry) is idempotent: ' . $r2);

$c = robixhost_client($params);
$svc = $c->getService($serviceId);
eq('Running', $svc['powerState'], 'hypervisor reports Running');
eq(1, count($svc['ipAddresses']), 'exactly one IP allocated despite two create calls');
eq('svc' . $serviceId, $svc['vmName'], 'VM named from the service id');
$vmName = $svc['vmName']; $ip = $svc['ipAddresses'][0];
echo "      vm=$vmName ip=$ip\n";

echo "== suspend / unsuspend ==\n";
eq('success', robixhost_SuspendAccount($params), 'SuspendAccount succeeds');
$svc = $c->getService($serviceId);
eq('Stopped', $svc['powerState'], 'hypervisor confirms the VM is stopped');
eq(true, $svc['suspended'], 'service flagged suspended');
eq('success', robixhost_UnsuspendAccount($params), 'UnsuspendAccount succeeds');
$svc = $c->getService($serviceId);
eq('Running', $svc['powerState'], 'hypervisor confirms the VM is running again');
eq(false, $svc['suspended'], 'suspended flag cleared');
eq('success', robixhost_syncstatus($params), 'manual "Sync status" button succeeds');

echo "== unknown service ==\n";
$r = robixhost_SuspendAccount(array_merge($params, ['serviceid' => '999999999']));
check(strpos($r, 'No VM is mapped') !== false, "suspend of an unknown service fails clearly: $r");

echo "== termination ==\n";
eq('success', robixhost_TerminateAccount($params), 'TerminateAccount succeeds');
try { $c->getService($serviceId); check(false, 'service must no longer resolve after termination'); }
catch (RobixHostException $e) { eq('notfound.service', $e->apiCode, 'service no longer resolves after termination'); }
eq('success', robixhost_TerminateAccount($params), 'repeating TerminateAccount (lost response / retry) is idempotent');
eq('success', robixhost_TerminateAccount(array_merge($params, ['serviceid' => '424242424'])), 'terminating a service that never had a VM succeeds (customer cancels after failed provisioning)');
echo "      (disk retention and purge are verified by run_e2e.sh against the filesystem)\n";
file_put_contents(sys_get_temp_dir() . '/robix_e2e_vm.txt', $vmName . "\n" . $ip . "\n");

echo "== secrets ==\n";
$all = implode("\n", $logs);
check(strpos($all, $secret) === false, 'the shared secret never appears in any logged request/response');
check(strpos($all, bin2hex($key)) === false, 'the secret (hex) never appears in logs either');

echo "\nTOTAL: $passed passed, $failed failed\n";
exit($failed === 0 ? 0 : 1);
