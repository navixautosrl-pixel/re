# Host installation, upgrade and recovery

**Status: procedures below are written but UNVERIFIED on a real KVM host** (the dev sandbox has no /dev/kvm). The API, provider and tests were run only under software emulation.

## Requirements
Dedicated Ubuntu 22.04+/Debian 12+ server, CPU virtualization (VT-x/AMD-V) enabled in firmware, `qemu-system-x86`, `qemu-utils`, .NET 8 runtime. No public IPs or Windows licences are assumed.

## Install
1. Run `host/preflight.sh`. Fix every ERROR it reports (it changes nothing on the system).
2. Create a service user and data dir: `sudo useradd -r -m -d /var/lib/robixhost robixhost`; add it to the `kvm` group.
3. Publish the API: `dotnet publish src/RobixHost.Api -c Release -o /opt/robixhost` and copy it to the host.
4. Configure (`appsettings.json` / environment): `DataDir`, `VmRoot`. On first start the API creates the `admin` owner. Either set `BootstrapAdminPassword` (environment file readable only by root; it is never in the repo) or let it generate one into `DataDir/secrets/initial-admin.txt` (mode 0600). Sign in, change the password and delete that file. Terminate TLS in front of the API (reverse proxy); the Control Center refuses plain HTTP except for private addresses.
5. Run under systemd as `robixhost`. Check `GET /health`, then sign in from the Control Center.
6. WHMCS: see `whmcs/docs/README.md`; the shared secret is `secrets/whmcs.secret` (mode 0600).

## Upgrade
Stop the service, **back up `DataDir`** (see Recovery), replace `/opt/robixhost`, start. Migrations run automatically at start and are forward-only: restoring the backup is the rollback.
Running VMs are separate QEMU processes; check after the upgrade that the dashboard shows the expected VMs running.

## Recovery
- **Back up** while the API is stopped (or use `sqlite3 .backup`): `DataDir` (database, `secrets/`) and `VmRoot` (disks, specs). Nothing is backed up automatically yet — **the backup feature is not built.**
- **Restore:** stop the service, restore both directories with their original permissions, start, verify `/health` and the VM list.
- **Failed job:** jobs survive restarts; use Retry in the Jobs view. Terminated VMs keep disks until Purge (typed VM name required).
- **Lost admin password:** not recoverable through the API by design; a documented reset procedure is not written yet.
