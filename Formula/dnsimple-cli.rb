class DnsimpleCli < Formula
  desc "CLI for the DNSimple API — manage domains, DNS, certificates, and more"
  homepage "https://github.com/serhiitroinin/dnsimple-cli"
  version "1.0.2"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-x64.tar.gz"
      sha256 "669151b279f21111206294dc89c9667d280c918c14141421206c1cd11486eea1"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-arm64.tar.gz"
      sha256 "80137e5747cf0617c2e9747ba49e3330e7cd84cd1babd4e332fc7f1ef11520ad"

      def install
        bin.install "dnsimple"
      end
    end
  end

  on_linux do
    if Hardware::CPU.intel? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-x64.tar.gz"
      sha256 "6556ef20355c8f7c08060561ea0b97869c9b19009b1e8517fdeb71ef88b2f415"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-arm64.tar.gz"
      sha256 "c944869ddead27c67a2e4fff7aed360f5f0742d6a4b597508cedd7151d3b656d"

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
