export function radarPolygon(values: number[]) {
  return values.slice(0, 5).map((value, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    const radius = Math.max(0, Math.min(100, value)) * 0.8;
    return `${Math.round(100 + Math.cos(angle) * radius)},${Math.round(100 + Math.sin(angle) * radius)}`;
  }).join(" ");
}
