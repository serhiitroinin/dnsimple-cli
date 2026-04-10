import Conf from "conf";

export interface DnsimpleConfig {
  accessToken: string;
  accountId: string;
  sandbox: boolean;
  baseUrl: string;
}

const config = new Conf<DnsimpleConfig>({
  projectName: "dnsimple-cli",
  schema: {
    accessToken: { type: "string", default: "" },
    accountId: { type: "string", default: "" },
    sandbox: { type: "boolean", default: false },
    baseUrl: { type: "string", default: "https://api.dnsimple.com" },
  },
});

export function getConfig(): DnsimpleConfig {
  return {
    accessToken: process.env.DNSIMPLE_TOKEN || config.get("accessToken"),
    accountId: process.env.DNSIMPLE_ACCOUNT || config.get("accountId"),
    sandbox: config.get("sandbox"),
    baseUrl: config.get("sandbox")
      ? "https://api.sandbox.dnsimple.com"
      : "https://api.dnsimple.com",
  };
}

export function setConfig(key: keyof DnsimpleConfig, value: any): void {
  config.set(key, value);
  if (key === "sandbox") {
    config.set(
      "baseUrl",
      value
        ? "https://api.sandbox.dnsimple.com"
        : "https://api.dnsimple.com"
    );
  }
}

export function clearConfig(): void {
  config.clear();
}

export function getConfigPath(): string {
  return config.path;
}

export function requireAuth(): DnsimpleConfig {
  const cfg = getConfig();
  if (!cfg.accessToken) {
    console.error(
      'Error: Not authenticated. Run "dnsimple auth login" first or set DNSIMPLE_TOKEN env var.'
    );
    process.exit(1);
  }
  if (!cfg.accountId) {
    console.error(
      'Error: No account selected. Run "dnsimple auth whoami" to auto-detect or "dnsimple auth account <id>" to set.'
    );
    process.exit(1);
  }
  return cfg;
}
