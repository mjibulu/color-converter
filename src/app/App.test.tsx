import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

describe("Color Picker & Converter", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps editable color formats synchronized", () => {
    render(<App />);

    const hex = screen.getByRole("textbox", { name: "HEX" });
    fireEvent.change(hex, { target: { value: "#ff0000" } });

    expect(screen.getByRole("spinbutton", { name: "R" })).toHaveValue(255);
    expect(screen.getByRole("spinbutton", { name: "G" })).toHaveValue(0);
    expect(screen.getByRole("spinbutton", { name: "B" })).toHaveValue(0);
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
  });

  it("updates opacity and contrast settings without resetting the color", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Triadic" }));
    expect(screen.getByRole("button", { name: "Triadic" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const opacity = screen.getByRole("slider", { name: "Opacity" });
    fireEvent.change(opacity, { target: { value: "50" } });
    expect(opacity).toHaveValue("50");
    expect(screen.getByText(/Contrast includes the selected opacity/u)).toBeInTheDocument();
  });

  it("recovers valid saved colors and ignores corrupt entries", async () => {
    window.localStorage.setItem(
      "color-converter:saved-colors:v1",
      JSON.stringify(["#FF0000", "invalid", "#ff0000"]),
    );
    render(<App />);

    const saved = await screen.findByRole("button", {
      name: "Use saved color #FF0000",
    });
    expect(
      screen.queryByRole("button", { name: /invalid/u }),
    ).not.toBeInTheDocument();

    fireEvent.click(saved);
    expect(screen.getByRole("textbox", { name: "HEX" })).toHaveValue(
      "#FF0000",
    );
    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(
            "color-converter:saved-colors:v1",
          ) ?? "[]",
        ),
      ).toEqual(["#FF0000"]);
    });
  });
});
