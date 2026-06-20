import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BlochVector } from '@/quantum/bloch';

/** Wireframe sphere with latitude/longitude rings. */
function SphereShell() {
  const rings = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    // longitudes
    for (let k = 0; k < 6; k++) {
      const phi = (k / 6) * Math.PI;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.sin(t) * Math.cos(phi), Math.cos(t), Math.sin(t) * Math.sin(phi)));
      }
      out.push(pts);
    }
    // latitudes
    for (let k = 1; k < 6; k++) {
      const theta = (k / 6) * Math.PI;
      const y = Math.cos(theta);
      const r = Math.sin(theta);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t)));
      }
      out.push(pts);
    }
    return out;
  }, []);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#4f5ae0"
          transparent
          opacity={0.07}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {rings.map((pts, i) => (
        <Line key={i} points={pts} color="#6b78f5" lineWidth={0.6} transparent opacity={0.25} />
      ))}
    </group>
  );
}

/** X/Y/Z axes with labels and the basis-state poles. */
function Axes() {
  const axes: { dir: [number, number, number]; color: string; label: string }[] = [
    { dir: [1.35, 0, 0], color: '#f472b6', label: 'x' },
    { dir: [0, 0, 1.35], color: '#34d399', label: 'y' },
    { dir: [0, 1.35, 0], color: '#22d3ee', label: 'z' },
  ];
  return (
    <group>
      {axes.map((a) => (
        <group key={a.label}>
          <Line
            points={[
              [-a.dir[0], -a.dir[1], -a.dir[2]],
              [a.dir[0], a.dir[1], a.dir[2]],
            ]}
            color={a.color}
            lineWidth={1}
            transparent
            opacity={0.6}
          />
          <Html position={a.dir} center>
            <span className="mono text-[10px]" style={{ color: a.color }}>
              {a.label}
            </span>
          </Html>
        </group>
      ))}
      <Html position={[0, 1.18, 0]} center>
        <span className="mono text-[11px] text-white">|0⟩</span>
      </Html>
      <Html position={[0, -1.18, 0]} center>
        <span className="mono text-[11px] text-white">|1⟩</span>
      </Html>
    </group>
  );
}

/** The animated state vector arrow. Bloch (x,y,z) maps to scene (x,z,y). */
function StateArrow({ target }: { target: BlochVector }) {
  const arrowRef = useRef<THREE.Group>(null);
  const current = useRef(new THREE.Vector3(0, 1, 0));
  const tipRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const goal = new THREE.Vector3(target.x, target.z, target.y);
    current.current.lerp(goal, 0.18);
    const v = current.current;
    const len = v.length() || 1e-6;
    if (arrowRef.current) {
      arrowRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        v.clone().normalize(),
      );
      arrowRef.current.scale.set(1, len, 1);
    }
    if (tipRef.current) tipRef.current.position.copy(v);
  });

  return (
    <group>
      <group ref={arrowRef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.05, 0.14, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh ref={tipRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function BlochScene({ vector }: { vector: BlochVector }) {
  return (
    <Canvas camera={{ position: [2.4, 1.6, 2.4], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={['#05060f']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={40} />
      <pointLight position={[-5, -3, -5]} intensity={15} color="#22d3ee" />
      <SphereShell />
      <Axes />
      <StateArrow target={vector} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={1.6} maxDistance={6} />
    </Canvas>
  );
}
