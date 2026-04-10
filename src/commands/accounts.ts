import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { getConfig } from "../config.js";
import { printTable, printJson, printError } from "../output.js";

export function accountsCommand(): Command {
  const cmd = new Command("accounts").description("List your DNSimple accounts");

  cmd
    .command("list")
    .description("List all accounts accessible with current credentials")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const cfg = getConfig();
      if (!cfg.accessToken) {
        printError('Not authenticated. Run "dnsimple auth login <token>".');
        process.exit(1);
      }
      try {
        const client = new DnsimpleClient();
        const resp = await client.get("/accounts");
        if (opts.json) {
          printJson(resp.data);
          return;
        }
        printTable(
          ["ID", "Email", "Plan", "Created"],
          resp.data.map((a: any) => [
            a.id,
            a.email,
            a.plan_identifier,
            a.created_at,
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
