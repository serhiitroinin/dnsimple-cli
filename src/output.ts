import chalk from "chalk";
import Table from "cli-table3";

export function printJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printSuccess(message: string): void {
  console.log(chalk.green("✓") + " " + message);
}

export function printError(message: string): void {
  console.error(chalk.red("✗") + " " + message);
}

export function printWarning(message: string): void {
  console.log(chalk.yellow("⚠") + " " + message);
}

export function printTable(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const table = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
  });

  for (const row of rows) {
    table.push(row.map((cell) => String(cell ?? "")));
  }

  console.log(table.toString());
}

export function printKeyValue(pairs: Record<string, any>): void {
  const maxKeyLen = Math.max(...Object.keys(pairs).map((k) => k.length));
  for (const [key, value] of Object.entries(pairs)) {
    const paddedKey = key.padEnd(maxKeyLen);
    console.log(`  ${chalk.cyan(paddedKey)}  ${value ?? chalk.dim("—")}`);
  }
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

export interface OutputOptions {
  json?: boolean;
}

export function handleOutput(data: any, opts: OutputOptions): void {
  if (opts.json) {
    printJson(data);
  }
}
