import { useMemo, useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useProjectStore } from '@/store/useProjectStore';
import { GatePalette } from './GatePalette';
import { CircuitGrid } from './CircuitGrid';
import { Panel, Button, IconButton, Slider, SegmentedControl } from '@/components/ui/Primitives';
import { StateVectorView } from '@/components/ui/StateVectorView';
import { CountsChart } from '@/components/ui/CountsChart';
import { Math as TeX } from '@/components/ui/Math';
import { statevectorOf, measureStatistics } from '@/quantum/circuit';
import { toQASM, toQiskit, fromQASM } from '@/quantum/qasm';
import { isParametric } from '@/quantum/gates';
import { downloadText } from '@/lib/download';
import { bellState, grover2, qft, teleportation } from '@/quantum/algorithms';

const TEMPLATES = [
  { name: 'Bell', make: bellState },
  { name: 'Grover', make: grover2 },
  { name: 'QFT-3', make: () => qft(3) },
  { name: 'Teleport', make: teleportation },
];

export function CircuitBuilderModule() {
  const {
    present,
    setCircuit,
    addQubit,
    removeQubit,
    clear,
    undo,
    redo,
    canUndo,
    canRedo,
    shots,
    setShots,
    selectedOpId,
    setParam,
  } = useCircuitStore();
  const saveProject = useProjectStore((s) => s.saveProject);

  const [exportTab, setExportTab] = useState<'qasm' | 'qiskit'>('qasm');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const state = useMemo(() => statevectorOf(present), [present]);
  const counts = useMemo(() => measureStatistics(present, shots), [present, shots]);
  const exportText = useMemo(
    () => (exportTab === 'qasm' ? toQASM(present) : toQiskit(present)),
    [exportTab, present],
  );

  const selectedOp = present.ops.find((o) => o.id === selectedOpId);

  const doImport = () => {
    try {
      setCircuit(fromQASM(importText));
      setImportError('');
      setImportText('');
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 2xl:grid-cols-[280px_1fr_360px]">
      {/* Left: palette + tools */}
      <div className="space-y-4">
        <Panel title="Gate Palette" subtitle="Drag a gate onto a wire">
          <GatePalette />
        </Panel>

        <Panel title="Templates">
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <Button key={t.name} onClick={() => setCircuit(t.make())}>
                {t.name}
              </Button>
            ))}
          </div>
        </Panel>

        {selectedOp && isParametric(selectedOp.gate) && (
          <Panel title={`Edit ${selectedOp.gate}`}>
            <Slider
              label="Angle"
              value={selectedOp.param ?? 0}
              min={0}
              max={Math.PI * 2}
              display={`${((selectedOp.param ?? 0) / Math.PI).toFixed(2)}π`}
              onChange={(v) => setParam(selectedOp.id, v)}
            />
          </Panel>
        )}

        <Panel title="Import OpenQASM">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\nh q[0];\ncx q[0],q[1];'}
            className="scrollbar-thin h-28 w-full rounded-xl border border-white/10 bg-black/30 p-2 font-mono text-xs text-slate-200 outline-none focus:border-nebula-400"
          />
          {importError && <p className="mt-1 text-xs text-quantum-magenta">{importError}</p>}
          <Button onClick={doImport} variant="primary" className="mt-2 w-full">
            Import
          </Button>
        </Panel>
      </div>

      {/* Center: canvas */}
      <div className="space-y-4">
        <Panel
          title="Circuit"
          subtitle={`${present.numQubits} qubits · ${present.ops.length} ops`}
          actions={
            <>
              <IconButton label="Undo" onClick={undo} disabled={!canUndo()}>
                ↶
              </IconButton>
              <IconButton label="Redo" onClick={redo} disabled={!canRedo()}>
                ↷
              </IconButton>
              <IconButton label="Add qubit" onClick={addQubit}>
                ＋
              </IconButton>
              <IconButton label="Remove qubit" onClick={removeQubit}>
                －
              </IconButton>
              <IconButton label="Clear" onClick={clear}>
                🗑
              </IconButton>
            </>
          }
        >
          <CircuitGrid />
        </Panel>

        <Panel
          title="Export"
          actions={
            <SegmentedControl
              value={exportTab}
              onChange={setExportTab}
              options={[
                { value: 'qasm', label: 'OpenQASM' },
                { value: 'qiskit', label: 'Qiskit' },
              ]}
            />
          }
        >
          <pre className="scrollbar-thin max-h-56 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-xs text-slate-200">
            {exportText}
          </pre>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() =>
                downloadText(
                  exportTab === 'qasm' ? 'circuit.qasm' : 'circuit.py',
                  exportText,
                )
              }
            >
              ⬇ Download
            </Button>
            <Button onClick={() => navigator.clipboard?.writeText(exportText)}>📋 Copy</Button>
            <Button
              variant="primary"
              onClick={() =>
                saveProject({ name: `Circuit ${new Date().toLocaleTimeString()}`, module: 'circuit', circuit: present, notes: '' })
              }
            >
              💾 Save project
            </Button>
          </div>
        </Panel>
      </div>

      {/* Right: results */}
      <div className="space-y-4">
        <Panel title="Statevector" subtitle="Coherent state (measurements ignored)">
          <StateVectorView state={state} />
          <div className="mt-3 panel bg-black/20 p-3">
            <TeX tex={`|\\psi\\rangle = ${state.toDirac()}`} display />
          </div>
        </Panel>

        <Panel
          title="Measurement statistics"
          actions={<span className="chip mono">{shots} shots</span>}
        >
          <Slider label="Shots" value={shots} min={64} max={8192} step={64} display={`${shots}`} onChange={setShots} />
          <div className="mt-3">
            <CountsChart counts={counts} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
