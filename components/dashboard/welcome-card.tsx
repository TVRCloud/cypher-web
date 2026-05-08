import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface WelcomeCardProps {
  name?: string;
}

export function WelcomeCard({ name = "Mark Johnson" }: WelcomeCardProps) {
  return (
    <div
      className="relative rounded-2xl border border-white/10 p-6 overflow-hidden h-full min-h-[180px] flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(127.09deg, rgba(6,11,40,0.97) 19.41%, rgba(10,14,35,0.55) 76.65%)",
      }}
    >
      {/* Decorative glow orbs */}
      <div
        className="absolute -right-8 -top-8 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(71,118,230,0.35) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        className="absolute right-12 top-6 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(142,84,233,0.25) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Decorative jellyfish shape */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 40% 30%, #8E54E9 0%, #4776E6 60%, transparent 85%)",
          filter: "blur(12px)",
          transform: "translateY(-50%) scaleY(1.3)",
        }}
      />

      <div className="relative z-10">
        <p className="text-sm text-white/60 font-medium">Welcome back,</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{name}</h2>
        <p className="text-sm text-white/45 mt-2 max-w-[220px] leading-relaxed">
          Glad to see you again! Ask me anything.
        </p>
      </div>

      <Link
        href="#"
        className="relative z-10 inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors group w-fit"
      >
        Tap to record
        <ArrowRight
          size={13}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </Link>
    </div>
  );
}
