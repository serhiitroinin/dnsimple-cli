import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printError,
  printKeyValue,
  formatDate,
} from "../output.js";

export function billingCommand(): Command {
  const cmd = new Command("billing").description("View billing charges");

  cmd
    .command("list")
    .description("List billing charges")
    .option("--json", "Output as JSON")
    .option("--start-date <date>", "Start date (YYYY-MM-DD)")
    .option("--end-date <date>", "End date (YYYY-MM-DD)")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/billing/charges`, {
          start_date: opts.startDate,
          end_date: opts.endDate,
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Reference", "Total", "State", "Invoiced At"],
          resp.data.map((c: any) => [
            c.id,
            c.reference,
            `$${c.total_amount}`,
            c.state,
            formatDate(c.invoiced_at),
          ])
        );
        if (resp.pagination) {
          console.log(
            `\nPage ${resp.pagination.current_page}/${resp.pagination.total_pages} (${resp.pagination.total_entries} total)`
          );
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
