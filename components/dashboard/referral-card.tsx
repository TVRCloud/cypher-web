import { MoreHorizontal } from "lucide-react";

interface ReferralCardProps {
  invited?: number;
  bonus?: number;
  score?: number;
}

export function ReferralCard({
  invited = 145,
  bonus = 1465,
  score = 9.3,
}: ReferralCardProps) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const filled = (score / 10) * circ;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-bold text-card-foreground">
          Referral Tracking
        </p>
        <button
          className="text-muted-foreground hover:text-card-foreground transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-center gap-4 flex-1">
        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Invited
            </p>
            <p className="text-lg font-bold text-card-foreground">
              {invited.toLocaleString()} people
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Bonus
            </p>
            <p className="text-lg font-bold text-card-foreground">
              {bonus.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Circular progress */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            aria-label={`Safety score: ${score}`}
          >
            <defs>
              <linearGradient
                id="circleGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#11998E" />
                <stop offset="100%" stopColor="#38EF7D" />
              </linearGradient>
            </defs>

            {/* Track */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="8"
            />

            {/* Progress */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="url(#circleGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - filled}
              transform="rotate(-90 50 50)"
            />
          </svg>

          <div className="absolute text-center">
            <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
              Safety
            </p>
            <p className="text-xl font-bold text-card-foreground leading-none">
              {score}
            </p>
            <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
              Total Score
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
