"""Offline tutor knowledge base used by /tutor/explain.

Mirrors the frontend content so the API can answer without an external LLM. If
an LLM key is configured this module can be swapped for a model call, but the
default deployment is fully self-contained.
"""
from __future__ import annotations

KB: dict[str, dict] = {
    "bloch": {
        "summary": "Every pure single-qubit state is a point on the Bloch sphere. Poles are |0> and |1>; the equator holds equal superpositions distinguished by phase.",
        "faqs": {
            "phase": "Phase rotates the state around the Z axis. It does not change Z-basis probabilities but matters for interference.",
            "hadamard": "The Hadamard sends |0> to the +X pole — an equal superposition.",
            "rotation": "RX, RY and RZ rotate the state vector by an arbitrary angle about their axis.",
        },
    },
    "circuit": {
        "summary": "A circuit is a time-ordered sequence of gates on qubit wires, applied left to right to evolve the statevector.",
        "faqs": {
            "cnot": "CNOT flips the target if and only if the control is |1>. It is the key entangling gate.",
            "measure": "Measurement projects a qubit onto |0> or |1> with probability given by amplitude squared, then collapses it.",
        },
    },
    "entanglement": {
        "summary": "Entangled qubits share correlations stronger than anything classical. The four Bell states form a maximally-entangled basis.",
        "faqs": {
            "bell": "A Bell state is H on the first qubit followed by CNOT — perfectly correlated outcomes.",
            "correlation": "In |Phi+>, both qubits always agree in the Z basis: 00 or 11, never 01 or 10.",
        },
    },
    "teleportation": {
        "summary": "Teleportation moves an unknown state using a shared Bell pair and two classical bits; the source is destroyed by measurement.",
        "faqs": {
            "classical": "The two classical bits tell Bob which X/Z correction to apply. Without them his qubit is maximally mixed.",
        },
    },
    "algorithms": {
        "summary": "Quantum algorithms exploit superposition and interference for speedups: Deutsch-Jozsa, Grover, QFT and Shor.",
        "faqs": {
            "grover": "Grover reflects the state about the marked item and the mean, amplifying the target over ~sqrt(N) iterations.",
            "shor": "Shor reduces factoring to period finding of a^x mod N, solved efficiently with the QFT.",
        },
    },
}


def explain(module: str, question: str) -> str:
    entry = KB.get(module)
    if not entry:
        return "Open a module to get a contextual explanation. Try the interactive controls — every change updates the math and visuals live."
    q = question.lower()
    for key, answer in entry["faqs"].items():
        if key in q or any(w in answer.lower() for w in q.split() if len(w) > 4):
            return answer
    return entry["summary"] + " Experiment with the controls on the left to see it in action."
