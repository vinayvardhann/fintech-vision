import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Wallet, CreditCard, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

  if (!account) return null;

  const isLowBalance = account.balance < LOW_BALANCE_THRESHOLD;

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
