/**
 * Minimal but complete complex-number implementation used throughout the
 * client-side quantum engine. Values are immutable; every operation returns a
 * new Complex.
 */
export class Complex {
  constructor(
    public readonly re: number,
    public readonly im: number = 0,
  ) {}

  static readonly ZERO = new Complex(0, 0);
  static readonly ONE = new Complex(1, 0);
  static readonly I = new Complex(0, 1);

  static from(value: number | Complex): Complex {
    return value instanceof Complex ? value : new Complex(value, 0);
  }

  /** e^{i·phase} */
  static polar(magnitude: number, phase: number): Complex {
    return new Complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }

  add(o: Complex): Complex {
    return new Complex(this.re + o.re, this.im + o.im);
  }

  sub(o: Complex): Complex {
    return new Complex(this.re - o.re, this.im - o.im);
  }

  mul(o: Complex | number): Complex {
    const c = Complex.from(o);
    return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
  }

  scale(s: number): Complex {
    return new Complex(this.re * s, this.im * s);
  }

  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  /** Squared magnitude |z|^2 - the measurement probability weight. */
  abs2(): number {
    return this.re * this.re + this.im * this.im;
  }

  abs(): number {
    return Math.hypot(this.re, this.im);
  }

  /** Argument in radians, in (-π, π]. */
  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  equals(o: Complex, eps = 1e-9): boolean {
    return Math.abs(this.re - o.re) < eps && Math.abs(this.im - o.im) < eps;
  }

  /** Human-readable form such as `0.707`, `-0.5i`, or `0.5+0.5i`. */
  toString(precision = 3): string {
    const r = round(this.re, precision);
    const i = round(this.im, precision);
    if (i === 0) return `${r}`;
    if (r === 0) return `${i}i`;
    return `${r}${i >= 0 ? '+' : ''}${i}i`;
  }
}

function round(x: number, precision: number): number {
  const f = 10 ** precision;
  return Math.round(x * f) / f;
}
