import { expect, test } from "@playwright/test";
import { createExternalRequestGuard } from "../src/lib/network-guard";

test("color editing workflow stays local and synchronized", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Playwright baseURL is required.");
  const networkGuard = createExternalRequestGuard(baseURL);
  page.on("request", (request) => networkGuard.inspect(request.url()));

  await page.goto("/");
  await page
    .getByRole("textbox", { name: "HEX", exact: true })
    .fill("#ff0000");
  await expect(page.getByRole("spinbutton", { name: "R" })).toHaveValue("255");
  await expect(page.getByText("rgb(255, 0, 0)")).toBeVisible();

  await page.getByRole("slider", { name: "Opacity" }).fill("50");
  await expect(
    page.getByText(/Contrast includes the selected opacity/u),
  ).toBeVisible();
  await page.getByRole("button", { name: "Triadic" }).click();
  await expect(page.getByRole("button", { name: "Triadic" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  networkGuard.assertNoExternalRequests();
});
