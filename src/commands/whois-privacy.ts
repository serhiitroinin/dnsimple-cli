import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import { printSuccess, printError } from "../output.js";

export function whoisPrivacyCommand(): Command {
  const cmd = new Command("whois-privacy").description(
    "Manage WHOIS privacy protection"
  );

  cmd
    .command("enable")
    .description("Enable WHOIS privacy for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.put(
          `/${cfg.accountId}/registrar/domains/${domain}/whois_privacy`
        );
        printSuccess(`WHOIS privacy enabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("disable")
    .description("Disable WHOIS privacy for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/whois_privacy`
        );
        printSuccess(`WHOIS privacy disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
