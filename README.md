# dnsimple-cli

A comprehensive CLI for the [DNSimple API v2](https://developer.dnsimple.com/v2/) — manage domains, DNS records, certificates, registration, and more from the terminal.

## Installation

### Homebrew (macOS/Linux)

```bash
brew tap serhiitroinin/tap
brew install dnsimple-cli
```

### From source

Requires [Bun](https://bun.sh) v1.0+:

```bash
git clone https://github.com/serhiitroinin/dnsimple-cli.git
cd dnsimple-cli
bun install
bun run build
# Binary at ./dist/dnsimple
```

### Direct download

Download the latest binary from [Releases](https://github.com/serhiitroinin/dnsimple-cli/releases).

## Authentication

Get your API token from the DNSimple dashboard under **Account → Access Tokens**.

```bash
# Login with your token
dnsimple auth login <your-token>

# Or use environment variables
export DNSIMPLE_TOKEN=your-token
export DNSIMPLE_ACCOUNT=12345

# Check auth status
dnsimple auth whoami

# Use sandbox environment
dnsimple auth login <your-sandbox-token> --sandbox
```

## Usage

```bash
dnsimple <command> <subcommand> [options]
```

Every command supports `--help` for detailed usage and `--json` for machine-readable output.

### Domains

```bash
dnsimple domains list
dnsimple domains get example.com
dnsimple domains create example.com
dnsimple domains delete example.com
```

### DNS Records

```bash
dnsimple records list example.com
dnsimple records create example.com --type A --name www --content 1.2.3.4 --ttl 300
dnsimple records update example.com 12345 --content 5.6.7.8
dnsimple records delete example.com 12345
dnsimple records check-distribution example.com 12345
```

### Domain Registration

```bash
dnsimple registrar check example.com
dnsimple registrar prices example.com
dnsimple registrar register example.com --registrant 1234
dnsimple registrar transfer example.com --registrant 1234 --auth-code XXXXXX
dnsimple registrar renew example.com
dnsimple registrar auto-renew-enable example.com
```

### Zones

```bash
dnsimple zones list
dnsimple zones get example.com
dnsimple zones file example.com          # Export BIND zone file
dnsimple zones check-distribution example.com
dnsimple zones activate example.com
```

### Certificates

```bash
dnsimple certificates list example.com
dnsimple certificates get example.com 123
dnsimple certificates download example.com 123
dnsimple certificates private-key example.com 123
dnsimple certificates letsencrypt-purchase example.com
dnsimple certificates letsencrypt-issue example.com 123
```

### Contacts

```bash
dnsimple contacts list
dnsimple contacts create --first-name John --last-name Doe --email john@example.com \
  --phone +1.5551234567 --address1 "123 Main St" --city NYC --state NY \
  --postal-code 10001 --country US
dnsimple contacts update 123 --email new@example.com
dnsimple contacts delete 123
```

### Templates

```bash
dnsimple templates list
dnsimple templates create --name "My Template" --sid my-template
dnsimple templates records-list my-template
dnsimple templates records-create my-template --type A --content 1.2.3.4
dnsimple templates apply example.com my-template
```

### Other Commands

```bash
dnsimple services list                    # One-click services
dnsimple services apply example.com heroku
dnsimple webhooks list                    # Webhook management
dnsimple webhooks create https://example.com/hook
dnsimple dnssec enable example.com        # DNSSEC
dnsimple email-forwards list example.com  # Email forwarding
dnsimple delegation list example.com      # Name server delegation
dnsimple whois-privacy enable example.com # WHOIS privacy
dnsimple tlds list                        # Browse TLDs
dnsimple billing list                     # Billing charges
dnsimple pushes list                      # Domain pushes
dnsimple registrant-changes create example.com --contact 123
dnsimple vanity-nameservers enable example.com
```

## JSON Output

Every command that displays data supports `--json` for structured output:

```bash
dnsimple domains list --json | jq '.[] | .name'
dnsimple records list example.com --json --type A
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DNSIMPLE_TOKEN` | API access token (overrides saved config) |
| `DNSIMPLE_ACCOUNT` | Account ID (overrides saved config) |

## All Commands

| Command | Description |
|---------|-------------|
| `auth` | Login, logout, check status, switch accounts |
| `accounts` | List accessible accounts |
| `billing` | View billing charges |
| `certificates` | Manage SSL/TLS certificates and Let's Encrypt |
| `contacts` | Manage domain contacts |
| `delegation` | Manage name server delegation |
| `dnssec` | Enable/disable DNSSEC, manage DS records |
| `domains` | List, create, delete domains |
| `email-forwards` | Manage email forwarding rules |
| `pushes` | Push domains between accounts |
| `records` | Create, update, delete DNS records |
| `registrant-changes` | Change domain registrant contacts |
| `registrar` | Register, transfer, renew domains |
| `services` | Apply one-click services (Heroku, Netlify, etc.) |
| `templates` | Manage DNS record templates |
| `tlds` | Browse supported TLDs and pricing |
| `vanity-nameservers` | Manage vanity name servers |
| `webhooks` | Manage webhook notifications |
| `zones` | Manage DNS zones, export zone files |

## Development

```bash
bun install
bun run dev -- domains list    # Run in dev mode
bun run build                  # Build standalone binary
```

## License

MIT
