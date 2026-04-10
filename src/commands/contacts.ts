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

export function contactsCommand(): Command {
  const cmd = new Command("contacts").description("Manage contacts");

  cmd
    .command("list")
    .description("List all contacts")
    .option("--json", "Output as JSON")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/contacts`, {
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Label", "Name", "Email", "Organization", "Phone"],
          resp.data.map((c: any) => [
            c.id,
            c.label || "—",
            `${c.first_name} ${c.last_name}`,
            c.email,
            c.organization_name || "—",
            c.phone,
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get contact details")
    .argument("<contact-id>", "Contact ID")
    .option("--json", "Output as JSON")
    .action(async (contactId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/contacts/${contactId}`
        );
        if (opts.json) return printJson(resp.data);
        const c = resp.data;
        printKeyValue({
          ID: c.id,
          Label: c.label,
          "First Name": c.first_name,
          "Last Name": c.last_name,
          Email: c.email,
          Phone: c.phone,
          Fax: c.fax,
          "Job Title": c.job_title,
          Organization: c.organization_name,
          Address1: c.address1,
          Address2: c.address2,
          City: c.city,
          "State/Province": c.state_province,
          "Postal Code": c.postal_code,
          Country: c.country,
          "Created At": formatDate(c.created_at),
          "Updated At": formatDate(c.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Create a new contact")
    .requiredOption("--first-name <name>", "First name")
    .requiredOption("--last-name <name>", "Last name")
    .requiredOption("--email <email>", "Email address")
    .requiredOption("--phone <phone>", "Phone number (e.g. +1.5551234567)")
    .requiredOption("--address1 <address>", "Street address")
    .requiredOption("--city <city>", "City")
    .requiredOption("--state <state>", "State or province")
    .requiredOption("--postal-code <code>", "Postal/ZIP code")
    .requiredOption("--country <code>", "Country code (e.g. US, GB)")
    .option("--label <label>", "Contact label")
    .option("--organization <name>", "Organization name")
    .option("--job-title <title>", "Job title")
    .option("--address2 <address>", "Address line 2")
    .option("--fax <fax>", "Fax number")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          first_name: opts.firstName,
          last_name: opts.lastName,
          email: opts.email,
          phone: opts.phone,
          address1: opts.address1,
          city: opts.city,
          state_province: opts.state,
          postal_code: opts.postalCode,
          country: opts.country,
        };
        if (opts.label) body.label = opts.label;
        if (opts.organization) body.organization_name = opts.organization;
        if (opts.jobTitle) body.job_title = opts.jobTitle;
        if (opts.address2) body.address2 = opts.address2;
        if (opts.fax) body.fax = opts.fax;

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(`/${cfg.accountId}/contacts`, body);
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Contact created: ${resp.data.first_name} ${resp.data.last_name} (ID: ${resp.data.id})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("update")
    .description("Update a contact")
    .argument("<contact-id>", "Contact ID")
    .option("--first-name <name>", "First name")
    .option("--last-name <name>", "Last name")
    .option("--email <email>", "Email")
    .option("--phone <phone>", "Phone")
    .option("--address1 <address>", "Street address")
    .option("--city <city>", "City")
    .option("--state <state>", "State/Province")
    .option("--postal-code <code>", "Postal code")
    .option("--country <code>", "Country code")
    .option("--label <label>", "Label")
    .option("--organization <name>", "Organization")
    .option("--job-title <title>", "Job title")
    .option("--address2 <address>", "Address line 2")
    .option("--fax <fax>", "Fax")
    .option("--json", "Output as JSON")
    .action(async (contactId, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.firstName) body.first_name = opts.firstName;
        if (opts.lastName) body.last_name = opts.lastName;
        if (opts.email) body.email = opts.email;
        if (opts.phone) body.phone = opts.phone;
        if (opts.address1) body.address1 = opts.address1;
        if (opts.city) body.city = opts.city;
        if (opts.state) body.state_province = opts.state;
        if (opts.postalCode) body.postal_code = opts.postalCode;
        if (opts.country) body.country = opts.country;
        if (opts.label) body.label = opts.label;
        if (opts.organization) body.organization_name = opts.organization;
        if (opts.jobTitle) body.job_title = opts.jobTitle;
        if (opts.address2) body.address2 = opts.address2;
        if (opts.fax) body.fax = opts.fax;

        const client = new DnsimpleClient(cfg);
        const resp = await client.patch(
          `/${cfg.accountId}/contacts/${contactId}`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Contact ${contactId} updated.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Delete a contact")
    .argument("<contact-id>", "Contact ID")
    .action(async (contactId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/contacts/${contactId}`);
        printSuccess(`Contact ${contactId} deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
