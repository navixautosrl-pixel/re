#!/usr/bin/env python3
"""Sample size and duration for a two-variant conversion-rate A/B test.

Two-sided two-proportion z-test (normal approximation), equal allocation:
    n per variant = (z_{1-α/2}·√(2·p̄·(1-p̄)) + z_{1-β}·√(p1(1-p1) + p2(1-p2)))² / (p2 - p1)²
with p1 = baseline rate, p2 = p1·(1 + relative MDE), p̄ = (p1 + p2) / 2.

Usage:
    python3 sample_size.py --baseline 0.03 --mde 0.2 [--alpha 0.05] [--power 0.8] [--weekly-visitors 2000] [--variants 2]
Stdlib only (statistics.NormalDist).
"""
import argparse
import math
from statistics import NormalDist


def n_per_variant(p1: float, rel_mde: float, alpha: float = 0.05, power: float = 0.8) -> int:
    p2 = p1 * (1 + rel_mde)
    if not (0 < p1 < 1 and 0 < p2 < 1):
        raise ValueError("baseline and baseline*(1+mde) must be between 0 and 1")
    z_a = NormalDist().inv_cdf(1 - alpha / 2)
    z_b = NormalDist().inv_cdf(power)
    p_bar = (p1 + p2) / 2
    num = (z_a * math.sqrt(2 * p_bar * (1 - p_bar)) + z_b * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    return math.ceil(num / (p2 - p1) ** 2)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--baseline", type=float, required=True, help="current conversion rate, e.g. 0.03")
    ap.add_argument("--mde", type=float, required=True, help="minimum detectable RELATIVE lift, e.g. 0.2 = +20%%")
    ap.add_argument("--alpha", type=float, default=0.05)
    ap.add_argument("--power", type=float, default=0.8)
    ap.add_argument("--variants", type=int, default=2)
    ap.add_argument("--weekly-visitors", type=float, help="eligible visitors per week entering the test")
    a = ap.parse_args()

    n = n_per_variant(a.baseline, a.mde, a.alpha, a.power)
    total = n * a.variants
    print(f"baseline {a.baseline:.2%} → target {a.baseline * (1 + a.mde):.2%} (relative +{a.mde:.0%})")
    print(f"alpha {a.alpha}, power {a.power}: {n:,} visitors per variant, {total:,} total")
    if a.weekly_visitors:
        weeks = total / a.weekly_visitors
        print(f"at {a.weekly_visitors:,.0f} visitors/week: {weeks:.1f} weeks (round up to whole weeks: {math.ceil(weeks)})")
        if weeks > 8:
            print("VERDICT: too little traffic for a valid test of this effect size — use qualitative research or test a bolder change.")
        else:
            print("VERDICT: feasible. Fix the duration now and do not stop early.")


if __name__ == "__main__":
    main()
