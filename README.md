# Setup Chartmuseum

This Github action installs [Chartmuseum][chartmuseum].

## Usage

### Install only

Installs the `v0.15.0` release.

```yaml
steps:
  - uses: marcofranssen/setup-chartmuseum@v0.1.0
    id: chartmuseum
    with:
      chartmuseum-version: v0.15.0
  - run: echo ${{ steps.chartmuseum.output.chartmuseum-version }}
```

### Bootup chartmuseum

```yaml
steps:
  - uses: marcofranssen/setup-chartmuseum@v0.1.0
    id: chartmuseum
    with:
      chartmuseum-bootup: true
  - run: helm repo add my-repo ${{ steps.chartmuseum.output.chartmuseum-endpoint }}
```

## Development

Use Node.js 24 and pnpm:

```sh
pnpm install
pnpm build
```

Commit the regenerated `dist/` directory with source or dependency changes.
The tsup build bundles dependencies into `dist/index.cjs` and
`dist/shutdown-chartmuseum/index.cjs`, including source maps. Consumers do not
need to install dependencies. Each build removes stale distribution files.
Use `pnpm build:watch` to rebuild both entrypoints during development.
The `pnpm-workspace.yaml` build policy permits esbuild's installation script,
so dependency installation also works non-interactively in CI.

[chartmuseum]: https://chartmuseum.com "Host your own Helm Chart Repository"
