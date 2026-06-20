"""OpenQASM 2.0 import → JSON circuit schema (subset matching the editor)."""
from __future__ import annotations

import math
import re

from .models import Circuit, CircuitOp

_NAME_TO_GATE = {
    "x": "X", "y": "Y", "z": "Z", "h": "H", "s": "S", "sdg": "Sdg",
    "t": "T", "tdg": "Tdg", "rx": "RX", "ry": "RY", "rz": "RZ", "p": "P",
    "cx": "CX", "cz": "CZ", "swap": "SWAP",
}
_PARAM_GATES = {"RX", "RY", "RZ", "P"}


def _eval_angle(expr: str) -> float:
    norm = expr.lower().replace("pi", str(math.pi))
    if not re.fullmatch(r"[-+*/.()0-9\s]+", norm):
        try:
            return float(expr)
        except ValueError:
            return 0.0
    try:
        return float(eval(norm, {"__builtins__": {}}, {}))  # noqa: S307 - sanitised above
    except Exception:
        return 0.0


def from_qasm(source: str) -> Circuit:
    statements = [
        s.strip()
        for s in re.sub(r"//.*", "", source).replace("\n", ";").split(";")
        if s.strip()
    ]
    num_qubits = 0
    ops: list[CircuitOp] = []
    next_col: dict[int, int] = {}

    def col_for(qubits: list[int]) -> int:
        col = max((next_col.get(q, 0) for q in qubits), default=0)
        for q in qubits:
            next_col[q] = col + 1
        return col

    counter = 0
    for stmt in statements:
        if stmt.startswith(("OPENQASM", "include", "creg")):
            continue
        m = re.match(r"qreg\s+\w+\[(\d+)\]", stmt)
        if m:
            num_qubits = int(m.group(1))
            continue
        m = re.match(r"measure\s+\w+\[(\d+)\]", stmt)
        if m:
            q = int(m.group(1))
            ops.append(CircuitOp(id=f"op{counter}", gate="M", qubits=[q], column=col_for([q])))
            counter += 1
            continue
        m = re.match(r"(\w+)(?:\(([^)]*)\))?\s+(.+)", stmt)
        if not m:
            continue
        raw_name, raw_param, raw_args = m.groups()
        gate = _NAME_TO_GATE.get(raw_name)
        if not gate:
            continue
        qubits = [int(x) for x in re.findall(r"\w+\[(\d+)\]", raw_args)]
        param = _eval_angle(raw_param) if raw_param is not None and gate in _PARAM_GATES else None
        ops.append(CircuitOp(id=f"op{counter}", gate=gate, qubits=qubits, column=col_for(qubits), param=param))
        counter += 1

    if num_qubits == 0:
        num_qubits = max((q + 1 for op in ops for q in op.qubits), default=1)
    return Circuit(numQubits=num_qubits, ops=ops)
