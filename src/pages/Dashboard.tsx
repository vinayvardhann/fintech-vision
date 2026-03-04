import { useAuth } from "@/context/AuthContext";
import { api, Transaction } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CreditCard, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const LOW_BALANCE_THRESHOLD = 500;

export default function Dashboard() {
  const { account, updateAccount } = useAuth();

  const { refetch, isLoading } = useQuery({
    queryKey: ["account", account?.accountNumber],
    queryFn: async () => {
      if (!account) return null;
      const updated = await api.getAccount(account.accountNumber);
      updateAccount(updated);
      return updated;
    },
    enabled: !!account,
    refetchInterval: 10000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-chart", account?.accountNumber],
    queryFn: () => api.getTransactions(account?.accountNumber),
    enabled: !!account,
  });

  if (!account) return null;

  const isLowBalance = account.balance < LOW_BALANCE_THRESHOLD;

  // Build balance trend from transactions
  const balanceTrend = transactions.length > 0
    ? transactions
        .slice()
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((t) => ({
          date: new Date(t.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          balance: t.balanceAfter,
          type: t.type,
        }))
    : generateMockTrend(account.balance);

  // Transaction type breakdown
  const typeCounts = transactions.reduce<Record<string, number>>((acc, t) => {
    const type = t.type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeCounts).length > 0
    ? Object.entries(typeCounts).map(([name, count]) => ({ name, count }))
    : [{ name: "Deposit", count: 5 }, { name: "Withdraw", count: 3 }, { name: "Transfer", count: 2 }];

  const cards = [
    { label: "Account Number", value: account.accountNumber, icon: CreditCard, accent: false },
    { label: "Current Balance", value: `$${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Wallet, accent: true },
    { label: "Account Type", value: account.accountType, icon: TrendingUp, accent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {account.holderName}</h1>
          <p className="text-muted-foreground">Here's your financial overview.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.info("Refreshing..."); }} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {isLowBalance && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-foreground">Low Balance Alert</p>
            <p className="text-sm text-muted-foreground">Your balance is below ${LOW_BALANCE_THRESHOLD.toFixed(2)}. Consider making a deposit.</p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-6 shadow-card ${card.accent ? "gradient-navy text-primary-foreground border-transparent" : "bg-card border-border"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${card.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.accent ? "text-primary-foreground/50" : "text-muted-foreground/50"}`} />
            </div>
            <p className={`font-display text-2xl font-bold ${card.accent ? "" : "text-foreground"}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Balance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 52%, 34%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 52%, 34%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(200, 10%, 45%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(200, 10%, 45%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 15%, 88%)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Balance"]}
                />
                <Area type="monotone" dataKey="balance" stroke="hsl(145, 52%, 34%)" strokeWidth={2.5} fill="url(#balanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Transaction Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(200, 10%, 45%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(200, 10%, 45%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220, 15%, 88%)" }} />
                <Bar dataKey="count" fill="hsl(231, 70%, 30%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Account Details</h3>
          <div className="space-y-3">
            {[
              { label: "Status", value: account.status || "Active" },
              { label: "Email", value: account.email },
              { label: "Created", value: account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "N/A" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Deposit", href: "/payments?tab=deposit" },
              { label: "Withdraw", href: "/payments?tab=withdraw" },
              { label: "Transfer", href: "/payments?tab=transfer" },
              { label: "View History", href: "/history" },
            ].map((action) => (
              <a key={action.label} href={action.href}
                className="flex items-center justify-center rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all">
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Generate mock balance trend data when no transactions exist yet */
function generateMockTrend(currentBalance: number) {
  const data = [];
  let balance = currentBalance * 0.7;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    balance += (Math.random() - 0.3) * (currentBalance * 0.08);
    balance = Math.max(0, balance);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: Math.round(balance * 100) / 100,
    });
  }
  // Ensure last point matches current balance
  data[data.length - 1].balance = currentBalance;
  return data;
}
