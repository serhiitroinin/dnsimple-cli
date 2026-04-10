import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printJson,
  printSuccess,
  printError,
} from "../output.js";

export function delegationCommand(): Command {
  const cmd = new Command("delegation").description(
    "Manage domain name server delegation"
  );

  cmd
    .command("list")
    .description("List name servers for a domain")
    .argument("<domain>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/delegation`
        );
        if (opts.json) return printJson(resp.data);
        console.log("Name servers for " + domain + ":");
        for (const ns of resp.data) {
          console.log("  " + ns);
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("set")
    .description("Update name servers for a domain")
    .argument("<domain>", "Domain name")
    .argument("<nameservers...>", "Name server hostnames")
    .option("--json", "Output as JSON")
    .action(async (domain, nameservers, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.put(
          `/${cfg.accountId}/registrar/domains/${domain}/delegation`,
          nameservers
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Name servers updated for "${domain}".`);
        for (const ns of resp.data) {
          console.log("  " + ns);
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("vanity-enable")
    .description("Enable vanity name servers for a domain")
    .argument("<domain>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.put(
          `/${cfg.accountId}/registrar/domains/${domain}/delegation/vanity`
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Vanity name servers enabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("vanity-disable")
    .description("Disable vanity name servers for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/delegation/vanity`
        );
        printSuccess(`Vanity name servers disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
