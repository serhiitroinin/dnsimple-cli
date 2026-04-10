import { Command } from "commander";
import { DnsimpleClient } from "../client.js";
import { requireAuth } from "../config.js";
import {
  printJson,
  printSuccess,
  printError,
  printKeyValue,
} from "../output.js";

export function registrarCommand(): Command {
  const cmd = new Command("registrar").description(
    "Domain registration, transfers, and renewals"
  );

  // Check availability
  cmd
    .command("check")
    .description("Check domain availability")
    .argument("<domain>", "Domain name to check")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/check`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          Domain: domain,
          Available: resp.data.available ? "yes" : "no",
          Premium: resp.data.premium ? "yes" : "no",
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Get domain prices
  cmd
    .command("prices")
    .description("Get domain prices (registration, renewal, transfer)")
    .argument("<domain>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/prices`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          Domain: domain,
          "Registration Price": resp.data.registration_price,
          "Renewal Price": resp.data.renewal_price,
          "Transfer Price": resp.data.transfer_price,
          "Restore Price": resp.data.restore_price,
          Premium: resp.data.premium ? "yes" : "no",
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Register domain
  cmd
    .command("register")
    .description("Register a new domain")
    .argument("<domain>", "Domain name to register")
    .requiredOption("--registrant <id>", "Contact ID for the registrant")
    .option("--whois-privacy", "Enable WHOIS privacy")
    .option("--auto-renew", "Enable auto-renewal")
    .option("--premium-price <price>", "Acknowledge premium price")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          registrant_id: parseInt(opts.registrant, 10),
        };
        if (opts.whoisPrivacy) body.whois_privacy = true;
        if (opts.autoRenew) body.auto_renew = true;
        if (opts.premiumPrice)
          body.premium_price = parseFloat(opts.premiumPrice);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/registrations`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Domain "${domain}" registration initiated (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Get registration
  cmd
    .command("registration")
    .description("Get registration details")
    .argument("<domain>", "Domain name")
    .argument("<registration-id>", "Registration ID")
    .option("--json", "Output as JSON")
    .action(async (domain, regId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/registrations/${regId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          ID: resp.data.id,
          "Domain ID": resp.data.domain_id,
          State: resp.data.state,
          "Auto Renew": resp.data.auto_renew ? "yes" : "no",
          "Whois Privacy": resp.data.whois_privacy ? "yes" : "no",
          Period: resp.data.period,
          "Created At": resp.data.created_at,
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Transfer domain
  cmd
    .command("transfer")
    .description("Transfer a domain to DNSimple")
    .argument("<domain>", "Domain name to transfer")
    .requiredOption("--registrant <id>", "Contact ID for the registrant")
    .requiredOption("--auth-code <code>", "Authorization/EPP code")
    .option("--whois-privacy", "Enable WHOIS privacy")
    .option("--auto-renew", "Enable auto-renewal")
    .option("--premium-price <price>", "Acknowledge premium price")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          registrant_id: parseInt(opts.registrant, 10),
          auth_code: opts.authCode,
        };
        if (opts.whoisPrivacy) body.whois_privacy = true;
        if (opts.autoRenew) body.auto_renew = true;
        if (opts.premiumPrice)
          body.premium_price = parseFloat(opts.premiumPrice);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/transfers`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Transfer initiated for "${domain}" (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Get transfer status
  cmd
    .command("transfer-status")
    .description("Check transfer status")
    .argument("<domain>", "Domain name")
    .argument("<transfer-id>", "Transfer ID")
    .option("--json", "Output as JSON")
    .action(async (domain, transferId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/transfers/${transferId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          ID: resp.data.id,
          State: resp.data.state,
          "Status Description": resp.data.status_description,
          "Created At": resp.data.created_at,
          "Updated At": resp.data.updated_at,
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Cancel transfer
  cmd
    .command("transfer-cancel")
    .description("Cancel an in-progress transfer")
    .argument("<domain>", "Domain name")
    .argument("<transfer-id>", "Transfer ID")
    .action(async (domain, transferId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/transfers/${transferId}`
        );
        printSuccess(`Transfer ${transferId} for "${domain}" cancelled.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Authorize outbound transfer
  cmd
    .command("transfer-out")
    .description("Authorize an outbound transfer")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/authorize_transfer_out`
        );
        printSuccess(
          `Outbound transfer authorized for "${domain}". Auth code sent to registrant.`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Renew domain
  cmd
    .command("renew")
    .description("Renew a domain registration")
    .argument("<domain>", "Domain name")
    .option("--period <years>", "Renewal period in years")
    .option("--premium-price <price>", "Acknowledge premium price")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.period) body.period = parseInt(opts.period, 10);
        if (opts.premiumPrice)
          body.premium_price = parseFloat(opts.premiumPrice);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/renewals`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Renewal initiated for "${domain}" (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Get renewal status
  cmd
    .command("renewal")
    .description("Get renewal details")
    .argument("<domain>", "Domain name")
    .argument("<renewal-id>", "Renewal ID")
    .option("--json", "Output as JSON")
    .action(async (domain, renewalId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/renewals/${renewalId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue(resp.data);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Restore domain
  cmd
    .command("restore")
    .description("Restore an expired domain")
    .argument("<domain>", "Domain name")
    .option("--premium-price <price>", "Acknowledge premium price")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.premiumPrice)
          body.premium_price = parseFloat(opts.premiumPrice);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/restores`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Restore initiated for "${domain}" (ID: ${resp.data.id}, state: ${resp.data.state})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Auto-renewal
  cmd
    .command("auto-renew-enable")
    .description("Enable auto-renewal for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.put(
          `/${cfg.accountId}/registrar/domains/${domain}/auto_renewal`
        );
        printSuccess(`Auto-renewal enabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("auto-renew-disable")
    .description("Disable auto-renewal for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/auto_renewal`
        );
        printSuccess(`Auto-renewal disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Transfer lock
  cmd
    .command("transfer-lock-enable")
    .description("Enable transfer lock for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.post(
          `/${cfg.accountId}/registrar/domains/${domain}/transfer_lock`
        );
        printSuccess(`Transfer lock enabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("transfer-lock-disable")
    .description("Disable transfer lock for a domain")
    .argument("<domain>", "Domain name")
    .action(async (domain) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/registrar/domains/${domain}/transfer_lock`
        );
        printSuccess(`Transfer lock disabled for "${domain}".`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("transfer-lock-status")
    .description("Get transfer lock status for a domain")
    .argument("<domain>", "Domain name")
    .option("--json", "Output as JSON")
    .action(async (domain, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/registrar/domains/${domain}/transfer_lock`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({ "Transfer Lock": resp.data.enabled ? "enabled" : "disabled" });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
