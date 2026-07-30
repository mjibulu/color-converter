# Color Picker & Converter

Pick, convert, compare, and export colors with synchronized HEX, RGB, HSL, HSV, opacity, contrast, harmony, and palette controls.

## Features

- Direct saturation, brightness, hue, and opacity controls
- Synchronized HEX, RGB, RGBA, HSL, and HSV values
- Contrast testing and accessible adjustment suggestions
- Color harmonies, mixing, saved colors, and palette export
- Optional browser eyedropper support

## Screenshot

![Color Picker & Converter interface](./public/tool-preview.webp)

## Browser support and limitations

The current stable releases of Chromium, Firefox, and Safari are supported.

- The screen eyedropper is available only in browsers that implement the EyeDropper API; manual entry and the colour picker remain available everywhere.
- Copying a colour may require a user gesture or clipboard permission.

## Run locally

Requirements:

- Node.js 24.x
- Corepack

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

## Verify

Fast checks:

```bash
pnpm run check
```

Complete browser verification:

```bash
pnpm run verify
```

## Build and host

```bash
pnpm run build
```

Upload the contents of `dist/` to a static host. The application supports both
root and subdirectory hosting and needs no environment variables.

The same output can be deployed with GitHub Pages, Netlify, Cloudflare Pages,
Vercel static hosting, or an ordinary file upload.

## Data and network behaviour

The application ships without analytics or telemetry. Tool processing occurs
in the browser, and the primary browser tests fail unexpected external
requests. See [PRIVACY.md](./PRIVACY.md) for the storage and browser API
inventory.

## Contributing

Issues and pull requests are welcome. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a change.

## Credits

Created by M. Jibulu for [eBURP](https://eburp.com/).

## Licence

Original code is available under the [MIT Licence](./LICENSE). Dependencies and
assets retain their own licences; see
[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
