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

export function recordsCommand(): Command {
  const cmd = new Command("records").description("Manage DNS zone records");

  cmd
    .command("list")
    .description("List all records for a zone")
    .argument("<zone>", "Zone name")
    .option("--json", "Output as JSON")
    .option("--name <filter>", "Filter by exact record name")
    .option("--name-like <filter>", "Filter by name substring")
    .option("--type <type>", "Filter by record type (A, AAAA, CNAME, MX, etc.)")
    .option("--sort <field>", "Sort by: id, name, content, type")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (zone, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/zones/${zone}/records`,
          {
            name: opts.name,
            name_like: opts.nameLike,
            type: opts.type,
            sort: opts.sort,
            page: opts.page,
            per_page: opts.perPage,
          }
        );
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Name", "Type", "Content", "TTL", "Priority", "Regions", "System"],
          resp.data.map((r: any) => [
            r.id,
            r.name || "@",
            r.type,
            r.content.length > 50 ? r.content.slice(0, 47) + "..." : r.content,
            r.ttl,
            r.priority ?? "—",
            r.regions?.join(",") || "global",
            r.system_record ? "yes" : "no",
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
    .description("Get details for a specific record")
    .argument("<zone>", "Zone name")
    .argument("<record-id>", "Record ID")
    .option("--json", "Output as JSON")
    .action(async (zone, recordId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/zones/${zone}/records/${recordId}`
        );
        if (opts.json) return printJson(resp.data);
        const r = resp.data;
        printKeyValue({
          ID: r.id,
          "Zone ID": r.zone_id,
          Name: r.name || "@",
          Type: r.type,
          Content: r.content,
          TTL: r.ttl,
          Priority: r.priority,
          Regions: r.regions?.join(", ") || "global",
          "System Record": r.system_record ? "yes" : "no",
          "Created At": formatDate(r.created_at),
          "Updated At": formatDate(r.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Create a new DNS record")
    .argument("<zone>", "Zone name")
    .requiredOption("--type <type>", "Record type (A, AAAA, CNAME, MX, TXT, etc.)")
    .requiredOption("--content <content>", "Record content/value")
    .option("--name <name>", "Record name (empty for apex)", "")
    .option("--ttl <seconds>", "Time to live in seconds", "3600")
    .option("--priority <n>", "Record priority (for MX, SRV)")
    .option(
      "--regions <regions>",
      "Comma-separated regions (SV1,ORD,IAD,AMS,TKO,SYD,CDG,FRA)"
    )
    .option("--json", "Output as JSON")
    .action(async (zone, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          name: opts.name,
          type: opts.type.toUpperCase(),
          content: opts.content,
          ttl: parseInt(opts.ttl, 10),
        };
        if (opts.priority) body.priority = parseInt(opts.priority, 10);
        if (opts.regions) body.regions = opts.regions.split(",");

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/zones/${zone}/records`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Record created: ${resp.data.type} ${resp.data.name || "@"} → ${resp.data.content} (ID: ${resp.data.id})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("update")
    .description("Update an existing DNS record")
    .argument("<zone>", "Zone name")
    .argument("<record-id>", "Record ID")
    .option("--name <name>", "New record name")
    .option("--content <content>", "New record content")
    .option("--ttl <seconds>", "New TTL")
    .option("--priority <n>", "New priority")
    .option("--regions <regions>", "Comma-separated regions")
    .option("--json", "Output as JSON")
    .action(async (zone, recordId, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.name !== undefined) body.name = opts.name;
        if (opts.content) body.content = opts.content;
        if (opts.ttl) body.ttl = parseInt(opts.ttl, 10);
        if (opts.priority) body.priority = parseInt(opts.priority, 10);
        if (opts.regions) body.regions = opts.regions.split(",");

        const client = new DnsimpleClient(cfg);
        const resp = await client.patch(
          `/${cfg.accountId}/zones/${zone}/records/${recordId}`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Record updated: ${resp.data.type} ${resp.data.name || "@"} → ${resp.data.content}`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Delete a DNS record")
    .argument("<zone>", "Zone name")
    .argument("<record-id>", "Record ID")
    .action(async (zone, recordId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/zones/${zone}/records/${recordId}`
        );
        printSuccess(`Record ${recordId} deleted from zone "${zone}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("check-distribution")
    .description("Check if a record change has been distributed")
    .argument("<zone>", "Zone name")
    .argument("<record-id>", "Record ID")
    .option("--json", "Output as JSON")
    .action(async (zone, recordId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/zones/${zone}/records/${recordId}/distribution`
        );
        if (opts.json) return printJson(resp.data);
        if (resp.data.distributed) {
          printSuccess(`Record ${recordId} is fully distributed.`);
        } else {
          console.log(`Record ${recordId} is not yet fully distributed.`);
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
