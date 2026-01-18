import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("should display the dashboard title", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Personal Growth Tracker");
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Personal Growth Tracker/);
  });
});
