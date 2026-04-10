import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printSuccess,
  printError,
  printKeyValue,
} from "../output.js";

export function webhooksCommand(): Command {
  const cmd = new Command("webhooks").description("Manage webhooks");

  cmd
    .command("list")
    .description("List all webhooks")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/webhooks`);
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "URL"],
          resp.data.map((w: any) => [w.id, w.url])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get webhook details")
    .argument("<webhook-id>", "Webhook ID")
    .option("--json", "Output as JSON")
    .action(async (webhookId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/webhooks/${webhookId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          ID: resp.data.id,
          URL: resp.data.url,
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Create a webhook")
    .argument("<url>", "Webhook URL (must be HTTPS)")
    .option("--json", "Output as JSON")
    .action(async (url, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(`/${cfg.accountId}/webhooks`, { url });
        if (opts.json) return printJson(resp.data);
        printSuccess(`Webhook created (ID: ${resp.data.id}) → ${resp.data.url}`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Delete a webhook")
    .argument("<webhook-id>", "Webhook ID")
    .action(async (webhookId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/webhooks/${webhookId}`);
        printSuccess(`Webhook ${webhookId} deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
