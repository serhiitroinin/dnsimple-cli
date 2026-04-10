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

export function certificatesCommand(): Command {
  const cmd = new Command("certificates").description("Manage SSL certificates");

  cmd
    .command("list")
    .description("List certificates for a domain")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/certificates`,
          { page: opts.page, per_page: opts.perPage }
        );
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Common Name", "State", "Authority", "Auto Renew", "Expires"],
          resp.data.map((c: any) => [
            c.id,
            c.common_name,
            c.state,
            c.authority_identifier,
            c.auto_renew ? "yes" : "no",
            formatDate(c.expires_at),
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get certificate details")
    .argument("<domain>", "Domain name or ID")
    .argument("<certificate-id>", "Certificate ID")
    .option("--json", "Output as JSON")
    .action(async (domain, certId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/certificates/${certId}`
        );
        if (opts.json) return printJson(resp.data);
        const c = resp.data;
        printKeyValue({
          ID: c.id,
          "Common Name": c.common_name,
          State: c.state,
          Authority: c.authority_identifier,
          Years: c.years,
          "Auto Renew": c.auto_renew ? "yes" : "no",
          "Alt Names": c.alternate_names?.join(", ") || "—",
          "CSR": c.csr ? "present" : "—",
          "Expires At": formatDate(c.expires_at),
          "Created At": formatDate(c.created_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("download")
    .description("Download PEM-encoded certificate chain")
    .argument("<domain>", "Domain name or ID")
    .argument("<certificate-id>", "Certificate ID")
    .action(async (domain, certId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/certificates/${certId}/download`
        );
        // Output server cert
        if (resp.data.server) {
          console.log(resp.data.server);
        }
        // Output chain
        if (resp.data.chain) {
          for (const cert of resp.data.chain) {
            console.log(cert);
          }
        }
        // Output root
        if (resp.data.root) {
          console.log(resp.data.root);
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("private-key")
    .description("Get PEM-encoded private key")
    .argument("<domain>", "Domain name or ID")
    .argument("<certificate-id>", "Certificate ID")
    .action(async (domain, certId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/certificates/${certId}/private_key`
        );
        console.log(resp.data.private_key);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("letsencrypt-purchase")
    .description("Purchase a Let's Encrypt certificate")
    .argument("<domain>", "Domain name or ID")
    .option("--auto-renew", "Enable auto-renewal")
    .option("--name <name>", "Certificate name / subdomain")
    .option(
      "--alt-names <names>",
      "Comma-separated alternate names"
    )
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.autoRenew) body.auto_renew = true;
        if (opts.name) body.name = opts.name;
        if (opts.altNames)
          body.alternate_names = opts.altNames.split(",");

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/certificates/letsencrypt`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Let's Encrypt certificate purchased (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("letsencrypt-issue")
    .description("Issue a purchased Let's Encrypt certificate")
    .argument("<domain>", "Domain name or ID")
    .argument("<certificate-id>", "Certificate ID")
    .option("--json", "Output as JSON")
    .action(async (domain, certId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/certificates/letsencrypt/${certId}/issue`
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Certificate ${certId} issue initiated.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("letsencrypt-renew")
    .description("Renew a Let's Encrypt certificate")
    .argument("<domain>", "Domain name or ID")
    .argument("<certificate-id>", "Certificate ID")
    .option("--auto-renew", "Enable auto-renewal on renewal")
    .option("--json", "Output as JSON")
    .action(async (domain, certId, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.autoRenew) body.auto_renew = true;

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/domains/${domain}/certificates/letsencrypt/${certId}/renewals`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Certificate renewal initiated.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
