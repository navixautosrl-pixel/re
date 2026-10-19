"""Verificare rapidă a mediului: python -m clipper.selfcheck  (cod de ieșire 1 dacă lipsește ceva obligatoriu)."""

from __future__ import annotations

import sys

from .tools import system_checks


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    failed = False
    for c in system_checks():
        mark = "OK " if c.ok else ("LIPSA" if c.required else "AVERT")
        print(f"[{mark}] {c.name}: {c.detail}")
        failed |= c.required and not c.ok
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
