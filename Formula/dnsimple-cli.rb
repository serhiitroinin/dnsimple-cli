class DnsimpleCli < Formula
  desc "CLI for the DNSimple API — manage domains, DNS, certificates, and more"
  homepage "https://github.com/serhiitroinin/dnsimple-cli"
  version "1.0.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-x64.tar.gz"
      sha256 "02d49f9488cb9f06d626731a52d7be922c732f83c9457cb3c3274f29a0bcfe18"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-darwin-arm64.tar.gz"
      sha256 "45d4ed4ec4272c0d8b2ae2cb4be9bae591b7976ab076222181a220e7c71e0df0"

      def install
        bin.install "dnsimple"
      end
    end
  end

  on_linux do
    if Hardware::CPU.intel? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-x64.tar.gz"
      sha256 "e228e415f909b06fdbe5f2d102a8e6cf078cffab908b60bf5e2821f19c37834a"

      def install
        bin.install "dnsimple"
      end
    end
    if Hardware::CPU.arm? && Hardware::CPU.is_64_bit?
      url "https://github.com/serhiitroinin/dnsimple-cli/releases/download/v#{version}/dnsimple-linux-arm64.tar.gz"
      sha256 "8ae203360e5c342e855ee5459d360475fc693fc2961a5e2af49f45816d006b23"

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
