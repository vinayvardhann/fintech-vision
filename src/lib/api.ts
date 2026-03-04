const BASE_URL = "http://localhost:8080/api";

export interface Account {
  id: number;
  accountNumber: string;
  holderName: string;
  email: string;
  balance: number;
  accountType: "SAVINGS" | "CHECKING" | "CURRENT";
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  transactionId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  sourceAccountNumber?: string;
  destinationAccountNumber?: string;
}

export interface SignUpData {
  holderName: string;
  email: string;
  initialBalance: number;
  accountType: "SAVINGS" | "CHECKING" | "CURRENT";
}

export interface DepositData {
  accountNumber: string;
  amount: number;
}

export interface WithdrawData {
  accountNumber: string;
  amount: number;
}

export interface TransferData {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Accounts
  getAccounts: () => request<Account[]>("/accounts"),
  getAccount: (accountNumber: string) => request<Account>(`/accounts/${accountNumber}`),
  createAccount: (data: SignUpData) => request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),

  // Transactions
  deposit: (data: DepositData) => request<Transaction>("/transactions/deposit", { method: "POST", body: JSON.stringify(data) }),
  withdraw: (data: WithdrawData) => request<Transaction>("/transactions/withdraw", { method: "POST", body: JSON.stringify(data) }),
  transfer: (data: TransferData) => request<Transaction>("/transactions/transfer", { method: "POST", body: JSON.stringify(data) }),
  getTransactions: (accountNumber?: string) => request<Transaction[]>(accountNumber ? `/transactions?account=${accountNumber}` : "/transactions"),

  // Reports
  getReports: () => request<string[]>("/reports/list"),
  generateAccountStatement: (accountNumber: string) => request<string>(`/reports/account-statement/${accountNumber}`, { method: "POST" }),
  generateBankSummary: () => request<string>("/reports/bank-summary", { method: "POST" }),
};
