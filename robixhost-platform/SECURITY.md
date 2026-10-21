# Security notes (current state, not a certification)

- Auth: PBKDF2-SHA256 (310k iterations), lockout after 5 failures, HMAC-signed expiring tokens, role-based permissions; every privileged action is audited.
- No credentials in the repo. The initial admin password comes from configuration or a generated 0600 file.
- WHMCS: separate provisioning-only API surface; HMAC-SHA256 over timestamp, nonce and body; 5-minute skew; replayed nonces rejected. Customers get no host-level functions.
- Clients: TLS verification is always on; plain HTTP is accepted only for loopback/private addresses.
- Destructive actions: terminate retains disks; purge requires the exact VM name, enforced server-side.
- Not done: independent security review, rate limiting beyond login lockout, secret rotation tooling, backup encryption (no backups yet). Report issues privately to the project owner.
