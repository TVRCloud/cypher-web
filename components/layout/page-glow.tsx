/**
 * Two large blurry orbs that orbit at different speeds, creating the
 * ambient colour glow seen in advanced UIs (Vercel, Linear, etc.).
 *
 * The orbit trick: a zero-size container div is placed at the centre
 * and rotated. The orb itself is absolutely offset from that container
 * by the orbit radius, so it traces a perfect circle as the container spins.
 */
export function PageGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Orbit 1 — blue orb, clockwise, 22s */}
      <div className="page-glow-pivot page-glow-orbit-1">
        <div className="page-glow-orb page-glow-orb-blue" />
      </div>

      {/* Orbit 2 — purple orb, counter-clockwise, 30s */}
      <div className="page-glow-pivot page-glow-orbit-2">
        <div className="page-glow-orb page-glow-orb-purple" />
      </div>

      {/* Orbit 3 — tiny accent orb, clockwise offset, 18s */}
      <div className="page-glow-pivot page-glow-orbit-3">
        <div className="page-glow-orb page-glow-orb-accent" />
      </div>
    </div>
  );
}
