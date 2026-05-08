import { DollarSign, ShoppingCart, Monitor, CreditCard, Package } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Order {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  date: string;
}

const orders: Order[] = [
  {
    icon: DollarSign,
    iconBg: "#ED8936",
    title: "$2,400, Design changes",
    date: "22 DEC 7:20 PM",
  },
  {
    icon: ShoppingCart,
    iconBg: "#E91E8C",
    title: "New order #4219423",
    date: "21 DEC 11:21 PM",
  },
  {
    icon: Monitor,
    iconBg: "#4299e1",
    title: "Server Payments for April",
    date: "21 DEC 9:28 PM",
  },
  {
    icon: CreditCard,
    iconBg: "#ED8936",
    title: "New card added for order #3210145",
    date: "20 DEC 3:52 PM",
  },
  {
    icon: Package,
    iconBg: "#8f9bba",
    title: "Unlock packages for Development",
    date: "19 DEC 11:35 PM",
  },
  {
    icon: ShoppingCart,
    iconBg: "#E91E8C",
    title: "New order #9851258",
    date: "18 DEC 4:41 PM",
  },
];

export function OrdersOverview() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col h-full">
      <p className="text-sm font-bold text-card-foreground">Orders overview</p>
      <p className="text-xs text-emerald-400 mt-0.5">
        <span className="font-bold">+30%</span> this month
      </p>

      <ul className="mt-4 space-y-0 divide-y divide-border/20 flex-1">
        {orders.map((order, i) => {
          const Icon = order.icon;
          return (
            <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: order.iconBg + "22" }}
                >
                  <Icon size={14} style={{ color: order.iconBg }} />
                </div>
                {i < orders.length - 1 && (
                  <div className="w-px flex-1 mt-1 bg-border/30 min-h-[16px]" />
                )}
              </div>

              <div className="min-w-0 pb-1">
                <p className="text-[13px] font-medium text-card-foreground leading-tight truncate">
                  {order.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {order.date}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
