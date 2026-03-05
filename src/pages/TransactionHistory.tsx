import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, Transaction } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

const typeIcon = (type: string) => {
  if (type?.toLowerCase().includes("deposit")) return <ArrowDownLeft className="h-4 w-4 text-accent" />;
  if (type?.toLowerCase().includes("withdraw")) return <ArrowUpRight className="h-4 w-4 text-destructive" />;
  return <ArrowLeftRight className="h-4 w-4 text-primary" />;
};

export default function TransactionHistory() {
  const { account } = useAuth();
  const [search, setSearch] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", account?.accountNumber],
    queryFn: () => api.getTransactions(account?.accountNumber),
    enabled: !!account,
  });

  const filtered = transactions.filter((t) =>
    [t.transactionId, t.type, t.description, t.amount?.toString()].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground">Complete audit trail of all transactions.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Txn ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Before</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">After</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No transactions found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{t.transactionId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">{typeIcon(t.type)} <span className="capitalize text-foreground">{t.type}</span></span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatINR(t.amount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatINR(t.balanceBefore)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatINR(t.balanceAfter)}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{t.description || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.timestamp ? new Date(t.timestamp).toLocaleString("en-IN") : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
