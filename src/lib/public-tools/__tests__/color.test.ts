import {
  closestContrastColor,
  compositeRgb,
  contrastRatio,
  createHueHarmony,
  hexToRgb,
  hexToRgba,
  hslToRgb,
  hsvToRgb,
  mixRgb,
  rgbaToHex,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "../color";

describe("public color utilities", () => {
  it("round trips HEX, RGB, HSL, and HSV colors", () => {
    const rgb = { r: 79, g: 95, b: 214 };
    expect(hexToRgb("#4F5FD6")).toEqual(rgb);
    expect(rgbToHex(rgb)).toBe("#4F5FD6");
    for (const converted of [
      hslToRgb(rgbToHsl(rgb)),
      hsvToRgb(rgbToHsv(rgb)),
    ]) {
      expect(Math.abs(converted.r - rgb.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(converted.g - rgb.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(converted.b - rgb.b)).toBeLessThanOrEqual(2);
    }
  });

  it("preserves alpha channels and composites colors", () => {
    expect(hexToRgba("#4F5FD680")).toEqual({
      r: 79,
      g: 95,
      b: 214,
      a: 128 / 255,
    });
    expect(rgbaToHex({ r: 79, g: 95, b: 214, a: 0.5 })).toBe(
      "#4F5FD680",
    );
    expect(
      compositeRgb(
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
        0.5,
      ),
    ).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("creates mixes, harmonies, and accessible contrast adjustments", () => {
    expect(
      mixRgb(
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
        0.5,
      ),
    ).toEqual({ r: 128, g: 128, b: 128 });
    expect(
      createHueHarmony({ r: 255, g: 0, b: 0 }, [180])[0],
    ).toEqual({ r: 0, g: 255, b: 255 });
    const background = { r: 255, g: 255, b: 255 };
    const adjusted = closestContrastColor(
      { r: 119, g: 119, b: 119 },
      background,
      7,
    );
    expect(contrastRatio(adjusted, background)).toBeGreaterThanOrEqual(7);
  });

  it("supports shorthand and alpha HEX while rejecting malformed input", () => {
    expect(hexToRgb("#0af")).toEqual({ r: 0, g: 170, b: 255 });
    expect(hexToRgba("#0af8")).toEqual({
      r: 0,
      g: 170,
      b: 255,
      a: 136 / 255,
    });
    expect(() => hexToRgb("#12")).toThrow(/3-digit or 6-digit/u);
    expect(() => hexToRgba("#not-a-color")).toThrow(
      /3, 4, 6, or 8-digit/u,
    );
  });

  it("clamps channels and always returns a usable contrast suggestion", () => {
    expect(rgbToHex({ r: -20, g: 127.6, b: 500 })).toBe("#0080FF");
    const background = { r: 20, g: 20, b: 20 };
    const suggestion = closestContrastColor(
      { r: 30, g: 30, b: 30 },
      background,
      7,
    );
    expect(contrastRatio(suggestion, background)).toBeGreaterThanOrEqual(7);
  });
});
