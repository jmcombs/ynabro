import fs from "node:fs";
import path from "node:path";
import { YnabroClient } from "../client/YnabroClient.js";

const CONFIG_DIR = ".ynabro";
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface YnabConfig {
  token?: string;
  defaultPlanId?: string;
}

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig(): YnabConfig {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  }
  return {};
}

function saveConfig(config: YnabConfig) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Sets up YNAB integration for the user.
 * Guides them through creating a token if needed and selecting a default plan.
 */
export async function setupYnab() {
  let token = process.env.YNAB_TOKEN;
  const config = loadConfig();

  if (!token && config.token) {
    token = config.token;
  }

  if (!token) {
    console.log(`
To use YNABro, you need a YNAB Personal Access Token.

1. Go to: https://app.ynab.com/settings/developer
2. Click "Create New Token"
3. Give it a name (e.g. "YNABro")
4. Copy the token

You can store it in one of these ways:
- Environment variable: export YNAB_TOKEN=your_token_here
- Config file: ${CONFIG_FILE}
- Or paste it below now
`);

    // In a real implementation, we'd prompt for input here.
    // For now, we'll just instruct the user.
    return {
      message:
        "Please set your YNAB token using one of the methods above, then run setupYnab() again.",
    };
  }

  const client = new YnabroClient(token);
  const plans = await client.getPlans();

  if (plans.length === 0) {
    return { message: "No plans found in your YNAB account." };
  }

  console.log("\nYour YNAB Plans:");
  plans.forEach((plan, index) => {
    console.log(`${index + 1}. ${plan.name} (ID: ${plan.id})`);
  });

  // In a real implementation, we would prompt the user to choose.
  // For now, we'll auto-select the first one and save it.
  const selectedPlan = plans[0];
  config.token = token;
  config.defaultPlanId = selectedPlan.id;
  saveConfig(config);

  return {
    message: `Setup complete! Default plan set to: ${selectedPlan.name}`,
    defaultPlanId: selectedPlan.id,
  };
}
