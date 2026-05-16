import fs from 'fs';
import path from 'path';

const STATE_DIR = '.ynabro';
const STATE_FILE = path.join(STATE_DIR, 'transactions-state.json');

export interface TransactionModuleState {
  last_knowledge_of_server: number | null;
  auto_approve_enabled: boolean;
  successful_reviews: number;
  notes: string[];
  patterns: {
    frequent_mismatches: Array<{
      local_payee: string;
      matched_payee: string;
      count: number;
      last_seen: string;
    }>;
    amount_tolerance_cents: number;
  };
}

const DEFAULT_STATE: TransactionModuleState = {
  last_knowledge_of_server: null,
  auto_approve_enabled: false,
  successful_reviews: 0,
  notes: [],
  patterns: {
    frequent_mismatches: [],
    amount_tolerance_cents: 50,
  },
};

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

export function getTransactionModuleState(): TransactionModuleState {
  ensureStateDir();
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return { ...DEFAULT_STATE };
  }
  const raw = fs.readFileSync(STATE_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function updateTransactionModuleState(updates: Partial<TransactionModuleState>) {
  const current = getTransactionModuleState();
  const newState = { ...current, ...updates };
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
}

export function addFrequentMismatch(localPayee: string, matchedPayee: string) {
  const state = getTransactionModuleState();
  const existing = state.patterns.frequent_mismatches.find(
    (m) => m.local_payee.toLowerCase() === localPayee.toLowerCase()
  );

  if (existing) {
    existing.count += 1;
    existing.last_seen = new Date().toISOString().split('T')[0];
    existing.matched_payee = matchedPayee; // update in case it changed
  } else {
    state.patterns.frequent_mismatches.push({
      local_payee: localPayee,
      matched_payee: matchedPayee,
      count: 1,
      last_seen: new Date().toISOString().split('T')[0],
    });
  }

  updateTransactionModuleState(state);
}

export function recordSuccessfulReview() {
  const state = getTransactionModuleState();
  state.successful_reviews += 1;
  updateTransactionModuleState(state);
}