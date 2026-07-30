import { useEffect, useMemo, useState, type KeyboardEvent, type PointerEvent, } from "react";
import { ArrowLeftRight, Check, Copy, Download, Pipette, Plus, X } from "lucide-react";
import { CopyButton } from "../components/CopyButton";
import { ValidationMessage } from "../components/ValidationMessage";
import { saveBlob } from "../lib/save-file";
import { closestContrastColor, compositeRgb, contrastRatio, createHueHarmony, hexToRgb, hexToRgba, hslToRgb, hsvToRgb, mixRgb, rgbaToHex, rgbToHex, rgbToHsl, rgbToHsv, type HslColor, type HsvColor, type RgbColor, } from "../lib/public-tools/color";
const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
const BLACK: RgbColor = { r: 0, g: 0, b: 0 };
const SAVED_COLORS_STORAGE_KEY = "color-converter:saved-colors:v1";
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
function Status({ pass, children }: {
    pass: boolean;
    children: React.ReactNode;
}) {
    return (<span className={`color-status ${pass ? "pass" : "fail"}`}>
      {pass ? <Check size={14} aria-hidden="true"/> : <X size={14} aria-hidden="true"/>}
      {children}
    </span>);
}
export function ColorConverterTool() {
    const [rgb, setRgb] = useState<RgbColor>({ r: 79, g: 95, b: 214 });
    const [hexInput, setHexInput] = useState("#4F5FD6");
    const [comparisonHex, setComparisonHex] = useState("#FFFFFF");
    const [comparisonInput, setComparisonInput] = useState("#FFFFFF");
    const [error, setError] = useState("");
    const [comparisonError, setComparisonError] = useState("");
    const [alpha, setAlpha] = useState(1);
    const [harmonyMode, setHarmonyMode] = useState<"complementary" | "analogous" | "triadic">("complementary");
    const [savedColors, setSavedColors] = useState<string[]>([]);
    const [savedColorsReady, setSavedColorsReady] = useState(false);
    const [contrastTarget, setContrastTarget] = useState("4.5");
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const comparison = hexToRgb(comparisonHex);
    const effectiveForeground = compositeRgb(rgb, comparison, alpha);
    const ratio = contrastRatio(effectiveForeground, comparison);
    const rgbValue = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const rgbaValue = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(alpha.toFixed(2))})`;
    const hslValue = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const hex8Value = rgbaToHex({ ...rgb, a: alpha });
    const cssValue = `--color: ${alpha < 1 ? rgbaValue : hex};`;
    const allValues = `HEX: ${hex}\nHEX8: ${hex8Value}\nRGB: ${rgbValue}\nRGBA: ${rgbaValue}\nHSL: ${hslValue}\nCSS: ${cssValue}`;
    const palette = useMemo(() => [
        ...[0.8, 0.6, 0.4, 0.2].map((amount) => mixRgb(rgb, WHITE, amount)),
        rgb,
        ...[0.2, 0.4, 0.6, 0.8].map((amount) => mixRgb(rgb, BLACK, amount)),
    ], [rgb]);
    const harmonyOffsets = harmonyMode === "analogous" ? [-30, 0, 30] : harmonyMode === "triadic" ? [0, 120, 240] : [0, 180];
    const harmony = createHueHarmony(rgb, harmonyOffsets);
    const targetRatio = Number(contrastTarget);
    const accessibleSuggestion = closestContrastColor(effectiveForeground, comparison, targetRatio);
    const previewLabelColor = contrastRatio(BLACK, comparison) >= 4.5 ? "#000000" : "#FFFFFF";
    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            try {
                const value: unknown = JSON.parse(window.localStorage.getItem(SAVED_COLORS_STORAGE_KEY) ?? "[]");
                if (Array.isArray(value)) {
                    const valid = value
                        .filter((entry): entry is string => typeof entry === "string" &&
                        /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/iu.test(entry))
                        .map((entry) => entry.toUpperCase());
                    setSavedColors([...new Set(valid)].slice(0, 8));
                }
            }
            catch {
                // Ignore unavailable or corrupt local storage.
            }
            finally {
                setSavedColorsReady(true);
            }
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);
    useEffect(() => {
        if (!savedColorsReady)
            return;
        try {
            window.localStorage.setItem(SAVED_COLORS_STORAGE_KEY, JSON.stringify(savedColors));
        }
        catch {
            // The current session still works when storage is unavailable.
        }
    }, [savedColors, savedColorsReady]);
    const applyRgb = (next: RgbColor) => {
        const normalized = {
            r: Math.round(clamp(next.r, 0, 255)),
            g: Math.round(clamp(next.g, 0, 255)),
            b: Math.round(clamp(next.b, 0, 255)),
        };
        setRgb(normalized);
        setHexInput(rgbToHex(normalized));
        setError("");
    };
    const setFromHex = (value: string) => {
        setHexInput(value.toUpperCase());
        try {
            const parsed = hexToRgba(value);
            setAlpha(parsed.a);
            setRgb({ r: parsed.r, g: parsed.g, b: parsed.b });
            setHexInput(parsed.a < 1 ? rgbaToHex(parsed) : rgbToHex(parsed));
            setError("");
        }
        catch {
            setError("Enter a valid 3, 4, 6, or 8-digit HEX color.");
        }
    };
    const updateRgb = (key: keyof RgbColor, value: number) => {
        applyRgb({ ...rgb, [key]: clamp(value, 0, 255) });
    };
    const updateHsl = (key: keyof HslColor, value: number) => {
        const maximum = key === "h" ? 360 : 100;
        applyRgb(hslToRgb({ ...hsl, [key]: clamp(value, 0, maximum) }));
    };
    const updateHsv = (next: HsvColor) => {
        applyRgb(hsvToRgb({
            h: clamp(next.h, 0, 360),
            s: clamp(next.s, 0, 100),
            v: clamp(next.v, 0, 100),
        }));
    };
    const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        updateHsv({
            h: hsv.h,
            s: ((event.clientX - bounds.left) / bounds.width) * 100,
            v: 100 - ((event.clientY - bounds.top) / bounds.height) * 100,
        });
    };
    const handlePickerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 5 : 1;
        let next = hsv;
        if (event.key === "ArrowLeft")
            next = { ...hsv, s: hsv.s - step };
        else if (event.key === "ArrowRight")
            next = { ...hsv, s: hsv.s + step };
        else if (event.key === "ArrowUp")
            next = { ...hsv, v: hsv.v + step };
        else if (event.key === "ArrowDown")
            next = { ...hsv, v: hsv.v - step };
        else
            return;
        event.preventDefault();
        updateHsv(next);
    };
    const setComparison = (value: string) => {
        const normalized = value.toUpperCase();
        setComparisonInput(normalized);
        try {
            const valid = rgbToHex(hexToRgb(normalized));
            setComparisonHex(valid);
            setComparisonError("");
        }
        catch {
            setComparisonError("Enter a valid comparison HEX color.");
        }
    };
    const swapContrastColors = () => {
        const currentHex = hex;
        applyRgb(comparison);
        setComparisonHex(currentHex);
        setComparisonInput(currentHex);
        setComparisonError("");
    };
    const formats = [
        { label: "HEX", value: hex },
        { label: "HEX8", value: hex8Value },
        { label: "RGB", value: rgbValue },
        { label: "RGBA", value: rgbaValue },
        { label: "HSL", value: hslValue },
        { label: "CSS", value: cssValue },
    ];
    const pickFromScreen = async () => {
        setError("");
        const EyeDropperConstructor = (window as unknown as {
            EyeDropper?: new () => {
                open(): Promise<{
                    sRGBHex: string;
                }>;
            };
        }).EyeDropper;
        if (!EyeDropperConstructor) {
            setError("Screen color picking is not supported by this browser.");
            return;
        }
        try {
            const result = await new EyeDropperConstructor().open();
            applyRgb(hexToRgb(result.sRGBHex));
        }
        catch {
            // Closing the browser picker is not an error.
        }
    };
    const saveCurrentColor = () => {
        const value = alpha < 1 ? hex8Value : hex;
        setSavedColors((current) => [value, ...current.filter((item) => item !== value)].slice(0, 8));
    };
    const downloadPalette = (format: "css" | "json") => {
        const values = harmony.map(rgbToHex);
        const content = format === "json"
            ? JSON.stringify({ source: hex, harmony: harmonyMode, colors: values }, null, 2)
            : `:root {\n${values.map((value, index) => `  --color-${harmonyMode}-${index + 1}: ${value};`).join("\n")}\n}\n`;
        const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/css" });
        void saveBlob(blob, `color-${harmonyMode}.${format}`);
    };
    return (<div className="color-studio">
      <section className="color-studio-main" aria-label="Color picker and values">
        <div className="visual-color-picker">
          <div className="color-section-heading">
            <div>
              <h2>Pick a color</h2>
              <p>Click or drag anywhere in the field, then fine-tune the hue.</p>
            </div>
            <span className="selected-color-chip">
              <span style={{ backgroundColor: hex }} aria-hidden="true"/>
              {hex}
            </span>
          </div>

          <div className="saturation-value-picker" style={{
            backgroundColor: `hsl(${hsv.h} 100% 50%)`,
            backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }} role="slider" tabIndex={0} aria-label="Color saturation and brightness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hsv.s} aria-valuetext={`${hsv.s}% saturation, ${hsv.v}% brightness`} onKeyDown={handlePickerKeyDown} onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event);
        }} onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
                updateFromPointer(event);
        }}>
            <span className="color-picker-handle" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hex }} aria-hidden="true"/>
          </div>

          <label className="hue-control">
            <span>Hue</span>
            <output>{hsv.h}°</output>
            <input type="range" min="0" max="360" value={hsv.h} aria-label="Hue" onChange={(event) => updateHsv({ ...hsv, h: Number(event.target.value) })}/>
          </label>

          <label className="hue-control alpha-control">
            <span>Opacity</span>
            <output>{Math.round(alpha * 100)}%</output>
            <input type="range" min="0" max="100" value={Math.round(alpha * 100)} aria-label="Opacity" onChange={(event) => setAlpha(Number(event.target.value) / 100)}/>
          </label>

          <div className="picked-color-row">
            <label className="current-color-well" title="Open the system color picker">
              <input type="color" aria-label="Open system color picker" value={hex} onChange={(event) => applyRgb(hexToRgb(event.target.value))}/>
              <span style={{ backgroundColor: hex }} aria-hidden="true"/>
            </label>
            <label className="color-text-field color-text-field-wide">
              <span>Selected color</span>
              <input aria-label="HEX" value={hexInput} spellCheck={false} onChange={(event) => setFromHex(event.target.value)} onBlur={() => {
            if (error) {
                setHexInput(hex);
                setError("");
            }
        }}/>
            </label>
            <CopyButton text={alpha < 1 ? hex8Value : hex} toolSlug="color-converter" className="color-icon-copy">
              <Copy size={17} aria-hidden="true"/>
              <span>Copy</span>
            </CopyButton>
          </div>
          <div className="color-picker-actions">
            <button type="button" className="secondary-button" onClick={pickFromScreen}>
              <Pipette size={16} aria-hidden="true"/>
              Pick from screen
            </button>
            <button type="button" className="secondary-button" onClick={saveCurrentColor}>
              <Plus size={16} aria-hidden="true"/>
              Save color
            </button>
          </div>
          {savedColors.length ? (<div className="recent-colors">
              <span>Saved colors</span>
              <div>
                {savedColors.map((value) => (<button type="button" key={value} style={{ backgroundColor: value.slice(0, 7) }} aria-label={`Use saved color ${value}`} title={value} onClick={() => setFromHex(value)}/>))}
                <button type="button" className="recent-colors-clear" onClick={() => setSavedColors([])}>Clear</button>
              </div>
            </div>) : null}
          {error ? <ValidationMessage type="error" message={error}/> : null}
        </div>

        <div className="color-value-inspector">
          <div className="color-section-heading">
            <div>
              <h2>Color values</h2>
              <p>Edit any channel. Every format stays in sync.</p>
            </div>
            <CopyButton text={allValues} toolSlug="color-converter" className="secondary-button">
              <Copy size={15} aria-hidden="true"/>
              <span>Copy all</span>
            </CopyButton>
          </div>

          <fieldset className="color-channel-group">
            <legend>RGB</legend>
            <div className="color-channel-grid">
              {(["r", "g", "b"] as const).map((key) => (<label key={key}>
                  <span>{key.toUpperCase()}</span>
                  <input type="number" min="0" max="255" aria-label={key.toUpperCase()} value={rgb[key]} onChange={(event) => updateRgb(key, Number(event.target.value))}/>
                </label>))}
            </div>
          </fieldset>

          <fieldset className="color-channel-group">
            <legend>HSL</legend>
            <div className="color-channel-grid">
              {(["h", "s", "l"] as const).map((key) => (<label key={key}>
                  <span>{key.toUpperCase()}</span>
                  <input type="number" min="0" max={key === "h" ? 360 : 100} aria-label={key.toUpperCase()} value={hsl[key]} onChange={(event) => updateHsl(key, Number(event.target.value))}/>
                  <small>{key === "h" ? "°" : "%"}</small>
                </label>))}
            </div>
          </fieldset>

          <div className="color-format-list" aria-label="Copyable color formats">
            {formats.map((format) => (<div key={format.label}>
                <span>{format.label}</span>
                <code>{format.value}</code>
                <CopyButton text={format.value} toolSlug="color-converter" ariaLabel={`Copy ${format.label} value`}>
                  <Copy size={15} aria-hidden="true"/>
                </CopyButton>
              </div>))}
          </div>
        </div>
      </section>

      <section className="contrast-workbench" aria-labelledby="contrast-heading">
        <div className="color-section-heading">
          <div>
            <h2 id="contrast-heading">Contrast checker</h2>
            <p>Test the selected color as text against a background.</p>
          </div>
          <button type="button" className="secondary-button contrast-swap" onClick={swapContrastColors}>
            <ArrowLeftRight size={16} aria-hidden="true"/>
            Swap colors
          </button>
        </div>

        <div className="contrast-layout">
          <div className="contrast-colors">
            <div className="contrast-color-field">
              <span>Foreground</span>
              <div>
                <i style={{ backgroundColor: hex }} aria-hidden="true"/>
                <code>{alpha < 1 ? hex8Value : hex}</code>
              </div>
            </div>
            <label className="contrast-color-field">
              <span>Background</span>
              <div>
                <input type="color" aria-label="Comparison color picker" value={comparisonHex} onChange={(event) => setComparison(event.target.value)}/>
                <input aria-label="Comparison HEX" value={comparisonInput} spellCheck={false} onChange={(event) => setComparison(event.target.value)} onBlur={() => {
            if (comparisonError) {
                setComparisonInput(comparisonHex);
                setComparisonError("");
            }
        }}/>
              </div>
            </label>
            {comparisonError ? <ValidationMessage type="error" message={comparisonError}/> : null}
          </div>

          <div className="contrast-preview" style={{ color: rgbaValue, backgroundColor: comparisonHex }} aria-hidden="true">
            <span style={{ color: previewLabelColor }}>Live preview</span>
            <strong>The quick brown fox jumps over the lazy dog.</strong>
            <small style={{ color: previewLabelColor }}>Small text remains readable when contrast is sufficient.</small>
          </div>

          <div className="contrast-score">
            <span>Contrast ratio</span>
            <strong>{ratio.toFixed(2)}:1</strong>
            <p>{ratio >= 4.5 ? "Good contrast for normal text" : "Increase contrast for normal text"}</p>
          </div>

          <div className="contrast-fix">
            <label>
              Contrast target
              <select value={contrastTarget} onChange={(event) => setContrastTarget(event.target.value)}>
                <option value="3">AA large text, 3:1</option>
                <option value="4.5">AA normal text, 4.5:1</option>
                <option value="7">AAA normal text, 7:1</option>
              </select>
            </label>
            <div>
              <span style={{ backgroundColor: rgbToHex(accessibleSuggestion) }} aria-hidden="true"/>
              <code>{rgbToHex(accessibleSuggestion)}</code>
              <button type="button" className="secondary-button" disabled={ratio >= targetRatio && alpha === 1} onClick={() => {
            applyRgb(accessibleSuggestion);
            setAlpha(1);
        }}>
                Use closest passing color
              </button>
            </div>
            {alpha < 1 ? <p>Contrast includes the selected opacity composited over this background.</p> : null}
          </div>

          <div className="contrast-standards">
            <div><span>WCAG AA</span><Status pass={ratio >= 4.5}>Normal text</Status><Status pass={ratio >= 3}>Large text</Status></div>
            <div><span>WCAG AAA</span><Status pass={ratio >= 7}>Normal text</Status><Status pass={ratio >= 4.5}>Large text</Status></div>
          </div>
        </div>
      </section>

      <section className="palette-section palette-workbench" aria-labelledby="palette-heading">
        <div className="color-section-heading">
          <div>
            <h2 id="palette-heading">Tints and shades</h2>
            <p>Select a swatch to continue editing it in the picker.</p>
          </div>
        </div>
        <div className="palette-strip">
          {palette.map((color, index) => {
            const value = rgbToHex(color);
            const textColor = contrastRatio(color, WHITE) >= 4.5 ? "#FFFFFF" : "#111111";
            const label = index < 4 ? `Tint ${4 - index}` : index === 4 ? "Current" : `Shade ${index - 4}`;
            return (<button type="button" key={`${value}-${index}`} style={{ backgroundColor: value, color: textColor }} onClick={() => applyRgb(color)} aria-label={`Use ${value}`} title={`Use ${value}`}>
                <span>{label}</span>
                <strong>{value}</strong>
              </button>);
        })}
        </div>
      </section>

      <section className="palette-section harmony-workbench" aria-labelledby="harmony-heading">
        <div className="color-section-heading">
          <div>
            <h2 id="harmony-heading">Color harmony</h2>
            <p>Build related colors from the selected hue, then export a reusable palette.</p>
          </div>
          <div className="harmony-downloads">
            <button type="button" className="secondary-button" onClick={() => downloadPalette("css")}>
              <Download size={15} aria-hidden="true"/>
              CSS
            </button>
            <button type="button" className="secondary-button" onClick={() => downloadPalette("json")}>
              <Download size={15} aria-hidden="true"/>
              JSON
            </button>
          </div>
        </div>
        <div className="segmented-control harmony-modes" aria-label="Harmony type">
          <button type="button" className={harmonyMode === "complementary" ? "active" : ""} aria-pressed={harmonyMode === "complementary"} onClick={() => setHarmonyMode("complementary")}>Complementary</button>
          <button type="button" className={harmonyMode === "analogous" ? "active" : ""} aria-pressed={harmonyMode === "analogous"} onClick={() => setHarmonyMode("analogous")}>Analogous</button>
          <button type="button" className={harmonyMode === "triadic" ? "active" : ""} aria-pressed={harmonyMode === "triadic"} onClick={() => setHarmonyMode("triadic")}>Triadic</button>
        </div>
        <div className="harmony-swatches">
          {harmony.map((color, index) => {
            const value = rgbToHex(color);
            const textColor = contrastRatio(color, WHITE) >= 4.5 ? "#FFFFFF" : "#111111";
            return (<button type="button" key={`${value}-${index}`} style={{ backgroundColor: value, color: textColor }} onClick={() => applyRgb(color)} aria-label={`Use harmony color ${value}`}>
                <span>{index === 0 ? "Source" : `Color ${index + 1}`}</span>
                <strong>{value}</strong>
              </button>);
        })}
        </div>
      </section>
    </div>);
}
