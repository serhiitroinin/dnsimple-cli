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

export function templatesCommand(): Command {
  const cmd = new Command("templates").description("Manage DNS templates");

  cmd
    .command("list")
    .description("List all templates")
    .option("--json", "Output as JSON")
    .option("--page <n>", "Page number", "1")
    .option("--per-page <n>", "Results per page", "25")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(`/${cfg.accountId}/templates`, {
          page: opts.page,
          per_page: opts.perPage,
        });
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "SID", "Name", "Description"],
          resp.data.map((t: any) => [t.id, t.sid, t.name, t.description || "—"])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("get")
    .description("Get template details")
    .argument("<template>", "Template ID or short name")
    .option("--json", "Output as JSON")
    .action(async (template, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/templates/${template}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue({
          ID: resp.data.id,
          SID: resp.data.sid,
          Name: resp.data.name,
          Description: resp.data.description,
          "Created At": formatDate(resp.data.created_at),
          "Updated At": formatDate(resp.data.updated_at),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("create")
    .description("Create a new template")
    .requiredOption("--name <name>", "Template name")
    .requiredOption("--sid <sid>", "Short name identifier")
    .option("--description <desc>", "Description")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const cfg = requireAuth();
      try {
        const body: any = { name: opts.name, sid: opts.sid };
        if (opts.description) body.description = opts.description;

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(`/${cfg.accountId}/templates`, body);
        if (opts.json) return printJson(resp.data);
        printSuccess(
          `Template "${resp.data.name}" created (ID: ${resp.data.id})`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("update")
    .description("Update a template")
    .argument("<template>", "Template ID or short name")
    .option("--name <name>", "New name")
    .option("--sid <sid>", "New short name")
    .option("--description <desc>", "New description")
    .option("--json", "Output as JSON")
    .action(async (template, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {};
        if (opts.name) body.name = opts.name;
        if (opts.sid) body.sid = opts.sid;
        if (opts.description) body.description = opts.description;

        const client = new DnsimpleClient(cfg);
        const resp = await client.patch(
          `/${cfg.accountId}/templates/${template}`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Template "${resp.data.name}" updated.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("delete")
    .description("Delete a template")
    .argument("<template>", "Template ID or short name")
    .action(async (template) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(`/${cfg.accountId}/templates/${template}`);
        printSuccess(`Template "${template}" deleted.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Template records
  cmd
    .command("records-list")
    .description("List records in a template")
    .argument("<template>", "Template ID or short name")
    .option("--json", "Output as JSON")
    .action(async (template, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/templates/${template}/records`
        );
        if (opts.json) return printJson(resp.data);
        printTable(
          ["ID", "Name", "Type", "Content", "TTL", "Priority"],
          resp.data.map((r: any) => [
            r.id,
            r.name || "@",
            r.type,
            r.content,
            r.ttl,
            r.priority ?? "—",
          ])
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("records-create")
    .description("Add a record to a template")
    .argument("<template>", "Template ID or short name")
    .requiredOption("--type <type>", "Record type")
    .requiredOption("--content <content>", "Record content")
    .option("--name <name>", "Record name", "")
    .option("--ttl <seconds>", "TTL", "3600")
    .option("--priority <n>", "Priority")
    .option("--json", "Output as JSON")
    .action(async (template, opts) => {
      const cfg = requireAuth();
      try {
        const body: any = {
          name: opts.name,
          type: opts.type.toUpperCase(),
          content: opts.content,
          ttl: parseInt(opts.ttl, 10),
        };
        if (opts.priority) body.priority = parseInt(opts.priority, 10);

        const client = new DnsimpleClient(cfg);
        const resp = await client.post(
          `/${cfg.accountId}/templates/${template}/records`,
          body
        );
        if (opts.json) return printJson(resp.data);
        printSuccess(`Record added to template (ID: ${resp.data.id})`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("records-get")
    .description("Get a template record")
    .argument("<template>", "Template ID or short name")
    .argument("<record-id>", "Record ID")
    .option("--json", "Output as JSON")
    .action(async (template, recordId, opts) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        const resp = await client.get(
          `/${cfg.accountId}/templates/${template}/records/${recordId}`
        );
        if (opts.json) return printJson(resp.data);
        printKeyValue(resp.data);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  cmd
    .command("records-delete")
    .description("Remove a record from a template")
    .argument("<template>", "Template ID or short name")
    .argument("<record-id>", "Record ID")
    .action(async (template, recordId) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.delete(
          `/${cfg.accountId}/templates/${template}/records/${recordId}`
        );
        printSuccess(`Record ${recordId} removed from template.`);
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  // Apply template to domain
  cmd
    .command("apply")
    .description("Apply a template to a domain")
    .argument("<domain>", "Domain name or ID")
    .argument("<template>", "Template ID or short name")
    .action(async (domain, template) => {
      const cfg = requireAuth();
      try {
        const client = new DnsimpleClient(cfg);
        await client.post(
          `/${cfg.accountId}/domains/${domain}/templates/${template}`
        );
        printSuccess(
          `Template "${template}" applied to domain "${domain}".`
        );
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  return cmd;
}
