#!/usr/bin/env bash
# End-to-end: starts the REAL RobixHost API (software-emulated QEMU, because this host may have no /dev/kvm), runs the
# WHMCS module against it, then checks the filesystem for disk retention and the purge safeguard.
#
#   whmcs/tests/run_e2e.sh            (from the repository root, after `dotnet build RobixHost.sln`)
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PORT="${E2E_PORT:-5199}"
WORK="$(mktemp -d /tmp/robix-e2e-XXXXXX)"
ADMIN_PW="E2e-Passw0rd-$(head -c6 /dev/urandom | od -An -tx1 | tr -d ' \n')"
API_LOG="$WORK/api.log"
fail=0

cleanup() {
  [ -n "${API_PID:-}" ] && kill "$API_PID" 2>/dev/null && wait "$API_PID" 2>/dev/null
  pkill -f "qemu-system-x86_64.*$WORK" 2>/dev/null
  rm -rf "$WORK"
}
trap cleanup EXIT

mkdir -p "$WORK/data/images/templates"
qemu-img create -f qcow2 "$WORK/data/images/templates/test-os.qcow2" 1G >/dev/null || { echo "qemu-img missing"; exit 2; }

export RobixHost__DataDir="$WORK/data"
export RobixHost__AllowSoftwareEmulation=true
export RobixHost__SuspendGracefulSeconds=3     # the test VM has no guest OS to honour ACPI; production default is 30
export RobixHost__BootstrapAdminPassword="$ADMIN_PW"
export ASPNETCORE_URLS="http://127.0.0.1:$PORT"
export DOTNET_ENVIRONMENT=Production
( cd "$ROOT" && exec dotnet run --no-build --project src/RobixHost.Api ) >"$API_LOG" 2>&1 &
API_PID=$!

for i in $(seq 1 60); do curl -fs "http://127.0.0.1:$PORT/health" >/dev/null 2>&1 && break; sleep 0.5; done
curl -fs "http://127.0.0.1:$PORT/health" >/dev/null || { echo "API did not start:"; tail -20 "$API_LOG"; exit 2; }

TOKEN=$(curl -fs -X POST "http://127.0.0.1:$PORT/api/v1/auth/login" -H 'Content-Type: application/json' \
        -d "{\"username\":\"admin\",\"password\":\"$ADMIN_PW\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
[ -n "$TOKEN" ] || { echo "login failed"; exit 2; }
POOL=$(curl -fs -X POST "http://127.0.0.1:$PORT/api/v1/ip-pools" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"name":"e2e","cidr":"192.0.2.0/28","gateway":"192.0.2.1"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')

php "$ROOT/whmcs/tests/e2e.php" 127.0.0.1 "$PORT" "$WORK/data/secrets/whmcs.secret" "$POOL" || fail=1

echo "== retention + purge safeguard (filesystem + admin API) =="
read -r VM < /tmp/robix_e2e_vm.txt 2>/dev/null
VMDIR="$WORK/data/vms/$VM"
ok() { if eval "$2"; then echo "PASS  $1"; else echo "FAIL  $1"; fail=1; fi; }
ok "terminate retained the disk file"           "[ -f '$VMDIR/disk0.qcow2' ]"
ok "retained marker present (spec.deleted-*)"   "ls '$VMDIR'/spec.deleted-*.json >/dev/null 2>&1"
ok "VM is gone from the inventory"              "! curl -fs -H 'Authorization: Bearer $TOKEN' 'http://127.0.0.1:$PORT/api/v1/vms/$VM' >/dev/null"
code() { curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:$PORT/api/v1/vms/$VM/purge" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$1"; }
ok "purge with wrong confirmation is refused (400)" "[ \"\$(code '{\"confirmName\":\"nope\"}')\" = 400 ]"
ok "purge without a token is refused (401)"     "[ \"\$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$PORT/api/v1/vms/$VM/purge -H 'Content-Type: application/json' -d '{\"confirmName\":\"$VM\"}')\" = 401 ]"
ok "refused purge deleted nothing"              "[ -f '$VMDIR/disk0.qcow2' ]"
ok "purge with the exact name succeeds (204)"   "[ \"\$(code '{\"confirmName\":\"$VM\"}')\" = 204 ]"
ok "retained data is gone after the purge"      "[ ! -d '$VMDIR' ]"
AUDIT=$(curl -fs -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:$PORT/api/v1/audit?limit=200")
ok "audit log recorded whmcs.create / whmcs.terminate / vm.purge" "echo '$AUDIT' | grep -q whmcs.create && echo '$AUDIT' | grep -q whmcs.terminate && echo '$AUDIT' | grep -q vm.purge"
ok "no admin password or secret in the API log" "! grep -q -e '$ADMIN_PW' -e \"\$(cat $WORK/data/secrets/whmcs.secret)\" '$API_LOG'"

echo; [ $fail -eq 0 ] && echo "E2E RESULT: ALL PASSED" || echo "E2E RESULT: FAILURES (see above)"
exit $fail
