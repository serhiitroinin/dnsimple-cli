#!/usr/bin/env bun
import { Command } from "commander";

import { authCommand } from "./commands/auth.js";
import { accountsCommand } from "./commands/accounts.js";
import { domainsCommand } from "./commands/domains.js";
import { zonesCommand } from "./commands/zones.js";
import { recordsCommand } from "./commands/records.js";
import { registrarCommand } from "./commands/registrar.js";
import { certificatesCommand } from "./commands/certificates.js";
import { contactsCommand } from "./commands/contacts.js";
import { templatesCommand } from "./commands/templates.js";
import { servicesCommand } from "./commands/services.js";
import { webhooksCommand } from "./commands/webhooks.js";
import { dnssecCommand } from "./commands/dnssec.js";
import { emailForwardsCommand } from "./commands/email-forwards.js";
import { pushesCommand } from "./commands/pushes.js";
import { delegationCommand } from "./commands/delegation.js";
import { whoisPrivacyCommand } from "./commands/whois-privacy.js";
import { tldsCommand } from "./commands/tlds.js";
import { billingCommand } from "./commands/billing.js";
import { registrantChangesCommand } from "./commands/registrant-changes.js";
import { vanityNameserversCommand } from "./commands/vanity-nameservers.js";

const program = new Command();

program
  .name("dnsimple")
  .description(
    "CLI for the DNSimple API — manage domains, DNS, certificates, and more"
  )
  .version("1.0.2")
  .configureHelp({
    sortSubcommands: true,
  });

// Register all commands
program.addCommand(authCommand());
program.addCommand(accountsCommand());
program.addCommand(billingCommand());
program.addCommand(certificatesCommand());
program.addCommand(contactsCommand());
program.addCommand(delegationCommand());
program.addCommand(dnssecCommand());
program.addCommand(domainsCommand());
program.addCommand(emailForwardsCommand());
program.addCommand(pushesCommand());
program.addCommand(recordsCommand());
program.addCommand(registrantChangesCommand());
program.addCommand(registrarCommand());
program.addCommand(servicesCommand());
program.addCommand(templatesCommand());
program.addCommand(tldsCommand());
program.addCommand(vanityNameserversCommand());
program.addCommand(webhooksCommand());
program.addCommand(zonesCommand());

// Global error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err: any) {
  if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
    process.exit(0);
  }
  if (err.code === "commander.missingArgument" || err.code === "commander.missingMandatoryOptionValue") {
    // Commander already printed the error
    process.exit(1);
  }
  // Unexpected errors
  console.error(err.message || err);
  process.exit(1);
}
