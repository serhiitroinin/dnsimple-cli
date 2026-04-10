import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printSuccess,
  printError,
  printKeyValue,
  formatDate,
} from "../output.js";

export function domainsCommand(): Command {
  const cmd = new Command("domains").description("Manage domains");

  cmd
    .command("list")
    .description("List all domains in the account")
    .option("--json", "Output as JSON")
    .option("--name <filter>", "Filter by domain name")
    .option("--registrant <id>", "Filter by registrant ID")
    .option("--sort <field>", "Sort by: id, name, expiration")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/domains`, {
          name_like: opts.name,
          registrant_id: opts.registrant,
          sort: opts.sort,
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Name", "State", "Auto-Renew", "Expires", "Created"],
          resp.data.map((d: any) => [
            d.id,
            d.name,
            d.state,
            d.auto_renew ? "yes" : "no",
            d.expires_at ? formatDate(d.expires_at) : "—",
            formatDate(d.created_at),
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

  cmd
    .command("get")
    .description("Get details for a domain")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}`
        );
        if (opts.json) return printJson(resp.data);
        const d = resp.data;
        printKeyValue({
          ID: d.id,
          Name: d.name,
          State: d.state,
          "Auto Renew": d.auto_renew ? "yes" : "no",
          "Private Whois": d.private_whois ? "yes" : "no",
          "Expires At": formatDate(d.expires_at),
          "Registrant ID": d.registrant_id,
          "Unicode Name": d.unicode_name,
          "Created At": formatDate(d.created_at),
          "Updated At": formatDate(d.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Add a domain to the account (does not register)")
    .argument("<name>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (name, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(`/${cfg.accountId}/domains`, {
          name,
        });
        if (opts.json) return printJson(resp.data);
        printSuccess(`Domain "${resp.data.name}" added (ID: ${resp.data.id})`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Permanently delete a domain from the account")
    .argument("<domain>", "Domain name or ID")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/domains/${domain}`);
        printSuccess(`Domain "${domain}" deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
