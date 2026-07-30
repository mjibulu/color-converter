import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Tool } from "../tool/Tool";

type Theme = "light" | "dark";

function preferredTheme(): Theme {
  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function App() {
  const [theme, setTheme] = useState<Theme>(preferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="site-title" href="./" aria-label="Color Picker & Converter home">
          Color Picker & Converter
        </a>
        <button
          className="icon-button"
          type="button"
          aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? <Moon aria-hidden /> : <Sun aria-hidden />}
        </button>
      </header>

      <main>
        <section className="tool-introduction" aria-labelledby="tool-title">
          <p className="eyebrow">Browser-local utility</p>
          <h1 id="tool-title">Color Picker & Converter</h1>
          <p>Pick, convert, compare, and export colors with synchronized HEX, RGB, HSL, HSV, opacity, contrast, harmony, and palette controls.</p>
        </section>

        <section className="tool-workspace" aria-label="Tool workspace">
          <Tool />
        </section>

        <details className="information-section">
          <summary>How to use this tool</summary>
          <div className="information-content">
            <ol>
            <li>{"Choose a color visually or enter one of the supported color values."}</li>
            <li>{"Adjust channels or opacity and copy any synchronized output format."}</li>
            <li>{"Compare contrast, explore harmonies, or export the resulting palette."}</li>
            </ol>
          </div>
        </details>
      </main>

      <footer className="site-footer">
        <span>Open-source software under the MIT Licence.</span>
        <span>
          Created by M. Jibulu for{" "}
          <a href="https://eburp.com/">eBURP</a>.
        </span>
      </footer>
    </div>
  );
}
