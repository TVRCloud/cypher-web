import { PageGlow } from "@/components/layout/page-glow";
import { ShieldCheck, Layers, Users, ScrollText } from "lucide-react";

const features = [
  { icon: ShieldCheck, label: "JWT access + refresh token rotation" },
  { icon: Layers,      label: "Role-based access control (RBAC)" },
  { icon: Users,       label: "Session governance & audit trails" },
  { icon: ScrollText,  label: "Multi-tenant ready architecture" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * Force the dark CSS variant for all auth pages regardless of the
     * user's system or chosen theme — the glow looks best on dark navy.
     * This works because globals.css uses @custom-variant dark (&:is(.dark *)).
     */
    <div className="dark">
      <div className="relative min-h-screen bg-background flex overflow-hidden">
        <PageGlow />

        {/* ── Left brand panel (lg+) ───────────────────────── */}
        <div className="hidden lg:flex lg:w-[55%] flex-col justify-between px-20 py-16 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{
                background: "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)",
              }}
            >
              ◈
            </div>
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              Cypher Admin
            </span>
          </div>

          {/* Main copy */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white leading-[1.15] mb-5">
              Build smarter,
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)",
                }}
              >
                ship faster.
              </span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-12">
              Production-ready admin platform — authentication, permissions,
              and governance out of the box.
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)",
                    }}
                  >
                    <Icon size={13} className="text-white" />
                  </span>
                  <span className="text-white/55 text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom mini-stat strip */}
          <div className="flex gap-8">
            {[
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<50ms", label: "Auth latency" },
              { value: "SOC 2", label: "Ready" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{value}</p>
                <p className="text-white/35 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
