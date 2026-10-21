# RobixHost provisioning module for WHMCS

WHMCS keeps billing, invoices and payments. RobixHost keeps virtualization, resource allocation, provisioning and service
state. The module is a standard WHMCS **provisioning (server) module** using the documented interfaces
(<https://developers.whmcs.com/provisioning-modules/>).

**Compatibility:** written for WHMCS 7.10+ / 8.x on PHP 7.2+. It has been run against the real RobixHost API (see
"Verification") but **not yet inside a real WHMCS installation**: do that on a non-production WHMCS first.

## What it does, and what it deliberately does not

| WHMCS action | Result | Notes |
|---|---|---|
| Create | Provisions a VPS from the product config | Returns `success` **only after RobixHost reports the job succeeded**. Repeating it never creates a second VM or IP |
| Suspend | Stops the VM, marks it suspended (cannot be started while suspended) | Graceful ACPI shutdown, then forced stop after the configured timeout |
| Unsuspend | Clears the flag and starts the VM | |
| Terminate | Stops and removes the VM, releases its IP, **retains the disk** | Idempotent; succeeds for services that never got a VM. Freeing disk space is a separate administrator action on RobixHost (`purge`, requires typing the VM name) |
| Test Connection | Verifies reachability **and** the shared secret | Uses a signed no-op request; no side effects |
| Sync status button | Pulls the **hypervisor's** real state and writes the IP into the service | |

**Not implemented** (so WHMCS hides these instead of faking them): change password, change package/resources, renew,
reinstall, and guest credential generation. The module never creates, stores, logs or emails guest passwords.
Connection information delivered to the customer is the service's dedicated IP (`{$service_dedicated_ip}` in WHMCS email templates).

If a job outlives the wait window (default 25 s, max 50 s), the module returns an explanatory error instead of
`success`; WHMCS keeps the service in its previous state, the job continues on the host, and **Sync status** confirms it.
Windows guests and slow ACPI shutdowns are the realistic cause.

## Installation

1. **On the RobixHost server**: ensure the API is reachable from WHMCS over HTTPS (reverse proxy with a real certificate; do not expose it publicly beyond what WHMCS needs). Read the shared secret:
   `sudo cat /var/lib/robixhost/secrets/whmcs.secret` (a base64 string).
2. **Copy the module**: `modules/servers/robixhost/` into WHMCS at `<whmcs>/modules/servers/robixhost/`.
3. **Add the server**: *System Settings → Products/Services → Servers → Add New Server*:
   * Hostname: the RobixHost API host name · Type: **RobixHost VPS** · tick **Secure** (TLS) · set the port
   * **Password**: the base64 shared secret · leave Username/Access Hash empty
   * Click **Test Connection**. Success means reachable **and** secret accepted; the error text says which it is.
   Plain HTTP is accepted only for loopback/private addresses.
4. **Create the product**: *Products/Services → Create New Product → Module Settings → RobixHost VPS*.
   Set the defaults (vCPU, RAM MB, disk GB, default OS template, IP pool ID). Tick **Automatically setup the product as soon as the first payment is received**.
5. **Configurable options (optional)** named `CPU`, `RAM`, `Disk`, `OS` (the text before any `|` is matched, case-insensitively). `OS` values must be template keys, i.e. files `<ImageRoot>/templates/<key>.qcow2` on the host.
6. **Templates**: put a `qcow2` image at `<ImageRoot>/templates/<key>.qcow2`. Raw images are refused (a raw file cannot be verified as a disk image); convert with `qemu-img convert -O qcow2`.
   **Windows templates**: you must supply installation media/images that you are licensed to use. RobixHost bundles none and licensing is not included.

## Security model

* Every call is signed `HMAC-SHA256(secret, "<unix-ts>.<nonce>.<body>")` and sent with `X-Robix-Timestamp`, `X-Robix-Nonce`, `X-Robix-Signature`. The server rejects bad signatures, timestamps older than 5 minutes (keep clocks in sync: NTP), and **replayed nonces**.
* The secret never travels and is never logged. TLS verification is never disabled. Redirects are not followed.
* The billing endpoints can only create/suspend/unsuspend/terminate and read job/service status. A compromised WHMCS secret cannot read the host, list other VMs or power-control arbitrary VMs.
* The order is authorised by WHMCS *after* its own payment and fraud checks; RobixHost does not accept a bare "this is paid" claim.
* Rotate the secret: delete `secrets/whmcs.secret`, restart the API (a new one is generated), update the WHMCS server entry.

## Verification (what was actually run)

`whmcs/tests/run_e2e.sh` starts the real API (QEMU under TCG, since the dev workspace has no KVM) and runs the module code against it:
connection tests (right/wrong/malformed secret), plain-HTTP refusal, replay/tamper/stale/missing-signature rejection,
local config validation, create + duplicate create (one VM, one IP), suspend/unsuspend with hypervisor confirmation,
unknown-service errors, idempotent terminate, disk retention, purge confirmation, audit trail, and absence of secrets in logs.
Last result: see `STATUS.md`.

Not verified: behaviour inside real WHMCS (hooks, email templates, Capsule write of the IP, admin button rendering).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Test Connection: "rejected the signature" | The server *Password* is not the contents of `secrets/whmcs.secret`, or the clocks differ by more than 5 minutes |
| "Refusing to send signed provisioning requests over plain HTTP" | Tick **Secure** on the WHMCS server (public address) or use a private address |
| "Cannot reach the RobixHost server" | Firewall / DNS / port; the API listens on `ASPNETCORE_URLS` |
| "Operating system '…' is not mapped to a template" | No `<ImageRoot>/templates/<key>.qcow2`; check the `OS` option value |
| "Provisioning is still running (job …)" | Slow job; wait, then press **Sync status**. Repeating Create is safe |
| "Provisioning Failed at step '…' [provider.no_kvm]" | The host has no usable KVM; see the host preflight report |
| Service shows Active but VM missing | **Sync status** reports `Missing`; check the host before acting |
| WHMCS module log | *Utilities → Logs → Module Log*: requests and responses are logged without secrets |
