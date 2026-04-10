import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printJson,
  printSuccess,
  printError,
  printKeyValue,
} from "../output.js";

export function registrantChangesCommand(): Command {
  const cmd = new Command("registrant-changes").description(
    "Manage registrant contact changes"
  );

  cmd
    .command("create")
    .description("Initiate a registrant change")
    .argument("<domain>", "Domain name or ID")
    .requiredOption("--contact <id>", "New registrant contact ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/registrant_changes`,
          { contact_id: parseInt(opts.contact, 10) }
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Registrant change initiated (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get registrant change details")
    .argument("<domain>", "Domain name or ID")
    .argument("<change-id>", "Registrant change ID")
    .option("--json", "Output as JSON")
    .action(async (domain, changeId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/registrant_changes/${changeId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue(resp.data);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("check")
    .description("Check requirements for a registrant change")
    .argument("<domain>", "Domain name or ID")
    .requiredOption("--contact <id>", "New registrant contact ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/registrant_changes/check`,
          { contact_id: parseInt(opts.contact, 10) }
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue(resp.data);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Cancel a registrant change")
    .argument("<domain>", "Domain name or ID")
    .argument("<change-id>", "Registrant change ID")
    .action(async (domain, changeId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/registrant_changes/${changeId}`
        );
        printSuccess(`Registrant change ${changeId} cancelled.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
