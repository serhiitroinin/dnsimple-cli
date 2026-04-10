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

export function servicesCommand(): Command {
  const cmd = new Command("services").description(
    "Manage one-click services (Heroku, Netlify, etc.)"
  );

  cmd
    .command("list")
    .description("List all available one-click services")
    .option("--json", "Output as JSON")
    .option("--sort <field>", "Sort by: id, sid")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get("/services", { sort: opts.sort });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "SID", "Name", "Description", "Requires Setup"],
          resp.data.map((s: any) => [
            s.id,
            s.sid,
            s.name,
            (s.description || "").slice(0, 60),
            s.requires_setup ? "yes" : "no",
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get service details")
    .argument("<service>", "Service ID or short name")
    .option("--json", "Output as JSON")
    .action(async (service, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/services/${service}`);
        if (opts.json) return printJson(resp.data);
        const s = resp.data;
        printKeyValue({
          ID: s.id,
          SID: s.sid,
          Name: s.name,
          Description: s.description,
          "Requires Setup": s.requires_setup ? "yes" : "no",
          "Default Subdomain": s.default_subdomain,
        });
        if (s.settings?.length) {
          console.log("\nSettings:");
          for (const setting of s.settings) {
            console.log(
              `  ${setting.name} (${setting.label}): ${setting.description}`
            );
          }
        }
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Applied services for a domain
  cmd
    .command("applied")
    .description("List services applied to a domain")
    .argument("<domain>", "Domain name or ID")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/domains/${domain}/services`
        );
        if (opts.json) return printJson(resp.data);
        if (!resp.data.length) {
          console.log("No services applied to this domain.");
          return;
        }
        printTable(
          ["ID", "SID", "Name"],
          resp.data.map((s: any) => [s.id, s.sid, s.name])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("apply")
    .description("Apply a one-click service to a domain")
    .argument("<domain>", "Domain name or ID")
    .argument("<service>", "Service ID or short name")
    .option(
      "--settings <json>",
      'Service settings as JSON (e.g. \'{"subdomain":"blog"}\')'
    )
    .action(async (domain, service, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.settings) {
          body.settings = JSON.parse(opts.settings);
        }
        const client = new DnsimpleClient(cfg);
        await client.post(
          `/${cfg.accountId}/domains/${domain}/services/${service}`,
          body
        );
        printSuccess(`Service "${service}" applied to "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("unapply")
    .description("Remove a one-click service from a domain")
    .argument("<domain>", "Domain name or ID")
    .argument("<service>", "Service ID or short name")
    .action(async (domain, service) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/domains/${domain}/services/${service}`
        );
        printSuccess(`Service "${service}" removed from "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
