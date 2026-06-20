import { ModuleId } from '@/store/useAppStore';

export interface TutorContent {
  title: string;
  summary: string;
  keyMath?: string;
  points: string[];
  faqs: { q: string; a: string }[];
}

/** Curated, offline-first tutor knowledge base keyed by module. */
export const TUTOR_CONTENT: Record<ModuleId, TutorContent> = {
  bloch: {
    title: 'The Bloch Sphere',
    summary:
      'Every pure single-qubit state is a point on the surface of a unit sphere. The poles are |0⟩ and |1⟩; the equator holds equal superpositions distinguished only by phase.',
    keyMath: '|\\psi\\rangle = \\cos\\tfrac{\\theta}{2}\\,|0\\rangle + e^{i\\phi}\\sin\\tfrac{\\theta}{2}\\,|1\\rangle',
    points: [
      'θ (polar angle) controls the |0⟩ vs |1⟩ probability.',
      'φ (azimuth) is the relative phase — invisible to a Z-measurement.',
      'X, Y, Z gates are 180° rotations about their axes.',
      'Rotation gates RX, RY, RZ rotate by an arbitrary angle.',
    ],
    faqs: [
      { q: 'phase', a: 'Phase φ rotates the state around the Z axis. It does not change measurement probabilities in the computational basis, but it matters for interference once you apply more gates.' },
      { q: 'hadamard', a: 'The Hadamard takes |0⟩ to the +X pole — an equal superposition. On the Bloch sphere it is a 180° rotation about the diagonal X+Z axis.' },
    ],
  },
  sandbox: {
    title: 'Qubit Sandbox',
    summary:
      'Dial in any pure state directly via its Bloch angles and watch the amplitudes, Dirac notation, probabilities and Bloch coordinates update together.',
    keyMath: 'P(0)=\\cos^2\\tfrac{\\theta}{2},\\quad P(1)=\\sin^2\\tfrac{\\theta}{2}',
    points: [
      'θ = 0 → |0⟩, θ = π → |1⟩, θ = π/2 → equator superposition.',
      'Amplitudes are complex; only their magnitudes squared are probabilities.',
      'Global phase is unobservable; relative phase is everything.',
    ],
    faqs: [
      { q: 'amplitude', a: 'Amplitudes are complex numbers α and β with |α|²+|β|²=1. Probabilities are |α|² and |β|².' },
    ],
  },
  circuit: {
    title: 'Quantum Circuits',
    summary:
      'A circuit is a time-ordered sequence of gates acting on qubit wires. Reading left to right, each column is applied in turn to evolve the statevector.',
    keyMath: '|\\psi_{out}\\rangle = U_n \\cdots U_2 U_1 |0\\rangle^{\\otimes n}',
    points: [
      'Single-qubit gates act on one wire; CX/CZ couple two wires.',
      'Measurement collapses a qubit and yields classical bits.',
      'Export to OpenQASM or Qiskit to run on real hardware.',
    ],
    faqs: [
      { q: 'cnot', a: 'CNOT flips the target qubit if and only if the control is |1⟩. It is the workhorse for creating entanglement.' },
      { q: 'measure', a: 'Measurement projects the state onto a basis outcome with probability given by the amplitude squared, then the state collapses to that outcome.' },
    ],
  },
  entanglement: {
    title: 'Entanglement',
    summary:
      'Entangled qubits share correlations stronger than anything classical. Measuring one instantly determines the statistics of the other, regardless of distance.',
    keyMath: '|\\Phi^+\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle + |11\\rangle)',
    points: [
      'The four Bell states form a maximally-entangled basis.',
      'Local measurements are random but perfectly correlated.',
      'No information travels faster than light — only correlations.',
    ],
    faqs: [
      { q: 'bell', a: 'A Bell state is created with a Hadamard followed by a CNOT. The two qubits become perfectly correlated.' },
      { q: 'correlation', a: 'In |Φ+⟩, both qubits always agree in the Z basis: you see 00 or 11 with equal probability, never 01 or 10.' },
    ],
  },
  superdense: {
    title: 'Superdense Coding',
    summary:
      'Using one pre-shared entangled pair, Alice transmits two classical bits to Bob by sending just a single qubit.',
    keyMath: '\\{I, X, Z, XZ\\} \\to \\{|\\Phi^+\\rangle,|\\Psi^+\\rangle,|\\Phi^-\\rangle,|\\Psi^-\\rangle\\}',
    points: [
      'Alice encodes 2 bits by applying I, X, Z, or ZX to her half.',
      'She sends her single qubit to Bob.',
      'Bob undoes the Bell circuit and measures both bits.',
    ],
    faqs: [
      { q: 'encode', a: 'Alice applies one of four Pauli operations to map the shared Bell pair into one of the four orthogonal Bell states.' },
    ],
  },
  teleportation: {
    title: 'Quantum Teleportation',
    summary:
      'An unknown qubit state is transferred from Alice to Bob using a shared Bell pair and two classical bits — the original is destroyed by measurement.',
    keyMath: '|\\psi\\rangle\\,|\\Phi^+\\rangle \\to \\text{(measure)} \\to X^{m_2}Z^{m_1}|\\psi\\rangle',
    points: [
      'No cloning: the source qubit is consumed.',
      'Bell measurement entangles source with Alice’s half.',
      'Bob applies X/Z corrections based on 2 classical bits.',
    ],
    faqs: [
      { q: 'classical', a: 'The two classical bits from Alice’s measurement tell Bob which of four corrections to apply. Without them his qubit is maximally mixed.' },
    ],
  },
  'double-slit': {
    title: 'Wave–Particle Duality',
    summary:
      'Single particles build up an interference pattern over time — yet each lands as a point. Observing which slit they pass through destroys the interference.',
    keyMath: 'I(y) \\propto \\cos^2\\!\\left(\\frac{\\pi d \\sin\\theta}{\\lambda}\\right)',
    points: [
      'Wavelength and slit separation set the fringe spacing.',
      'Probability amplitude, not intensity, is what interferes.',
      'Which-path information collapses the superposition.',
    ],
    faqs: [
      { q: 'observe', a: 'Turning on the detector measures which slit each particle takes. That measurement collapses the superposition, so the interference fringes vanish and you get two bands.' },
    ],
  },
  algorithms: {
    title: 'Quantum Algorithms',
    summary:
      'Quantum algorithms exploit superposition and interference to solve certain problems faster than any classical method.',
    keyMath: '\\text{Grover: } O(\\sqrt N) \\quad \\text{vs classical } O(N)',
    points: [
      'Deutsch–Jozsa: one query distinguishes constant vs balanced.',
      'Grover: quadratic speedup for unstructured search.',
      'QFT: the engine behind phase estimation and Shor.',
      'Shor: exponential speedup for integer factoring.',
    ],
    faqs: [
      { q: 'grover', a: 'Grover repeatedly reflects the state about the marked item and the mean, amplifying the target amplitude. After ~√N iterations a measurement returns it with high probability.' },
      { q: 'shor', a: 'Shor reduces factoring to finding the period of a^x mod N. The quantum part finds that period efficiently with the QFT; the rest is classical number theory.' },
    ],
  },
  tutor: {
    title: 'Quantum Tutor',
    summary: 'I provide contextual explanations for whatever module you are exploring. Open any module and ask away.',
    points: ['Switch modules to change my context.', 'Ask about gates, states, measurement or any concept.'],
    faqs: [],
  },
  challenges: {
    title: 'Quantum Challenges',
    summary:
      'Hands-on puzzles that validate your circuit against a target state or behaviour. Earn progress as you master each concept.',
    points: [
      'Build the requested state or transformation.',
      'Use hints if you get stuck — they cost nothing.',
      'Validation checks the actual statevector, not just the gates.',
    ],
    faqs: [
      { q: 'hint', a: 'Hints reveal the next constructive step without giving away the full solution. Your progress is saved locally.' },
    ],
  },
};
