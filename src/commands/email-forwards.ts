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

export function emailForwardsCommand(): Command {
  const cmd = new Command("email-forwards").description(
    "Manage email forwarding"
  );

  cmd
    .command("list")
    .description("List email forwards for a domain")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/email_forwards`,
          { page: opts.page, per_page: opts.perPage }
        );
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "From", "To", "Created"],
          resp.data.map((f: any) => [
            f.id,
            f.from || f.alias_name,
            f.to || f.destination_email,
            formatDate(f.created_at),
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get email forward details")
    .argument("<domain>", "Domain name or ID")
    .argument("<forward-id>", "Email forward ID")
    .option("--json", "Output as JSON")
    .action(async (domain, forwardId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/email_forwards/${forwardId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          ID: resp.data.id,
          From: resp.data.from || resp.data.alias_name,
          To: resp.data.to || resp.data.destination_email,
          "Created At": formatDate(resp.data.created_at),
          "Updated At": formatDate(resp.data.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Create an email forward")
    .argument("<domain>", "Domain name or ID")
    .requiredOption("--alias <name>", "Alias name (receiving part, without @domain)")
    .requiredOption("--destination <email>", "Destination email address")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/email_forwards`,
          {
            alias_name: opts.alias,
            destination_email: opts.destination,
          }
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Email forward created: ${opts.alias}@${domain} → ${opts.destination} (ID: ${resp.data.id})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Delete an email forward")
    .argument("<domain>", "Domain name or ID")
    .argument("<forward-id>", "Email forward ID")
    .action(async (domain, forwardId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/domains/${domain}/email_forwards/${forwardId}`
        );
        printSuccess(`Email forward ${forwardId} deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
