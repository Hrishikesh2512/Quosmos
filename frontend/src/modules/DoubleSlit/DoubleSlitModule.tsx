import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Slider, Button, SegmentedControl, Stat } from '@/components/ui/Primitives';
import { Math as TeX } from '@/components/ui/Math';

interface Params {
  slitWidth: number; // a
  slitSep: number; // d
  wavelength: number; // λ
  distance: number; // L (screen distance)
  observe: boolean;
}

/**
 * Far-field intensity at screen position y.
 * Two-slit pattern = single-slit envelope × interference term.
 * In observe mode the interference term is replaced by an incoherent sum, so
 * fringes vanish and only the two broad single-slit humps remain.
 */
function intensity(y: number, p: Params): number {
  const theta = Math.atan2(y, p.distance);
  const sinT = Math.sin(theta);
  const beta = (Math.PI * p.slitWidth * sinT) / p.wavelength;
  const env = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
  if (p.observe) {
    // incoherent: shift two single-slit envelopes by ±d/2 - no fringes
    const shift = (Math.PI * p.slitSep * sinT) / p.wavelength;
    return env * (1 + 0.0 * Math.cos(2 * shift)); // interference washed out
  }
  const alpha = (Math.PI * p.slitSep * sinT) / p.wavelength;
  return env * Math.cos(alpha) ** 2;
}

export function DoubleSlitModule() {
  const [params, setParams] = useState<Params>({
    slitWidth: 12,
    slitSep: 60,
    wavelength: 24,
    distance: 380,
    observe: false,
  });
  const [particles, setParticles] = useState(0);
  const impactsRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [running, setRunning] = useState(true);

  const set = <K extends keyof Params>(k: K, v: Params[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  // Precompute normalised distribution + CDF for sampling impacts.
  const { ys, cdf, peak } = useMemo(() => {
    const H = 460;
    const ys: number[] = [];
    const pdf: number[] = [];
    let peak = 0;
    for (let i = 0; i < H; i++) {
      const y = i - H / 2;
      const v = intensity(y, params);
      ys.push(y);
      pdf.push(v);
      peak = Math.max(peak, v);
    }
    const total = pdf.reduce((a, b) => a + b, 0);
    const cdf: number[] = [];
    let acc = 0;
    for (const v of pdf) {
      acc += v / total;
      cdf.push(acc);
    }
    return { ys, cdf, peak };
  }, [params]);

  // Reset impacts whenever physics changes.
  useEffect(() => {
    impactsRef.current = [];
    setParticles(0);
  }, [params]);

  // Animation loop: emit particles + draw.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const sample = (): number => {
      const r = Math.random();
      let lo = 0;
      let hi = cdf.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      return ys[lo];
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(5,6,15,0.35)';
      ctx.fillRect(0, 0, W, H);

      // wave field (left region) - animated phase ripples
      const t = performance.now() / 600;
      for (let x = 0; x < W * 0.5; x += 6) {
        for (let y = 0; y < H; y += 6) {
          const cy = y - H / 2;
          const d1 = Math.hypot(x - W * 0.5, cy - params.slitSep / 2);
          const d2 = Math.hypot(x - W * 0.5, cy + params.slitSep / 2);
          const wave =
            Math.cos((2 * Math.PI * d1) / params.wavelength - t) +
            (params.observe ? 0 : Math.cos((2 * Math.PI * d2) / params.wavelength - t));
          const a = ((wave + 2) / 4) * 0.4;
          ctx.fillStyle = `rgba(34,211,238,${a})`;
          ctx.fillRect(x, y, 5, 5);
        }
      }

      // barrier with slits
      ctx.fillStyle = '#1e2360';
      const bx = W * 0.5;
      ctx.fillRect(bx - 3, 0, 6, H);
      ctx.clearRect(bx - 3, H / 2 - params.slitSep / 2 - params.slitWidth / 2, 6, params.slitWidth);
      ctx.clearRect(bx - 3, H / 2 + params.slitSep / 2 - params.slitWidth / 2, 6, params.slitWidth);

      // intensity curve on the right
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(167,139,250,0.9)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < ys.length; i++) {
        const v = intensity(ys[i], params) / (peak || 1);
        const px = W - 8 - v * (W * 0.18);
        const py = ys[i] + H / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // particle impacts
      ctx.fillStyle = 'rgba(251,191,36,0.85)';
      for (const y of impactsRef.current) {
        const px = W * 0.78 + (Math.random() - 0.5) * 4;
        ctx.fillRect(px, y + H / 2, 2, 2);
      }
    };

    const tick = () => {
      if (running) {
        for (let i = 0; i < 4; i++) {
          impactsRef.current.push(sample());
        }
        if (impactsRef.current.length > 6000) impactsRef.current.splice(0, 4);
        setParticles((n) => n + 4);
      }
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [cdf, ys, peak, params, running]);

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Panel
        title="Interference field"
        subtitle="Source → barrier → screen. Each dot is one particle landing."
        className="min-h-[480px]"
      >
        <canvas ref={canvasRef} width={720} height={460} className="w-full rounded-xl bg-void" />
      </Panel>

      <div className="space-y-4">
        <Panel title="Observation mode">
          <SegmentedControl
            value={params.observe ? 'on' : 'off'}
            onChange={(v) => set('observe', v === 'on')}
            options={[
              { value: 'off', label: '🌊 Unobserved' },
              { value: 'on', label: '👁 Which-path' },
            ]}
          />
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {params.observe
              ? 'A which-path detector measures each particle. Superposition collapses - the fringes vanish and you see two broad bands.'
              : 'No measurement. Each particle interferes with itself, building up the characteristic interference fringes.'}
          </p>
        </Panel>

        <Panel title="Controls">
          <div className="space-y-3">
            <Slider label="Slit width a" value={params.slitWidth} min={4} max={40} step={1} display={`${params.slitWidth}px`} onChange={(v) => set('slitWidth', v)} />
            <Slider label="Slit separation d" value={params.slitSep} min={20} max={140} step={1} display={`${params.slitSep}px`} onChange={(v) => set('slitSep', v)} />
            <Slider label="Wavelength λ" value={params.wavelength} min={8} max={60} step={1} display={`${params.wavelength}`} onChange={(v) => set('wavelength', v)} />
            <Slider label="Detector distance L" value={params.distance} min={150} max={600} step={10} display={`${params.distance}`} onChange={(v) => set('distance', v)} />
          </div>
        </Panel>

        <Panel title="Statistics">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Particles" value={particles.toLocaleString()} accent="text-quantum-amber" />
            <Stat label="Fringe spacing" value={`${((params.wavelength * params.distance) / params.slitSep).toFixed(0)}px`} accent="text-quantum-cyan" />
          </div>
          <div className="mt-3 panel bg-black/20 p-3">
            <TeX tex={'\\Delta y = \\frac{\\lambda L}{d}'} display />
          </div>
          <Button className="mt-2 w-full" onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pause beam' : '▶ Resume beam'}
          </Button>
        </Panel>
      </div>
    </div>
  );
}
