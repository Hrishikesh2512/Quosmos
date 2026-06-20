# User Guide

Welcome to Quosmos. This guide walks through every module. The golden rule: **touch the controls**. Everything updates live.

## Getting around

- **Sidebar** — switch modules, grouped into Foundations, Protocols, Algorithms and Learn.
- **Workspace tabs** — each opened module gets a tab along the top; close with the ✕.
- **Command palette** — press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> to jump anywhere or run a command.
- **Tutor** — the 🎓 button (top-right) opens a contextual explanation panel for the active module.
- **Backend badge** — shows **Qiskit** when the Python backend is connected, otherwise **Local**.
- **Undo / Redo** — <kbd>Ctrl Z</kbd> / <kbd>Ctrl Shift Z</kbd> across the circuit editor.

## 1. Bloch Sphere Explorer 🪐

A 3D single-qubit state on the unit sphere.

- **Drag** to rotate, **scroll** to zoom, **right-drag** to pan.
- Click **X, Y, Z, H, S, T** to apply a gate — the arrow animates to its new orientation.
- Set the **rotation angle** slider, then apply **RX / RY / RZ** for arbitrary rotations.
- The right panel shows probabilities, Bloch coordinates (x, y, z), θ/φ, amplitudes and the live state equation.
- **Undo** the last gate, **reset** to |0⟩, or take a **screenshot** (📷).

## 2. Qubit Sandbox 🎛️

Sculpt any pure state directly.

- Drag **θ** (polar) and **φ** (azimuth) sliders, or pick a **preset** (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩).
- Watch the Bloch sphere, Dirac notation, state vector, probabilities and coordinates update together.

## 3. Circuit Builder 🧩

A drag-and-drop multi-qubit editor.

- **Drag a gate** from the palette onto any wire/column. Two-qubit gates (CX, CZ, SWAP) auto-span adjacent wires.
- **Drag a placed gate** to move it; **click** to select, then **Duplicate** or **Delete**.
- Select a rotation gate to reveal its **angle slider**.
- **＋ / －** add or remove qubits; **🗑** clears; **↶ / ↷** undo/redo.
- **Templates**: load Bell, Grover, QFT-3 or Teleport in one click.
- **Results**: live statevector (with amplitude bars + phase dials), Dirac notation, and a measurement histogram you can scale by **shots**.
- **Export** to OpenQASM or Qiskit (copy, download, or **Save project**).
- **Import** OpenQASM by pasting into the import box.

## 4. Entanglement Lab 🔗

- Pick one of the four **Bell states** (Φ⁺, Ψ⁺, Φ⁻, Ψ⁻).
- See the statevector and the live **correlation coefficient**, **agreement %**, histogram, and a streaming list of measurement outcomes (green = correlated, pink = anti).

## 5. Superdense Coding 📡

Send two classical bits with one qubit.

- Step through: share Bell pair → choose message → encode → send → decode.
- Choose the **2-bit message**; see Alice's encoding (I/X/Z/ZX), the evolving quantum state, the circuit timeline, and Bob's recovered bits.

## 6. Quantum Teleportation ✨

- Set the **source state** with θ/φ sliders.
- Step through preparation, Bell pair, Bell measurement, classical send and reconstruction.
- Compare **Alice's source** and **Bob's reconstructed** qubit on two Bloch spheres; the **fidelity** confirms a perfect transfer regardless of the random measurement outcomes.

## 7. Double-Slit Laboratory 🌊

- Adjust **slit width**, **separation**, **wavelength** and **detector distance**.
- Watch particles accumulate into an interference pattern; the intensity curve is overlaid.
- Toggle **Which-path** observation mode to collapse the superposition — the fringes vanish.
- Pause/resume the beam; read the fringe spacing Δy = λL/d.

## 8. Algorithms Gallery 🧠

Tabs for **Deutsch–Jozsa, Grover, QFT, Shor**.

- Each shows an interactive circuit, a **step-by-step** walkthrough with synced math and column highlighting, the statevector and the measurement outcome.
- Deutsch–Jozsa lets you swap the oracle (constant/balanced).
- Shor is a dedicated number-theory view: choose N and base a, see the period of aˣ mod N and the recovered factors.

## 9. Quantum Tutor 🎓

- A full topic browser plus an inline panel (🎓 button).
- Each topic gives a summary, key equation, concept bullets and FAQs.
- Ask a free-text question — answered locally, or via the backend if connected.

## 10. Quantum Challenges 🏆

- Solve puzzles like *Create a Bell state* or *Build a GHZ state*.
- Build your circuit, hit **Validate** (it checks the actual statevector up to global phase).
- Reveal **hints** if stuck; **progress is saved locally**.

## Saving your work

- **Save project** in the Circuit Builder stores the circuit in your browser (localStorage).
- **Export** downloads OpenQASM/Qiskit files.
- **Screenshots** capture the 3D views as PNG.

Everything persists locally between sessions — no account required.
