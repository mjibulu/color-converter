export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RgbaColor extends RgbColor {
  a: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${[r, g, b]
    .map((value) =>
      Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0"),
    )
    .join("")}`.toUpperCase();
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = hex.trim().replace(/^#/u, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
  if (!/^[0-9a-f]{6}$/iu.test(expanded)) {
    throw new Error("Enter a 3-digit or 6-digit HEX color.");
  }
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

export function hexToRgba(hex: string): RgbaColor {
  const normalized = hex.trim().replace(/^#/u, "");
  const expanded =
    normalized.length === 3 || normalized.length === 4
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
  if (!/^(?:[0-9a-f]{6}|[0-9a-f]{8})$/iu.test(expanded)) {
    throw new Error("Enter a 3, 4, 6, or 8-digit HEX color.");
  }
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
    a:
      expanded.length === 8
        ? Number.parseInt(expanded.slice(6, 8), 16) / 255
        : 1,
  };
}

export function rgbaToHex(
  { r, g, b, a }: RgbaColor,
  includeAlpha = true,
): string {
  const base = rgbToHex({ r, g, b });
  if (!includeAlpha) return base;
  const alpha = Math.round(clamp(a, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `${base}${alpha}`;
}

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  if (maximum === minimum) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }
  const delta = maximum - minimum;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue =
    maximum === red
      ? ((green - blue) / delta) % 6
      : maximum === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return {
    h: hue,
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;
  const [red, green, blue] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

export function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  let hue = 0;

  if (delta !== 0) {
    if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  if (hue < 0) hue += 360;
  return {
    h: Math.round(hue),
    s: Math.round((maximum === 0 ? 0 : delta / maximum) * 100),
    v: Math.round(maximum * 100),
  };
}

export function hsvToRgb({ h, s, v }: HsvColor): RgbColor {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const value = clamp(v, 0, 100) / 100;
  const chroma = value * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = value - chroma;
  const [red, green, blue] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

export function mixRgb(
  color: RgbColor,
  target: RgbColor,
  amount: number,
): RgbColor {
  const weight = clamp(amount, 0, 1);
  return {
    r: Math.round(color.r + (target.r - color.r) * weight),
    g: Math.round(color.g + (target.g - color.g) * weight),
    b: Math.round(color.b + (target.b - color.b) * weight),
  };
}

export function compositeRgb(
  foreground: RgbColor,
  background: RgbColor,
  alpha: number,
): RgbColor {
  return mixRgb(background, foreground, clamp(alpha, 0, 1));
}

export function createHueHarmony(
  color: RgbColor,
  offsets: readonly number[],
): RgbColor[] {
  const hsl = rgbToHsl(color);
  return offsets.map((offset) =>
    hslToRgb({ ...hsl, h: hsl.h + offset }),
  );
}

function relativeLuminance({ r, g, b }: RgbColor): number {
  const channels = [r, g, b].map((value) => {
    const channel = clamp(value, 0, 255) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return (
    (channels[0] ?? 0) * 0.2126 +
    (channels[1] ?? 0) * 0.7152 +
    (channels[2] ?? 0) * 0.0722
  );
}

export function contrastRatio(
  first: RgbColor,
  second: RgbColor,
): number {
  const brightest = Math.max(
    relativeLuminance(first),
    relativeLuminance(second),
  );
  const darkest = Math.min(
    relativeLuminance(first),
    relativeLuminance(second),
  );
  return (brightest + 0.05) / (darkest + 0.05);
}

export function closestContrastColor(
  color: RgbColor,
  background: RgbColor,
  targetRatio: number,
): RgbColor {
  const target = clamp(targetRatio, 1, 21);
  if (contrastRatio(color, background) >= target) return { ...color };
  const hsl = rgbToHsl(color);
  let best: { color: RgbColor; distance: number } | null = null;

  for (let lightnessStep = 0; lightnessStep <= 1000; lightnessStep += 1) {
    const lightness = lightnessStep / 10;
    const candidate = hslToRgb({ ...hsl, l: lightness });
    if (contrastRatio(candidate, background) < target) continue;
    const distance = Math.abs(lightness - hsl.l);
    if (!best || distance < best.distance) {
      best = { color: candidate, distance };
    }
  }

  if (best) return best.color;
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  return contrastRatio(black, background) >= contrastRatio(white, background)
    ? black
    : white;
}
