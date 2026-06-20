"""Classical period finding and factoring driving the Shor visualization."""
from __future__ import annotations

import math
import random
from typing import Optional


def find_period(a: int, N: int) -> int:
    if math.gcd(a, N) != 1:
        return 0
    value = a % N
    r = 1
    while value != 1:
        value = (value * a) % N
        r += 1
        if r > N:
            return 0
    return r


def factor(N: int, a: Optional[int] = None) -> dict:
    steps: list[str] = []
    if N % 2 == 0:
        return {"N": N, "a": 2, "period": 1, "factors": [2, N // 2], "steps": ["N is even."]}

    if a is None:
        candidates = [x for x in range(2, N) if math.gcd(x, N) == 1]
        a = random.choice(candidates) if candidates else 2

    g = math.gcd(a, N)
    if g != 1:
        return {"N": N, "a": a, "period": 0, "factors": [g, N // g], "steps": [f"gcd({a},{N})={g} - lucky guess."]}

    r = find_period(a, N)
    steps.append(f"Chose a={a}, coprime to N={N}.")
    steps.append(f"Period r={r} (quantum order finding): {a}^{r} ≡ 1 (mod {N}).")

    factors: Optional[list[int]] = None
    if r and r % 2 == 0:
        half = pow(a, r // 2, N)
        if half != N - 1:
            f1, f2 = math.gcd(half - 1, N), math.gcd(half + 1, N)
            steps.append(f"gcd({a}^(r/2)±1, N) = gcd({half-1},{N}), gcd({half+1},{N}).")
            for f in (f1, f2):
                if 1 < f < N:
                    factors = [f, N // f]
                    break
        else:
            steps.append("a^(r/2) ≡ -1 (mod N) - failure, retry.")
    else:
        steps.append("Period is odd - retry with a different a.")

    if factors:
        steps.append(f"Factors of {N}: {factors[0]} × {factors[1]}.")
    return {"N": N, "a": a, "period": r, "factors": factors, "steps": steps}
