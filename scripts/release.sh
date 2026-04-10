#!/bin/bash
set -euo pipefail

# Read version from package.json without requiring node.
# Falls back to bun if jq is not installed.
read_version() {
  if command -v jq >/dev/null 2>&1; then
    jq -r .version package.json
  else
    bun -e 'console.log(JSON.parse(await Bun.file("package.json").text()).version)'
  fi
}

VERSION="${1:-$(read_version)}"
DIST_DIR="dist"
ARCHES=(darwin-arm64 darwin-x64 linux-x64 linux-arm64)

echo "Building dnsimple-cli v${VERSION}..."
mkdir -p "${DIST_DIR}"

for arch in "${ARCHES[@]}"; do
  echo "→ Building ${arch}..."
  bun build src/index.ts --compile --target="bun-${arch}" --outfile "${DIST_DIR}/dnsimple-${arch}"
done

# Create tarballs (one binary per tarball, named `dnsimple` so the formula
# can do `bin.install "dnsimple"` regardless of arch).
echo "→ Creating tarballs..."
SHA_FILE="${DIST_DIR}/SHA256SUMS"
: > "${SHA_FILE}"

cd "${DIST_DIR}"
for arch in "${ARCHES[@]}"; do
  cp "dnsimple-${arch}" dnsimple
  tar -czf "dnsimple-${arch}.tar.gz" dnsimple
  rm dnsimple
  sha=$(shasum -a 256 "dnsimple-${arch}.tar.gz" | cut -d' ' -f1)
  echo "${sha}  dnsimple-${arch}.tar.gz" >> "$(basename "${SHA_FILE}")"
  echo "  Created dnsimple-${arch}.tar.gz (sha256: ${sha})"
done
cd ..

echo ""
echo "Done. Tarballs and SHA256SUMS are in ${DIST_DIR}/."
echo ""
echo "Next steps:"
echo "  1. gh release create v${VERSION} ${DIST_DIR}/dnsimple-*.tar.gz --title \"v${VERSION}\" --notes \"Release v${VERSION}\""
echo "  2. Update Formula/dnsimple-cli.rb with the sha256s in ${SHA_FILE}"
echo "  3. Copy Formula/dnsimple-cli.rb into the homebrew-tap repo and push"
echo ""
echo "Users can then install with:"
echo "  brew tap serhiitroinin/tap"
echo "  brew install dnsimple-cli"
