import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printError,
  printKeyValue,
} from "../output.js";

export function tldsCommand(): Command {
  const cmd = new Command("tlds").description("Browse available TLDs");

  cmd
    .command("list")
    .description("List all supported TLDs")
    .option("--json", "Output as JSON")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "100")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get("/tlds", {
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["TLD", "Type", "WHOIS Privacy", "Auto Renew Only", "Min Registration"],
          resp.data.map((t: any) => [
            t.tld,
            t.tld_type === 2 ? "ccTLD" : t.tld_type === 3 ? "newgTLD" : "gTLD",
            t.whois_privacy ? "yes" : "no",
            t.auto_renew_only ? "yes" : "no",
            t.minimum_registration,
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
    .description("Get details for a specific TLD")
    .argument("<tld>", 'TLD string (e.g. "com", "io")')
    .option("--json", "Output as JSON")
    .action(async (tld, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/tlds/${tld}`);
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          TLD: resp.data.tld,
          Type:
            resp.data.tld_type === 2
              ? "ccTLD"
              : resp.data.tld_type === 3
                ? "newgTLD"
                : "gTLD",
          "WHOIS Privacy": resp.data.whois_privacy ? "yes" : "no",
          "Auto Renew Only": resp.data.auto_renew_only ? "yes" : "no",
          IDN: resp.data.idn ? "yes" : "no",
          "Min Registration": resp.data.minimum_registration,
          "Registration Enabled": resp.data.registration_enabled
            ? "yes"
            : "no",
          "Renewal Enabled": resp.data.renewal_enabled ? "yes" : "no",
          "Transfer Enabled": resp.data.transfer_enabled ? "yes" : "no",
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("extended-attributes")
    .description("Get extended attributes required for a TLD")
    .argument("<tld>", "TLD string")
    .option("--json", "Output as JSON")
    .action(async (tld, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/tlds/${tld}/extended_attributes`);
        if (opts.json) return printJson(resp.data);
        if (!resp.data.length) {
          console.log(`No extended attributes required for .${tld}`);
          return;
        }
        for (const attr of resp.data) {
          console.log(`\n${attr.name} (${attr.description})`);
          if (attr.required) console.log("  Required: yes");
          if (attr.options?.length) {
            console.log("  Options:");
            for (const opt of attr.options) {
              console.log(`    ${opt.value} - ${opt.title}`);
            }
          }
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
