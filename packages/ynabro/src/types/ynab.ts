export interface YnabPlan {
  id: string;
  name: string;
  last_modified_on: string;
  first_month: string;
  last_month: string;
}

export interface YnabTransaction {
  id: string;
  date: string;
  amount: number;
  payee_name: string | null;
  approved: boolean;
  cleared: string;
  import_id?: string;
}
