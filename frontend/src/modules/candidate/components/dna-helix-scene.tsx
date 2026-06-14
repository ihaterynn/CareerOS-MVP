"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function DnaHelixScene({
  profileDepth,
  skillStrength,
  skills,
  interests,
  preferences,
  portfolio,
  learningSignals
}: {
  profileDepth: number;
  skillStrength: number;
  skills: string[];
  interests: string[];
  preferences: string[];
  portfolio: string[];
  learningSignals: string[];
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const signalLabels = useMemo(() => [
    ...skills.slice(0, 4).map((label) => ({ label, tone: "skill" as const })),
    ...interests.slice(0, 3).map((label) => ({ label, tone: "interest" as const })),
    ...preferences.slice(0, 2).map((label) => ({ label, tone: "preference" as const })),
    ...portfolio.slice(0, 2).map((label) => ({ label, tone: "portfolio" as const })),
    ...learningSignals.slice(0, 2).map((label) => ({ label, tone: "learning" as const }))
  ].slice(0, 12), [interests, learningSignals, portfolio, preferences, skills]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.4, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    const labelGroup = new THREE.Group();
    scene.add(group);
    scene.add(labelGroup);

    const gold = new THREE.MeshStandardMaterial({
      color: 0xa9802f,
      metalness: 0.22,
      roughness: 0.34
    });
    const ink = new THREE.MeshStandardMaterial({
      color: 0x14223d,
      metalness: 0.14,
      roughness: 0.42
    });
    const soft = new THREE.MeshStandardMaterial({
      color: 0xf3ead3,
      metalness: 0.05,
      roughness: 0.55
    });

    const sphere = new THREE.SphereGeometry(0.18, 24, 24);
    const connector = new THREE.CylinderGeometry(0.035, 0.035, 1, 10);
    const ribbon = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        Array.from({ length: 140 }, (_, i) => {
          const t = i / 139;
          const angle = t * Math.PI * 8.6;
          const y = (t - 0.5) * 9.2;
          return new THREE.Vector3(Math.cos(angle) * 2.3, y, Math.sin(angle) * 2.3);
        })
      ),
      160,
      0.035,
      10
    );
    const ribbonTwin = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        Array.from({ length: 140 }, (_, i) => {
          const t = i / 139;
          const angle = t * Math.PI * 8.6 + Math.PI;
          const y = (t - 0.5) * 9.2;
          return new THREE.Vector3(Math.cos(angle) * 2.3, y, Math.sin(angle) * 2.3);
        })
      ),
      160,
      0.035,
      10
    );
    group.add(new THREE.Mesh(ribbon, gold));
    group.add(new THREE.Mesh(ribbonTwin, ink));

    const steps = 42;
    const radius = 2.1 + skillStrength * 0.006;
    const heightStep = 0.21;

    for (let i = 0; i < steps; i += 1) {
      const y = (i - steps / 2) * heightStep;
      const angle = i * 0.56;
      const left = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const right = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);

      const leftOrb = new THREE.Mesh(sphere, i % 3 === 0 ? gold : soft);
      leftOrb.position.copy(left);
      group.add(leftOrb);

      const rightOrb = new THREE.Mesh(sphere, i % 4 === 0 ? ink : soft);
      rightOrb.position.copy(right);
      group.add(rightOrb);

      const midpoint = new THREE.Vector3().addVectors(left, right).multiplyScalar(0.5);
      const length = left.distanceTo(right);
      const rung = new THREE.Mesh(connector, i % 2 === 0 ? gold : ink);
      rung.position.copy(midpoint);
      rung.scale.set(1, length, 1);
      rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), right.clone().sub(left).normalize());
      group.add(rung);
    }

    signalLabels.forEach((signal, i) => {
      const angle = (i / Math.max(1, signalLabels.length)) * Math.PI * 2;
      const y = ((i % 6) - 2.5) * 0.85;
      const anchorRadius = 4.05 + (i % 2) * 0.55;
      const sprite = createTextSprite(signal.label, signal.tone);
      sprite.position.set(Math.cos(angle) * anchorRadius, y, Math.sin(angle) * anchorRadius);
      labelGroup.add(sprite);

      const target = new THREE.Vector3(Math.cos(angle) * 2.35, y * 0.55, Math.sin(angle) * 2.35);
      const start = sprite.position.clone();
      const midpoint = new THREE.Vector3().addVectors(start, target).multiplyScalar(0.5);
      const length = start.distanceTo(target);
      const line = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, length, 6),
        new THREE.MeshBasicMaterial({ color: 0xf3ead3, transparent: true, opacity: 0.46 })
      );
      line.position.copy(midpoint);
      line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), target.clone().sub(start).normalize());
      labelGroup.add(line);
    });

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.025, 10, 96),
      new THREE.MeshBasicMaterial({ color: 0xa9802f, transparent: true, opacity: 0.22 })
    );
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const fillLight = new THREE.PointLight(0xf6e5bd, 28, 24);
    fillLight.position.set(4, 5, 6);
    scene.add(fillLight);

    const coolLight = new THREE.PointLight(0xe8eff7, 18, 22);
    coolLight.position.set(-5, -4, 8);
    scene.add(coolLight);

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const resize = () => {
      const width = Math.max(320, host.clientWidth);
      const height = Math.max(360, host.clientHeight);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.008 + profileDepth * 0.00002;
      group.rotation.x = Math.sin(Date.now() * 0.00055) * 0.12;
      labelGroup.rotation.y += 0.006;
      labelGroup.children.forEach((child) => {
        if (child instanceof THREE.Sprite) {
          child.quaternion.copy(camera.quaternion);
        }
      });
      halo.rotation.z += 0.004;
      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      sphere.dispose();
      connector.dispose();
      ribbon.dispose();
      ribbonTwin.dispose();
      gold.dispose();
      ink.dispose();
      soft.dispose();
      halo.geometry.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [profileDepth, signalLabels, skillStrength]);

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[14px] border border-line bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,178,90,.26),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(232,239,247,.14),transparent_34%)]" />
      <div ref={hostRef} className="absolute inset-0" />
      <div className="absolute left-4 top-4 rounded-[10px] border border-paper/10 bg-paper/10 px-3 py-2 text-paper backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-paper/60">Living DNA</p>
        <p className="mt-1 font-serif text-xl font-semibold">Profile signal graph</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {signalLabels.slice(0, 7).map((signal) => (
          <span
            key={`${signal.tone}-${signal.label}`}
            className="rounded-full border border-paper/10 bg-paper/10 px-2.5 py-1 text-xs font-semibold text-paper/80 backdrop-blur"
          >
            {signal.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function createTextSprite(
  text: string,
  tone: "skill" | "interest" | "preference" | "portfolio" | "learning"
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const safeText = text.length > 22 ? `${text.slice(0, 21)}...` : text;
  const width = 320;
  const height = 82;
  canvas.width = width;
  canvas.height = height;

  if (context) {
    const colors = {
      skill: "#A9802F",
      interest: "#3E6EA8",
      preference: "#3F8F5E",
      portfolio: "#BC8A2E",
      learning: "#5B5BD6"
    };
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 254, 251, 0.92)";
    roundedRect(context, 8, 10, width - 16, height - 20, 20);
    context.fill();
    context.strokeStyle = "rgba(234, 227, 213, 0.92)";
    context.lineWidth = 3;
    roundedRect(context, 8, 10, width - 16, height - 20, 20);
    context.stroke();
    context.fillStyle = colors[tone];
    context.beginPath();
    context.arc(34, 41, 9, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#14223D";
    context.font = "700 24px Segoe UI, sans-serif";
    context.fillText(safeText, 54, 49);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.4, 0.62, 1);
  return sprite;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
