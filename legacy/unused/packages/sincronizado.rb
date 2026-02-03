class Sincronizado < Formula
  desc "Hyper-local development stack with remote AI execution"
  homepage "https://github.com/microck/sincronizado"
  url "https://github.com/microck/sincronizado/archive/refs/heads/main.tar.gz"
  version "0.1.0"
  license "MIT"

  depends_on "mutagen-io/mutagen/mutagen"
  depends_on "tailscale"

  def install
    bin.install "launcher/opencode.sh" => "sincronizado"
    bin.install "scripts/setup-vps.sh"
    bin.install "scripts/config-wizard.sh" => "sincronizado-config"
    
    (share/"sincronizado").install "config/.opencode.config.json" => "config.example.json"
    (share/"sincronizado").install "docs"
  end

  def caveats
    <<~EOS
      Sincronizado has been installed!

      To get started:
        1. Set up your VPS: setup-vps.sh (on VPS)
        2. Create config: sincronizado-config
        3. Start developing: sincronizado

      Documentation: #{share}/sincronizado/docs
    EOS
  end

  test do
    assert_match "Sincronizado", shell_output("#{bin}/sincronizado --help 2>&1 || true")
  end
end
