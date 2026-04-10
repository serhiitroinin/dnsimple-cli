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

export function dnssecCommand(): Command {
  const cmd = new Command("dnssec").description("Manage DNSSEC");

  cmd
    .command("status")
    .description("Get DNSSEC status for a domain")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/dnssec`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          DNSSEC: resp.data.enabled ? "enabled" : "disabled",
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("enable")
    .description("Enable DNSSEC for a domain")
    .argument("<domain>", "Domain name or ID")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.post(`/${cfg.accountId}/domains/${domain}/dnssec`);
        printSuccess(`DNSSEC enabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("disable")
    .description("Disable DNSSEC for a domain")
    .argument("<domain>", "Domain name or ID")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/domains/${domain}/dnssec`);
        printSuccess(`DNSSEC disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // DS records
  cmd
    .command("ds-list")
    .description("List delegation signer (DS) records")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/ds_records`
        );
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Algorithm", "Digest", "Digest Type", "Keytag"],
          resp.data.map((r: any) => [
            r.id,
            r.algorithm,
            r.digest?.slice(0, 32) + "...",
            r.digest_type,
            r.keytag,
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("ds-create")
    .description("Create a delegation signer (DS) record")
    .argument("<domain>", "Domain name or ID")
    .requiredOption("--algorithm <alg>", "DNSSEC algorithm")
    .requiredOption("--digest <digest>", "DS record digest")
    .requiredOption("--digest-type <type>", "Digest type")
    .requiredOption("--keytag <tag>", "Key tag")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body = {
          algorithm: opts.algorithm,
          digest: opts.digest,
          digest_type: opts.digestType,
          keytag: opts.keytag,
        };
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/ds_records`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`DS record created (ID: ${resp.data.id})`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("ds-get")
    .description("Get a specific DS record")
    .argument("<domain>", "Domain name or ID")
    .argument("<ds-record-id>", "DS record ID")
    .option("--json", "Output as JSON")
    .action(async (domain, dsRecordId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/ds_records/${dsRecordId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue(resp.data);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("ds-delete")
    .description("Delete a DS record")
    .argument("<domain>", "Domain name or ID")
    .argument("<ds-record-id>", "DS record ID")
    .action(async (domain, dsRecordId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/domains/${domain}/ds_records/${dsRecordId}`
        );
        printSuccess(`DS record ${dsRecordId} deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
