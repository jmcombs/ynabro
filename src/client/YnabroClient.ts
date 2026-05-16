import * as ynab from "ynab";
import type { YnabPlan, YnabTransaction } from "../types/ynab.js";

export class YnabroClient {
  private api: ynab.api;

  constructor(token: string) {
    if (!token) {
      throw new Error("YNAB token is required");
    }
    this.api = new ynab.api(token);
  }

  async getPlans(): Promise<YnabPlan[]> {
    const response = await this.api.budgets.getBudgets();
    return response.data.budgets as YnabPlan[];
  }

  async getTransactions(
    planId: string,
    options?: { type?: "uncategorized" | "all" },
  ): Promise<YnabTransaction[]> {
    const response = await this.api.transactions.getTransactions(planId);
    let txs = response.data.transactions as YnabTransaction[];

    if (options?.type === "uncategorized") {
      txs = txs.filter((t) => !t.approved);
    }
    return txs;
  }

  async updateTransaction(
    planId: string,
    transactionId: string,
    patch: { approved?: boolean },
  ): Promise<void> {
    await this.api.transactions.updateTransaction(planId, transactionId, {
      // biome-ignore lint/suspicious/noExplicitAny: Required due to incomplete YNAB SDK types
      transaction: patch as unknown as any,
    });
  }
}
