import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printSuccess,
  printError,
  formatDate,
} from "../output.js";

export function pushesCommand(): Command {
  const cmd = new Command("pushes").description(
    "Push domains between accounts"
  );

  cmd
    .command("list")
    .description("List pending pushes for the account")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/pushes`);
        if (opts.json) return printJson(resp.data);
        if (!resp.data.length) {
          console.log("No pending pushes.");
          return;
        }
        printTable(
          ["ID", "Domain ID", "Account ID", "Created"],
          resp.data.map((p: any) => [
            p.id,
            p.domain_id,
            p.account_id,
            formatDate(p.created_at),
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("initiate")
    .description("Push a domain to another account")
    .argument("<domain>", "Domain name or ID")
    .requiredOption("--new-account-email <email>", "Email of target account")
    .option("--contact <id>", "Contact ID to use at target account")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          new_account_email: opts.newAccountEmail,
        };
        if (opts.contact) body.contact_id = parseInt(opts.contact, 10);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/pushes`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Push initiated for domain "${domain}" (Push ID: ${resp.data.id})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("accept")
    .description("Accept a pending domain push")
    .argument("<push-id>", "Push ID")
    .requiredOption("--contact <id>", "Contact ID to assign")
    .action(async (pushId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.post(`/${cfg.accountId}/pushes/${pushId}`, {
          contact_id: parseInt(opts.contact, 10),
        });
        printSuccess(`Push ${pushId} accepted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("reject")
    .description("Reject a pending domain push")
    .argument("<push-id>", "Push ID")
    .action(async (pushId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/pushes/${pushId}`);
        printSuccess(`Push ${pushId} rejected.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
