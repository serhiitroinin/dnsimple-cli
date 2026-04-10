class DnsimpleCli < Formula
  desc "CLI for the DNSimple API — manage domains, DNS, certificates, and more"
  homepage "https://github.com/serhiitroinin/dnsimple-cli"
  version "1.0.2"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-x64.tar.gz"
      sha256 "33d0dd238e719045c5b1d2dff6112246975bc7247378f320b00fe06a4d05a1f7"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-arm64.tar.gz"
      sha256 "2b6aa2621fda6f567fa09c2507dd43de4a4eb033a85b437bb0e550b299e99e20"

      def install
        bin.install "dnsimple"
      end
    end
  end

  on_linux do
    if Hardware::CPU.intel? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-x64.tar.gz"
      sha256 "ef36da0422ef9392015a208e127faf41915663e5c9654c0a928298480279118d"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-arm64.tar.gz"
      sha256 "398237f81908c58325ea9d9d7496d1b2a3c45240cba40fb66a21577b45b3ff3b"

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
