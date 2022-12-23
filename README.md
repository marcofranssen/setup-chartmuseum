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

[chartmuseum]: https://chartmuseum.com "Host your own Helm Chart Repository"
