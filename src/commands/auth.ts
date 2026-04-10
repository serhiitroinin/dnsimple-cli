import { Command } from "commander";
import { setConfig, getConfig, clearConfig, getConfigPath } from "../config.js";
import { DnsimpleClient } from "../client.js";
import { printSuccess, printError, printKeyValue } from "../output.js";

export function authCommand(): Command {
  const auth = new Command("auth").description("Manage authentication");

  auth
    .command("login")
    .description("Authenticate with a DNSimple API access token")
    .argument("<token>", "Your DNSimple API access token")
    .option("--sandbox", "Use the sandbox environment")
    .action(async (token: string, opts: { sandbox?: boolean }) => {
      if (opts.sandbox) {
        setConfig("sandbox", true);
      }
      setConfig("accessToken", token);

      try {
        const client = new DnsimpleClient();
        const resp = await client.get("/whoami");
        const account = resp.data.account;
        if (account) {
          setConfig("accountId", String(account.id));
          printSuccess(
            `Authenticated as ${account.email} (account: ${account.id})`
          );
        } else if (resp.data.user) {
          printSuccess(`Authenticated as user: ${resp.data.user.email}`);
          // Try to get accounts
          const accountsResp = await client.get("/accounts");
          if (accountsResp.data?.length === 1) {
            setConfig("accountId", String(accountsResp.data[0].id));
            printSuccess(`Auto-selected account: ${accountsResp.data[0].id}`);
          } else if (accountsResp.data?.length > 1) {
            console.log("\nMultiple accounts found:");
            for (const acc of accountsResp.data) {
              console.log(`  ${acc.id} - ${acc.email}`);
            }
            console.log(
              '\nRun "dnsimple auth account <id>" to select one.'
            );
          }
        }
      } catch (e: any) {
        clearConfig();
        printError(`Authentication failed: ${e.message}`);
        process.exit(1);
      }
    });

  auth
    .command("logout")
    .description("Remove stored credentials")
    .action(() => {
      clearConfig();
      printSuccess("Credentials removed.");
    });

  auth
    .command("whoami")
    .description("Display current authentication info")
    .action(async () => {
      const cfg = getConfig();
      if (!cfg.accessToken) {
        printError('Not authenticated. Run "dnsimple auth login <token>".');
        process.exit(1);
      }

      try {
        const client = new DnsimpleClient();
        const resp = await client.get("/whoami");
        const data = resp.data;

        if (data.account) {
          printKeyValue({
            Email: data.account.email,
            "Account ID": data.account.id,
            "Plan": data.account.plan_identifier,
          });
        }
        if (data.user) {
          printKeyValue({
            Email: data.user.email,
            "User ID": data.user.id,
          });
        }
        printKeyValue({
          Sandbox: cfg.sandbox ? "yes" : "no",
          "Config file": getConfigPath(),
        });
      } catch (e: any) {
        printError(e.message);
        process.exit(1);
      }
    });

  auth
    .command("account")
    .description("Set the active account ID")
    .argument("<id>", "Account ID")
    .action((id: string) => {
      setConfig("accountId", id);
      printSuccess(`Account set to ${id}`);
    });

  auth
    .command("sandbox")
    .description("Toggle sandbox mode")
    .argument("<on|off>", '"on" or "off"')
    .action((mode: string) => {
      const enabled = mode === "on" || mode === "true";
      setConfig("sandbox", enabled);
      printSuccess(`Sandbox mode ${enabled ? "enabled" : "disabled"}`);
    });

  auth
    .command("status")
    .description("Show current config")
    .action(() => {
      const cfg = getConfig();
      printKeyValue({
        Authenticated: cfg.accessToken ? "yes" : "no",
        "Account ID": cfg.accountId || "not set",
        Sandbox: cfg.sandbox ? "yes" : "no",
        "Base URL": cfg.baseUrl,
        "Config file": getConfigPath(),
        "Token (env)": process.env.DNSIMPLE_TOKEN ? "set" : "not set",
        "Account (env)": process.env.DNSIMPLE_ACCOUNT || "not set",
      });
    });

  return auth;
}
