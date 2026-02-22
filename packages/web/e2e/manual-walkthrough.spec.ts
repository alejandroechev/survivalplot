import { test, expect, type Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const SAMPLES = [
  "Lung Cancer Trial",
  "Heart Failure Study",
  "Engineering Reliability",
  "Overlapping Curves",
  "Dose-Response Trial",
];

function chartSvg(page: Page) {
  return page
    .locator(
      ".recharts-responsive-container > .recharts-wrapper > svg.recharts-surface"
    )
    .first();
}

async function selectSample(page: Page, index: number) {
  const select = page.locator("select.btn-secondary");
  await select.selectOption(String(index));
}

async function clickAnalyze(page: Page) {
  await page.click("button:has-text('Analyze')");
}

// ─── 1. App Load ──────────────────────────────────────────────────────────
test.describe("1. App Load", () => {
  test("page loads with title SurvivalPlot", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toContain("Survival");
    expect(text).toContain("Plot");
  });

  test("sample data pre-loaded in textarea", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    const val = await textarea.inputValue();
    expect(val).toContain("Time");
    expect(val).toContain("Event");
    expect(val).toContain("Group");
    expect(val.split("\n").length).toBeGreaterThan(10);
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});

// ─── 2. Theme ─────────────────────────────────────────────────────────────
test.describe("2. Theme Toggle", () => {
  test("theme button has title attribute", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button[title='Toggle theme']");
    await expect(btn).toBeVisible();
  });

  test("theme button shows icon only, no 'Theme' text", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button[title='Toggle theme']");
    const text = await btn.textContent();
    expect(text!.trim()).not.toContain("Theme");
    // Should be an emoji icon (moon or sun)
    expect(text!.trim().length).toBeLessThanOrEqual(3);
  });

  test("toggling theme persists in localStorage", async ({ page }) => {
    await page.goto("/");
    // Toggle to dark
    await page.click("button[title='Toggle theme']");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const stored = await page.evaluate(() =>
      localStorage.getItem("survivalplot-theme")
    );
    expect(stored).toBe("dark");

    // Toggle back to light
    await page.click("button[title='Toggle theme']");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const stored2 = await page.evaluate(() =>
      localStorage.getItem("survivalplot-theme")
    );
    expect(stored2).toBe("light");
  });

  test("theme persists after reload", async ({ page }) => {
    await page.goto("/");
    await page.click("button[title='Toggle theme']");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    // Clean up
    await page.click("button[title='Toggle theme']");
  });
});

// ─── 3. Samples Combobox ──────────────────────────────────────────────────
test.describe("3. Samples Combobox", () => {
  test("select element has btn-secondary class", async ({ page }) => {
    await page.goto("/");
    const sel = page.locator("select.btn-secondary");
    await expect(sel).toBeVisible();
  });

  test("has placeholder option '📂 Samples'", async ({ page }) => {
    await page.goto("/");
    const sel = page.locator("select.btn-secondary");
    const placeholder = sel.locator("option[disabled]");
    await expect(placeholder).toHaveText("📂 Samples");
  });

  test("has correct number of options (5 samples + 1 placeholder)", async ({
    page,
  }) => {
    await page.goto("/");
    const sel = page.locator("select.btn-secondary");
    const opts = sel.locator("option");
    await expect(opts).toHaveCount(6);
  });

  test("selecting a sample updates the textarea", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    const before = await textarea.inputValue();
    await selectSample(page, 2); // Engineering Reliability
    const after = await textarea.inputValue();
    expect(after).not.toBe(before);
    expect(after).toContain("Component A");
  });

  test("select resets to placeholder after selection", async ({ page }) => {
    await page.goto("/");
    const sel = page.locator("select.btn-secondary");
    await sel.selectOption("1");
    // After selecting, the code sets value back to ""
    await page.waitForTimeout(200);
    const val = await sel.inputValue();
    expect(val).toBe("");
  });
});

// ─── 4. Analyze ───────────────────────────────────────────────────────────
test.describe("4. Analyze", () => {
  test("KM curves rendered after analyze", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(
      page.locator("text=Kaplan-Meier Survival Curve")
    ).toBeVisible();
    await expect(chartSvg(page)).toBeVisible();
  });

  test("CI bands (area elements) present on chart", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const areas = page.locator(".recharts-area");
    await expect(areas.first()).toBeVisible();
  });

  test("stat cards show median survival, p-value, hazard ratio", async ({
    page,
  }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Median survival").first()).toBeVisible();
    await expect(page.locator("text=Log-Rank p-value")).toBeVisible();
    await expect(page.locator("text=Hazard Ratio")).toBeVisible();
  });

  test("at-risk table visible with correct structure", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Number at Risk")).toBeVisible();
    const table = page.locator("table.at-risk-table");
    await expect(table).toBeVisible();
    // Should have header row and 2 data rows (Control + Treatment)
    const headerCells = table.locator("thead th");
    const headerCount = await headerCells.count();
    expect(headerCount).toBeGreaterThan(2); // Group + time points
    const bodyRows = table.locator("tbody tr");
    await expect(bodyRows).toHaveCount(2);
  });

  test("Y-axis shows percentage format", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const yTicks = page.locator(
      ".recharts-yAxis .recharts-cartesian-axis-tick-value"
    );
    const texts: string[] = [];
    for (let i = 0; i < (await yTicks.count()); i++) {
      texts.push((await yTicks.nth(i).textContent()) ?? "");
    }
    expect(texts.some((t) => t.includes("%"))).toBe(true);
    expect(texts).toContain("100%");
    expect(texts).toContain("0%");
  });

  test("50% reference line visible", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const refLine = page.locator(".recharts-reference-line");
    await expect(refLine).toBeVisible();
  });

  test("chart legend shows group names", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const legend = page.locator(".recharts-legend-wrapper");
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Control");
    await expect(legend).toContainText("Treatment");
  });
});

// ─── 5. File Upload ───────────────────────────────────────────────────────
test.describe("5. File Upload", () => {
  test("Upload button visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("button:has-text('Upload')")).toBeVisible();
  });

  test("uploading a CSV file loads data into textarea", async ({ page }) => {
    await page.goto("/");
    const csvContent =
      "Time,Event,Group\n5,1,A\n10,0,A\n15,1,B\n20,1,B\n25,0,A\n30,1,B\n35,1,A\n40,0,B";
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });
    const textarea = page.locator("textarea");
    await expect(textarea).toHaveValue(csvContent);
  });

  test("uploaded CSV can be analyzed", async ({ page }) => {
    await page.goto("/");
    const csvContent =
      "Time,Event,Group\n5,1,A\n10,0,A\n15,1,B\n20,1,B\n25,0,A\n30,1,B\n35,1,A\n40,0,B";
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });
    await clickAnalyze(page);
    await expect(chartSvg(page)).toBeVisible();
  });

  test("file input accepts .csv,.tsv,.txt", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    const accept = await fileInput.getAttribute("accept");
    expect(accept).toContain(".csv");
    expect(accept).toContain(".tsv");
    expect(accept).toContain(".txt");
  });
});

// ─── 6. Section Exports ──────────────────────────────────────────────────
test.describe("6. Section Exports", () => {
  test("Export Data button visible before analysis", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("button:has-text('Export Data')")
    ).toBeVisible();
  });

  test("all export buttons visible after analysis", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(
      page.locator("button:has-text('Export Data')")
    ).toBeVisible();
    await expect(
      page.locator("button:has-text('Export Results')")
    ).toBeVisible();
    await expect(page.locator("button:has-text('PNG')")).toBeVisible();
    await expect(page.locator("button:has-text('SVG')")).toBeVisible();
    await expect(page.locator("button:has-text('CSV')")).toBeVisible();
    await expect(
      page.locator("button:has-text('Export Table')")
    ).toBeVisible();
  });

  test("Export Data triggers download", async ({ page }) => {
    await page.goto("/");
    const downloadPromise = page.waitForEvent("download");
    await page.click("button:has-text('Export Data')");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("survival-data.csv");
  });

  test("Export Results triggers download after analysis", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const downloadPromise = page.waitForEvent("download");
    await page.click("button:has-text('Export Results')");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("km-results.csv");
  });

  test("Export Table triggers download after analysis", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const downloadPromise = page.waitForEvent("download");
    await page.click("button:has-text('Export Table')");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("at-risk-table.csv");
  });

  test("Chart CSV export triggers download", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const downloadPromise = page.waitForEvent("download");
    // The CSV button in the chart section
    await page.locator(".chart-container button:has-text('CSV')").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("km-data.csv");
  });
});

// ─── 7. All 5 Samples ────────────────────────────────────────────────────
test.describe("7. All 5 Samples", () => {
  for (let i = 0; i < SAMPLES.length; i++) {
    test(`sample ${i}: "${SAMPLES[i]}" — loads data and analyzes without error`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto("/");
      if (i > 0) await selectSample(page, i);
      await clickAnalyze(page);

      // Chart rendered
      await expect(chartSvg(page)).toBeVisible();
      // Median survival shown
      await expect(
        page.locator("text=Median survival").first()
      ).toBeVisible();
      // At-risk table shown
      await expect(page.locator("table.at-risk-table")).toBeVisible();
      // No errors
      expect(errors).toEqual([]);
    });
  }
});

// ─── 8. Edge Cases ────────────────────────────────────────────────────────
test.describe("8. Edge Cases", () => {
  test("empty data → shows error, no crash", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("");
    await clickAnalyze(page);
    await expect(page.locator(".error-msg")).toBeVisible();
    // No chart
    await expect(
      page.locator(".recharts-responsive-container")
    ).not.toBeVisible();
  });

  test("header only, no data rows → shows error", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("Time\tEvent\tGroup");
    await clickAnalyze(page);
    await expect(page.locator(".error-msg")).toBeVisible();
  });

  test("single group → KM curve but no log-rank or HR", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(
      `Time\tEvent\tGroup\n5\t1\tSolo\n10\t1\tSolo\n15\t0\tSolo\n20\t1\tSolo\n25\t1\tSolo`
    );
    await clickAnalyze(page);
    await expect(chartSvg(page)).toBeVisible();
    await expect(page.locator("text=Median survival")).toBeVisible();
    await expect(page.locator("text=Log-Rank p-value")).not.toBeVisible();
    await expect(page.locator("text=Hazard Ratio")).not.toBeVisible();
  });

  test("all censored → handles gracefully, no crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(
      `Time\tEvent\tGroup\n5\t0\tA\n10\t0\tA\n15\t0\tA\n20\t0\tB\n25\t0\tB\n30\t0\tB`
    );
    await clickAnalyze(page);

    // Either shows chart or error, but no crash
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test("three groups → KM curves but no log-rank (only for 2 groups)", async ({
    page,
  }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(
      `Time\tEvent\tGroup\n5\t1\tA\n10\t1\tA\n15\t1\tB\n20\t1\tB\n25\t1\tC\n30\t1\tC`
    );
    await clickAnalyze(page);
    await expect(chartSvg(page)).toBeVisible();
    // Log-rank is only for 2 groups
    await expect(page.locator("text=Log-Rank p-value")).not.toBeVisible();
  });

  test("invalid data format → shows error", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("this is not valid data at all");
    await clickAnalyze(page);
    await expect(page.locator(".error-msg")).toBeVisible();
  });
});

// ─── 9. Guide/Feedback Buttons ───────────────────────────────────────────
test.describe("9. Guide/Feedback Buttons", () => {
  test("Guide button visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("button:has-text('Guide')")).toBeVisible();
  });

  test("Feedback button visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("button:has-text('Feedback')")).toBeVisible();
  });

  test("Feedback button has title attribute", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button:has-text('Feedback')");
    const title = await btn.getAttribute("title");
    expect(title).toBe("Feedback");
  });
});

// ─── 10. Toolbar Alignment ───────────────────────────────────────────────
test.describe("10. Toolbar Alignment", () => {
  test("toolbar uses flexbox layout", async ({ page }) => {
    await page.goto("/");
    const toolbar = page.locator(".toolbar");
    const display = await toolbar.evaluate(
      (el) => getComputedStyle(el).display
    );
    expect(display).toBe("flex");
  });

  test("toolbar items are vertically centered", async ({ page }) => {
    await page.goto("/");
    const toolbar = page.locator(".toolbar");
    const alignItems = await toolbar.evaluate(
      (el) => getComputedStyle(el).alignItems
    );
    expect(alignItems).toBe("center");
  });

  test("toolbar spacer pushes right-side buttons", async ({ page }) => {
    await page.goto("/");
    const spacer = page.locator(".toolbar-spacer");
    await expect(spacer).toHaveCount(1);
    const flex = await spacer.evaluate(
      (el) => getComputedStyle(el).flexGrow
    );
    expect(flex).toBe("1");
  });

  test("toolbar has proper gap between items", async ({ page }) => {
    await page.goto("/");
    const toolbar = page.locator(".toolbar");
    const gap = await toolbar.evaluate((el) => getComputedStyle(el).gap);
    expect(gap).not.toBe("0px");
    expect(gap).not.toBe("");
  });

  test("all toolbar buttons visible on desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/");
    await expect(page.locator("button:has-text('Analyze')")).toBeVisible();
    await expect(page.locator("select.btn-secondary")).toBeVisible();
    await expect(page.locator("button:has-text('Upload')")).toBeVisible();
    await expect(page.locator("button:has-text('Guide')")).toBeVisible();
    await expect(page.locator("button:has-text('Feedback')")).toBeVisible();
    await expect(
      page.locator("button[title='Toggle theme']")
    ).toBeVisible();
  });
});
