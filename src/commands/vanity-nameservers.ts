import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printTable,
  printJson,
  printSuccess,
  printError,
} from "../output.js";

export function vanityNameserversCommand(): Command {
  const cmd = new Command("vanity-nameservers").description(
    "Manage vanity name servers"
  );

  cmd
    .command("enable")
    .description("Enable vanity name servers for a domain")
    .argument("<domain>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.put(
          `/${cfg.accountId}/vanity/${domain}`
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Vanity name servers enabled for "${domain}".`);
        if (Array.isArray(resp.data)) {
          printTable(
            ["Name", "IPv4", "IPv6"],
            resp.data.map((ns: any) => [ns.name, ns.ipv4, ns.ipv6])
          );
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("disable")
    .description("Disable vanity name servers for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/vanity/${domain}`);
        printSuccess(`Vanity name servers disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
