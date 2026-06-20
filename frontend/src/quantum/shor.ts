/**
 * Classical period-finding + factoring helpers used to drive the Shor
 * visualization. The quantum subroutine (order finding) is illustrated; the
 * surrounding number theory runs classically here for didactic clarity.
 */

export function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

export function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod;
    exp >>= 1;
    base = (base * base) % mod;
  }
  return result;
}

/** Find the multiplicative order r of a mod N (smallest r with a^r ≡ 1). */
export function findPeriod(a: number, N: number): number {
  if (gcd(a, N) !== 1) return 0;
  let r = 1;
  let value = a % N;
  while (value !== 1) {
    value = (value * a) % N;
    r++;
    if (r > N) return 0;
  }
  return r;
}

export interface ShorResult {
  N: number;
  a: number;
  period: number;
  factors: [number, number] | null;
  sequence: number[];
  steps: string[];
}

/** Run the Shor pipeline for a chosen a, returning everything to visualize. */
export function runShor(N: number, a: number): ShorResult {
  const steps: string[] = [];
  const g = gcd(a, N);
  if (g !== 1) {
    return {
      N,
      a,
      period: 0,
      factors: [g, N / g],
      sequence: [],
      steps: [`gcd(${a}, ${N}) = ${g} ≠ 1 - lucky guess gives factors directly.`],
    };
  }
  const period = findPeriod(a, N);
  const sequence: number[] = [];
  for (let x = 0; x < Math.min(period + 1, 32); x++) sequence.push(modPow(a, x, N));
  steps.push(`Chose a = ${a}, coprime to N = ${N}.`);
  steps.push(`Period finding (quantum) gives r = ${period} since ${a}^${period} ≡ 1 (mod ${N}).`);

  let factors: [number, number] | null = null;
  if (period % 2 === 0) {
    const half = modPow(a, period / 2, N);
    if (half !== N - 1) {
      const f1 = gcd(half - 1, N);
      const f2 = gcd(half + 1, N);
      steps.push(`Compute gcd(${a}^{r/2} ± 1, N) = gcd(${half - 1}, ${N}) and gcd(${half + 1}, ${N}).`);
      if (f1 > 1 && f1 < N) factors = [f1, N / f1];
      else if (f2 > 1 && f2 < N) factors = [f2, N / f2];
    } else {
      steps.push(`a^{r/2} ≡ -1 (mod N) - failure, retry with a different a.`);
    }
  } else {
    steps.push(`Period r = ${period} is odd - retry with a different a.`);
  }
  if (factors) steps.push(`Factors of ${N}: ${factors[0]} × ${factors[1]}.`);
  return { N, a, period, factors, sequence, steps };
}

/** Candidate a values coprime to N, for the UI selector. */
export function coprimes(N: number): number[] {
  const out: number[] = [];
  for (let a = 2; a < N; a++) if (gcd(a, N) === 1) out.push(a);
  return out;
}
