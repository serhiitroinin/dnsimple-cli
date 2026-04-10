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

export function zonesCommand(): Command {
  const cmd = new Command("zones").description("Manage DNS zones");

  cmd
    .command("list")
    .description("List all zones in the account")
    .option("--json", "Output as JSON")
    .option("--name <filter>", "Filter by zone name")
    .option("--sort <field>", "Sort by: id, name")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/zones`, {
          name_like: opts.name,
          sort: opts.sort,
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Name", "Active", "Reverse", "Created"],
          resp.data.map((z: any) => [
            z.id,
            z.name,
            z.active ? "yes" : "no",
            z.reverse ? "yes" : "no",
            formatDate(z.created_at),
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
    .description("Get details for a zone")
    .argument("<zone>", "Zone name or ID")
    .option("--json", "Output as JSON")
    .action(async (zone, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/zones/${zone}`);
        if (opts.json) return printJson(resp.data);
        const z = resp.data;
        printKeyValue({
          ID: z.id,
          Name: z.name,
          "Account ID": z.account_id,
          Active: z.active ? "yes" : "no",
          Reverse: z.reverse ? "yes" : "no",
          "Created At": formatDate(z.created_at),
          "Updated At": formatDate(z.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("file")
    .description("Export zone file in BIND format")
    .argument("<zone>", "Zone name")
    .action(async (zone) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/zones/${zone}/file`);
        console.log(resp.data.zone);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("check-distribution")
    .description("Check if zone changes are fully distributed")
    .argument("<zone>", "Zone name")
    .option("--json", "Output as JSON")
    .action(async (zone, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/zones/${zone}/distribution`
        );
        if (opts.json) return printJson(resp.data);
        if (resp.data.distributed) {
          printSuccess(`Zone "${zone}" is fully distributed.`);
        } else {
          console.log(`Zone "${zone}" is not yet fully distributed.`);
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("activate")
    .description("Activate DNS services for a zone")
    .argument("<zone>", "Zone name")
    .action(async (zone) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.put(`/${cfg.accountId}/zones/${zone}/activation`);
        printSuccess(`DNS services activated for "${zone}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("deactivate")
    .description("Deactivate DNS services for a zone")
    .argument("<zone>", "Zone name")
    .action(async (zone) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/zones/${zone}/activation`);
        printSuccess(`DNS services deactivated for "${zone}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
