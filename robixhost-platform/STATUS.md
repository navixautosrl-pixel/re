# RobixHost — STATUS

Last updated: 2026-10-21. Everything below was produced in a Linux sandbox **without /dev/kvm, Windows, WHMCS or NuGet access**.
"Verified" means a test actually ran here and passed. Anything else is labelled **UNVERIFIED**.

## Completed (and verified here unless noted)
- **Architecture decision** (docs/ARCHITECTURE.md, ADR-001): KVM/QEMU on a dedicated Ubuntu/Debian host behind `IVirtualizationProvider`; Hyper-V is a designed second provider only. The Windows app manages the host; it does not virtualise.
- **Brand**: generated original logo set (36 SVG, PNG, multi-size ICO, favicon, installer bitmaps) via `brand/build_brand.py`.
- **Backend**: .NET 8 API, SQLite store + migrations, PBKDF2 auth with lockout, RBAC, persistent job runner (idempotency keys, crash recovery, per-VM serialisation), IP pools with atomic allocation, audit log.
- **KVM/QEMU provider**: process + QMP control, state confirmed from the hypervisor (QMP / /proc, zombie-aware), terminate retains disks, purge requires the typed VM name and is audited.
- **Storage inspector** (new): `GET /api/v1/storage` reports virtual vs. real disk use via `qemu-img`, flags over-provisioning, lists retained disks, reports unreadable disks instead of hiding them. Does not probe formats (corrupt `.qcow2` is reported as an error, not as raw).
- **WHMCS module** (PHP): HMAC-signed requests, replay/stale/tamper rejection, provisioning-only API surface, waits for job success.
- **Client library + desktop logic layer** (platform-neutral): retry policy, session-expiry handling, view-models for login, shell, dashboard, VM list, audit, 7-step wizard, RO/EN localisation.
- **Host preflight script** (`host/preflight.sh`).

## Written but UNVERIFIED (never compiled/run: no Windows here)
- WPF Control Center (`desktop/RobixHost.ControlCenter`): app, composition root, dark/light themes, RO/EN toggle, sign-in, shell with 19-item navigation, dashboard, VM list with actions, audit log, create-VPS wizard, type-to-confirm dialog, toasts. Not in the main solution. The sign-in token is held in memory only (no DPAPI persistence yet). Sparkline control and several panels (storage, retained VMs) are not drawn yet.
- CI: `.github/workflows/windows-build.yml` compiles the WPF app and builds the installer on a Windows runner (never run; needs a GitHub repo).
- Installer: `installer/RobixHostControlCenter.iss` (Inno Setup) and `installer/build.ps1`. Installs the client only.
- `docs/HOST-INSTALL.md`: host install, upgrade and recovery procedures (not run on a real host).

## In progress
- Nothing running in the background.

## Blocked (cannot be done or checked in this environment)
- No `/dev/kvm`: VMs run under TCG emulation only. **KVM performance, hardware acceleration and guest devices are UNVERIFIED.**
- No Windows / WPF targeting pack: **WPF app cannot be built or run here — UNVERIFIED.**
- No Inno Setup / Windows: **installer UNVERIFIED.**
- No WHMCS install: **module inside a real WHMCS UNVERIFIED** (tested against a PHP harness that calls the module functions against the real API).
- No Windows guest images/licences: **Windows guests UNVERIFIED.**

## Not built yet
Backups, snapshots, monitoring history/alerts, automation (stub only), customers/plans/templates endpoints, wizard OS and access steps, cloud-init, logging module, update mechanism, SECURITY.md, systemd unit, backups. No HA or live migration is claimed.

## Tests passed
- `dotnet run --project tests/RobixHost.Tests`: **57 passed, 0 failed** (latest run; unit, integration, client, view-model, storage, live-against-real-API). Output: `artifacts/test-report.txt`.
- WHMCS end-to-end (`whmcs/tests/run_e2e.sh`): **ALL PASSED** (latest run).

## Tests failed / defects found
- **Open: intermittent failure, cause unknown.** In one full-suite run (1 of ~10), `[live] full lifecycle` failed: after a confirmed force-stop the VM row still read `Running`. It did not recur in 12 further runs. A diagnostic (toast messages) was added to the assertion. Not fixed; do not treat as resolved.
- Fixed during development (found by tests): junk backing image accepted; externally killed VM reported as Error; process still exiting after pidfile removal; flaky concurrent IP allocation; suspend/unsuspend race; wizard Back after a final job state; storage inspector reporting a corrupt qcow2 as a healthy raw disk.

## Next actions
1. Reproduce/diagnose the intermittent force-stop failure.
2. Compile and run the WPF app and installer on Windows; fix what breaks.
3. Docs: SECURITY.md; host systemd unit; admin password reset procedure.
4. Backups, monitoring history, automation.
5. Run everything on a real KVM host and a real WHMCS.
