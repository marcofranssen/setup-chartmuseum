# Setup Chartmuseum

This Github action installs [Chartmuseum][chartmuseum].

## Usage

Installs the `v0.15.0` release.

```yaml
steps:
  - uses: marcofranssen/setup-kubectl@v0.1.0
    id: chartmuseum
    with:
      chartmuseum-version: v0.15.0
  - run: echo ${{ steps.chartmuseum.output.version }}
```

[chartmuseum]: https://chartmuseum.com "Host your own Helm Chart Repository"
