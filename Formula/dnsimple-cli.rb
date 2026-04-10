class DnsimpleCli < Formula
  desc "CLI for the DNSimple API — manage domains, DNS, certificates, and more"
  homepage "https://github.com/serhiitroinin/dnsimple-cli"
  version "1.0.1"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-x64.tar.gz"
      sha256 "da8de580bfb3c6d5edea1457a0d887f7eb8c2e0734b49861dd3b457caede977c"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-arm64.tar.gz"
      sha256 "6c03bcb615109cf85e19a5b0a7458c5f2dcd2e03d4ec4e0de365e184d8cb634b"

      def install
        bin.install "dnsimple"
      end
    end
  end

  on_linux do
    if Hardware::CPU.intel? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-x64.tar.gz"
      sha256 "7fd55cbc8b9f0de164b50cec326a21783815d6c36e4b656267aaee2379df1d9d"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-arm64.tar.gz"
      sha256 "df8efde6ddb063db6e7716f43126bba4cd3e6aa36363e8ff118bb44544976310"

      def install
        bin.install "dnsimple"
      end
    end
  end

  test do
    # Version reports correctly.
    assert_match version.to_s, shell_output("#{bin}/dnsimple --version")

    # Help renders without crashing and lists a known subcommand.
    assert_match "domains", shell_output("#{bin}/dnsimple --help")

    # Unauthenticated status command exits cleanly (config dir is fresh in
    # the test sandbox, so the binary should report "Authenticated: no").
    assert_match "Authenticated", shell_output("#{bin}/dnsimple auth status")
  end
end
