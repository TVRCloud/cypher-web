import { Wallet, Users, UserPlus, ShoppingCart } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { SatisfactionGauge } from "@/components/dashboard/satisfaction-gauge";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ActiveUsersChart } from "@/components/dashboard/active-users-chart";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { OrdersOverview } from "@/components/dashboard/orders-overview";

const stats = [
  {
    label: "Today's Money",
    value: "$53,000",
    change: "+55%",
    positive: true,
    icon: Wallet,
  },
  {
    label: "Today's Users",
    value: "2,300",
    change: "+5%",
    positive: true,
    icon: Users,
  },
  {
    label: "New Clients",
    value: "+3,052",
    change: "-14%",
    positive: false,
    icon: UserPlus,
  },
  {
    label: "Total Sales",
    value: "$173,000",
    change: "+8%",
    positive: true,
    icon: ShoppingCart,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Welcome · Satisfaction · Referral */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <WelcomeCard name="Mark Johnson" />
        </div>
        <div className="lg:col-span-2">
          <SatisfactionGauge value={95} />
        </div>
        <div className="lg:col-span-1">
          <ReferralCard />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2">
          <ActiveUsersChart />
        </div>
      </div>

      {/* Projects · Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ProjectsTable />
        </div>
        <div className="lg:col-span-2">
          <OrdersOverview />
        </div>
      </div>
    </div>
  );
}
