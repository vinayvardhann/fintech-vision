import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Reports() {
  const { account } = useAuth();
  const [generating, setGenerating] = useState(false);

  const { data: reports = [], refetch, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.getReports(),
  });

  const handleGenerateStatement = async () => {
    if (!account) return;
    setGenerating(true);
    try {
      await api.generateAccountStatement(account.accountNumber);
      toast.success("Account statement generated!");
      refetch();
    } catch (err: any) { toast.error(err.message); } finally { setGenerating(false); }
  };

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      await api.generateBankSummary();
      toast.success("Bank summary generated!");
      refetch();
    } catch (err: any) { toast.error(err.message); } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reporting Hub</h1>
        <p className="text-muted-foreground">Generate and view financial reports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Account Statement</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate a detailed statement for your account.</p>
          <Button variant="hero" className="w-full" onClick={handleGenerateStatement} disabled={generating}>
            <FileText className="mr-2 h-4 w-4" /> Generate Statement
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Bank Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">Generate a full summary of all bank activity.</p>
          <Button variant="outline" className="w-full" onClick={handleGenerateSummary} disabled={generating}>
            <FileText className="mr-2 h-4 w-4" /> Generate Summary
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display font-semibold text-foreground">Generated Reports</h3>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reports generated yet. Use the buttons above to create one.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((report, i) => (
                <motion.div key={report} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{report}</span>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
