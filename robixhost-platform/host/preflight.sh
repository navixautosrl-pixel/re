#!/usr/bin/env bash
# RobixHost host pre-installation assessment.
#
# READ-ONLY: this script changes nothing on the machine (no packages, no partitions, no network config, no services).
# It reports what it finds in plain language, with the exact next step for every problem.
#
#   sudo ./preflight.sh                 human-readable report
#   ./preflight.sh --json               machine-readable (used by the Control Center "System Diagnostics")
#   exit code: 0 = ready, 1 = ready with warnings, 2 = NOT ready (at least one blocker)
set -u
JSON=0; [ "${1:-}" = "--json" ] && JSON=1

BLOCKERS=(); WARNINGS=(); OKS=(); FACTS=()
ok()      { OKS+=("$1"); }
warn()    { WARNINGS+=("$1"); }
block()   { BLOCKERS+=("$1"); }
fact()    { FACTS+=("$1"); }

# ---- OS -------------------------------------------------------------------------------------------------------------
if [ -r /etc/os-release ]; then . /etc/os-release; OSN="${PRETTY_NAME:-unknown}"; else OSN="unknown"; ID=""; VERSION_ID=""; fi
fact "os=$OSN"; fact "kernel=$(uname -r)"; fact "arch=$(uname -m)"
case "$(uname -m)" in x86_64) ok "CPU architecture x86_64";; *) block "Architecture $(uname -m) is not supported (x86_64 required). Next step: use an x86_64 host.";; esac
case "$ID:$VERSION_ID" in
  ubuntu:22.04|ubuntu:24.04|debian:12|debian:13) ok "Host OS $OSN is a supported target";;
  *) warn "Host OS '$OSN' is not one of the tested targets (Ubuntu 22.04/24.04, Debian 12/13). It may work but is unsupported.";;
esac

# ---- privileges -----------------------------------------------------------------------------------------------------
if [ "$(id -u)" -eq 0 ]; then ok "Running as root (needed to install; the RobixHost service itself runs as an unprivileged user)"
else warn "Not running as root: some checks (disk SMART, firewall rules) are skipped. Re-run with sudo for a complete report."; fi

# ---- CPU virtualisation ---------------------------------------------------------------------------------------------
if grep -Eq '(vmx|svm)' /proc/cpuinfo; then
  VIRT=$(grep -Eo -m1 '(vmx|svm)' /proc/cpuinfo); ok "CPU virtualization extensions present ($VIRT)"; fact "cpu_virt=$VIRT"
else
  fact "cpu_virt=none"
  if grep -qi hypervisor /proc/cpuinfo; then
    block "No hardware virtualization is visible, and this machine is itself a virtual machine. Next step: enable nested virtualization on the parent hypervisor (VT-x/AMD-V passthrough), or use a bare-metal host."
  else
    block "CPU virtualization extensions (Intel VT-x / AMD-V) are not available. Next step: enable them in the BIOS/UEFI (often called 'Intel Virtualization Technology' or 'SVM Mode')."
  fi
fi
if [ -e /dev/kvm ]; then
  if [ -r /dev/kvm ] && [ -w /dev/kvm ]; then ok "/dev/kvm exists and is accessible"
  else warn "/dev/kvm exists but is not accessible to this user. Next step: add the RobixHost service user to the 'kvm' group."; fi
else
  block "/dev/kvm does not exist, so VMs cannot use hardware acceleration. Next step: load the kvm_intel/kvm_amd module ('modprobe kvm_intel' or 'kvm_amd'); if that fails see the CPU message above."
fi
CPUS=$(nproc); fact "logical_cpus=$CPUS"
[ "$CPUS" -ge 4 ] && ok "$CPUS logical CPUs" || warn "Only $CPUS logical CPUs: not enough to host customer VPS plans comfortably (4+ recommended)."

# ---- memory ---------------------------------------------------------------------------------------------------------
MEM_MB=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo); fact "mem_total_mb=$MEM_MB"
if   [ "$MEM_MB" -ge 16000 ]; then ok "${MEM_MB} MB RAM"
elif [ "$MEM_MB" -ge 8000 ];  then warn "${MEM_MB} MB RAM: workable for a lab, but leaves little for customer VMs (16 GB+ recommended; keep ~2 GB for the host)."
else block "${MEM_MB} MB RAM is too little to host VMs. Next step: 8 GB absolute minimum, 16 GB+ recommended."; fi
SWAP_MB=$(awk '/SwapTotal/ {printf "%d", $2/1024}' /proc/meminfo); fact "swap_mb=$SWAP_MB"

# ---- disk -----------------------------------------------------------------------------------------------------------
TARGET="${ROBIX_DATA_DIR:-/var/lib/robixhost}"; CHECK="$TARGET"; while [ ! -d "$CHECK" ] && [ "$CHECK" != "/" ]; do CHECK=$(dirname "$CHECK"); done
FREE_GB=$(df -BG --output=avail "$CHECK" | tail -1 | tr -dc '0-9'); FSTYPE=$(df -T "$CHECK" | tail -1 | awk '{print $2}')
fact "data_dir=$TARGET"; fact "data_free_gb=$FREE_GB"; fact "data_fs=$FSTYPE"
if   [ "${FREE_GB:-0}" -ge 200 ]; then ok "${FREE_GB} GB free for VM storage at $TARGET ($FSTYPE)"
elif [ "${FREE_GB:-0}" -ge 60 ];  then warn "${FREE_GB} GB free at $TARGET: enough to start, small for production (200 GB+ recommended)."
else block "Only ${FREE_GB} GB free at $TARGET. Next step: mount a larger disk there (set ROBIX_DATA_DIR to change the location)."; fi
case "$FSTYPE" in ext4|xfs|btrfs|zfs) ok "Filesystem $FSTYPE suits disk images";; tmpfs|overlay) warn "Filesystem '$FSTYPE' is not persistent or not suited to disk images.";; esac
ROT=0; for d in /sys/block/*/queue/rotational; do [ -r "$d" ] && [ "$(cat "$d")" = 1 ] && ROT=1; done
[ "$ROT" = 1 ] && warn "A rotational (HDD) disk is present. VM performance on HDDs is poor under many tenants; use SSD/NVMe for customer storage."
if command -v smartctl >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
  for dev in $(lsblk -dno NAME,TYPE 2>/dev/null | awk '$2=="disk"{print "/dev/"$1}'); do
    smartctl -H "$dev" 2>/dev/null | grep -q "PASSED\|OK" && ok "SMART health OK for $dev" || warn "SMART health for $dev is not confirmed (unsupported or failing). Check 'smartctl -a $dev'."
  done
else warn "smartctl not available (or not root): disk health was NOT checked. Install smartmontools to enable it."; fi

# ---- tools ----------------------------------------------------------------------------------------------------------
for t in qemu-system-x86_64 qemu-img; do
  if command -v "$t" >/dev/null; then ok "$t found ($($t --version 2>/dev/null | head -1))"
  else block "$t is not installed. Next step: apt install qemu-system-x86 qemu-utils"; fi
done
[ -d /usr/share/OVMF ] || [ -d /usr/share/ovmf ] && ok "UEFI firmware (OVMF) present (needed for Windows 11 / Secure Boot guests)" || warn "OVMF not installed: UEFI guests unavailable. Next step: apt install ovmf"
command -v dotnet >/dev/null && ok "dotnet found ($(dotnet --version 2>/dev/null))" || warn "dotnet runtime not found: the installer will provide the self-contained build, no action needed if you use the release package."

# ---- existing virtualization / conflicts ----------------------------------------------------------------------------
for svc in libvirtd proxmox-ve pve-cluster virtualbox vboxdrv; do
  systemctl is-active --quiet "$svc" 2>/dev/null && warn "Service '$svc' is active. RobixHost does not need it and it may contend for /dev/kvm and bridges. Review before installing; RobixHost will NOT stop it for you."
done
lsmod 2>/dev/null | grep -q '^vboxdrv' && warn "VirtualBox kernel module is loaded; it conflicts with KVM on some kernels."
pgrep -x qemu-system-x86 >/dev/null 2>&1 && warn "QEMU processes are already running (not managed by RobixHost). They will be ignored, but check for resource contention."

# ---- network --------------------------------------------------------------------------------------------------------
DEFIF=$(ip route 2>/dev/null | awk '/^default/ {print $5; exit}'); fact "default_interface=${DEFIF:-none}"
if [ -n "$DEFIF" ]; then
  ok "Default network interface: $DEFIF ($(ip -4 -o addr show "$DEFIF" 2>/dev/null | awk '{print $4}' | head -1))"
  if [ -d "/sys/class/net/$DEFIF/wireless" ]; then warn "Default interface $DEFIF is Wi-Fi. Wi-Fi cannot be bridged for customer VMs; use a wired NIC."; fi
  ip -d link show "$DEFIF" 2>/dev/null | grep -q bridge && ok "$DEFIF is already a bridge"
else block "No default route: the host has no upstream network. Next step: configure networking before installing."; fi
BRIDGES=$(ip -br link show type bridge 2>/dev/null | awk '{print $1}' | tr '\n' ' '); fact "bridges=${BRIDGES:-none}"
[ -z "${BRIDGES// }" ] && warn "No network bridge exists. Customer VMs need a bridge (or routed network) to reach the internet. RobixHost will show you the exact change and will NOT modify networking without your confirmation."
[ "$(cat /proc/sys/net/ipv4/ip_forward 2>/dev/null)" = 1 ] && ok "IPv4 forwarding enabled" || warn "IPv4 forwarding is off; required only for routed/NAT networks."
echo "Reminder (not detectable from here): each VPS with its own public IP needs a routed subnet or extra IPs from your upstream provider. A single public IP cannot give every VPS an independent public address." >/dev/null

# ---- ports ----------------------------------------------------------------------------------------------------------
for port in 8443 8080; do
  if (ss -ltn 2>/dev/null || netstat -ltn 2>/dev/null) | awk '{print $4}' | grep -q ":$port$"; then warn "TCP port $port is already in use. Next step: choose another port in appsettings (RobixHost API) or stop the other service."
  else ok "TCP port $port is free"; fi
done
fact "api_exposure=bind to a private interface or VPN; never publish the management API directly to the internet"

# ---- output ---------------------------------------------------------------------------------------------------------
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
arr() { local first=1; printf '['; for x in "$@"; do [ $first = 0 ] && printf ','; printf '"%s"' "$(esc "$x")"; first=0; done; printf ']'; }
STATUS="ready"; EXIT=0
[ ${#WARNINGS[@]} -gt 0 ] && STATUS="ready_with_warnings" && EXIT=1
[ ${#BLOCKERS[@]} -gt 0 ] && STATUS="not_ready" && EXIT=2

if [ $JSON = 1 ]; then
  printf '{"status":"%s","blockers":' "$STATUS"; arr "${BLOCKERS[@]+"${BLOCKERS[@]}"}"
  printf ',"warnings":'; arr "${WARNINGS[@]+"${WARNINGS[@]}"}"
  printf ',"ok":'; arr "${OKS[@]+"${OKS[@]}"}"
  printf ',"facts":'; arr "${FACTS[@]+"${FACTS[@]}"}"; printf '}\n'
else
  echo "RobixHost pre-installation assessment (read-only; nothing was changed)"; echo "Host: $OSN"; echo
  for x in "${OKS[@]+"${OKS[@]}"}";      do echo "  [ OK ]    $x"; done
  for x in "${WARNINGS[@]+"${WARNINGS[@]}"}"; do echo "  [WARN]    $x"; done
  for x in "${BLOCKERS[@]+"${BLOCKERS[@]}"}"; do echo "  [BLOCK]   $x"; done
  echo; case $STATUS in
    ready) echo "RESULT: ready to install.";;
    ready_with_warnings) echo "RESULT: can install, but review the ${#WARNINGS[@]} warning(s) above first.";;
    not_ready) echo "RESULT: NOT ready. Fix the ${#BLOCKERS[@]} blocker(s) marked [BLOCK] first.";;
  esac
fi
exit $EXIT
