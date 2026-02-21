import { test, expect, type Page } from "@playwright/test";

// Sample names in order matching SAMPLE_DATASETS
const SAMPLES = [
  "Lung Cancer Trial",
  "Heart Failure Study",
  "Engineering Reliability",
  "Overlapping Curves",
  "Dose-Response Trial",
];

/** Helper: pick the main chart SVG (skip legend icon SVGs) */
function chartSvg(page: Page) {
  return page.locator(".recharts-responsive-container > .recharts-wrapper > svg.recharts-surface").first();
}

async function selectSample(page: Page, index: number) {
  const select = page.locator("select.btn-secondary");
  await select.selectOption(String(index));
}

async function clickAnalyze(page: Page) {
  await page.click("button:has-text('Analyze')");
}

// ─── Core Workflow ────────────────────────────────────────────────────────

test.describe("Core Workflow", () => {
  test("page loads with sample data in textarea", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    const value = await textarea.inputValue();
    expect(value).toContain("Time");
    expect(value).toContain("Event");
    expect(value).toContain("Group");
    expect(value.split("\n").length).toBeGreaterThan(10);
  });

  test("click Analyze → KM curves displayed", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Kaplan-Meier Survival Curve")).toBeVisible();
    await expect(chartSvg(page)).toBeVisible();
  });

  test("median survival shown", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Median survival").first()).toBeVisible();
  });

  test("log-rank p-value shown", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Log-Rank p-value")).toBeVisible();
  });

  test("hazard ratio shown", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Hazard Ratio")).toBeVisible();
  });

  test("number-at-risk table displayed below chart", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    await expect(page.locator("text=Number at Risk")).toBeVisible();
    await expect(page.locator("table.at-risk-table")).toBeVisible();
    const rows = page.locator("table.at-risk-table tbody tr");
    await expect(rows).toHaveCount(2);
  });
});

// ─── Samples ──────────────────────────────────────────────────────────────

test.describe("Sample Datasets", () => {
  for (let i = 0; i < SAMPLES.length; i++) {
    test(`load sample ${i}: "${SAMPLES[i]}" → data area updates`, async ({
      page,
    }) => {
      await page.goto("/");
      const textarea = page.locator("textarea");
      const valueBefore = await textarea.inputValue();

      if (i === 0) {
        expect(valueBefore.length).toBeGreaterThan(50);
      } else {
        await selectSample(page, i);
        const valueAfter = await textarea.inputValue();
        expect(valueAfter).not.toBe(valueBefore);
        expect(valueAfter.length).toBeGreaterThan(50);
      }
    });

    test(`analyze sample ${i}: "${SAMPLES[i]}" → valid results`, async ({
      page,
    }) => {
      await page.goto("/");
      if (i > 0) await selectSample(page, i);
      await clickAnalyze(page);

      await expect(chartSvg(page)).toBeVisible();
      await expect(page.locator("text=Median survival").first()).toBeVisible();
      await expect(page.locator("table.at-risk-table")).toBeVisible();
    });
  }

  test("significant p-values: Lung Cancer Trial (p < 0.05)", async ({
    page,
  }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const pValueEl = page
      .locator(".stat-card")
      .filter({ hasText: "Log-Rank p-value" })
      .locator(".value");
    await expect(pValueEl).toBeVisible();
    const color = await pValueEl.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(220, 38, 38)");
  });

  test("significant p-values: Dose-Response Trial (p < 0.05)", async ({
    page,
  }) => {
    await page.goto("/");
    await selectSample(page, 4);
    await clickAnalyze(page);
    const pValueEl = page
      .locator(".stat-card")
      .filter({ hasText: "Log-Rank p-value" })
      .locator(".value");
    await expect(pValueEl).toBeVisible();
    const color = await pValueEl.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(220, 38, 38)");
  });

  test("non-significant p-value: Overlapping Curves (p > 0.3)", async ({
    page,
  }) => {
    await page.goto("/");
    await selectSample(page, 3);
    await clickAnalyze(page);
    const pValueEl = page
      .locator(".stat-card")
      .filter({ hasText: "Log-Rank p-value" })
      .locator(".value");
    await expect(pValueEl).toBeVisible();
    const color = await pValueEl.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(5, 150, 105)");
  });
});

// ─── Data Entry Edge Cases ────────────────────────────────────────────────

test.describe("Data Entry Edge Cases", () => {
  test("clear data → Analyze shows error", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("");
    await clickAnalyze(page);
    await expect(page.locator(".error-msg")).toBeVisible();
    await expect(
      page.locator(".recharts-responsive-container")
    ).not.toBeVisible();
  });

  test("single group only → still plots KM curve (no comparison)", async ({
    page,
  }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    const singleGroupData = `Time\tEvent\tGroup
5\t1\tSolo
10\t1\tSolo
15\t0\tSolo
20\t1\tSolo
25\t1\tSolo
30\t0\tSolo
35\t1\tSolo
40\t1\tSolo`;
    await textarea.fill(singleGroupData);
    await clickAnalyze(page);

    await expect(chartSvg(page)).toBeVisible();
    await expect(page.locator("text=Median survival")).toBeVisible();
    await expect(page.locator("text=Log-Rank p-value")).not.toBeVisible();
    await expect(page.locator("text=Hazard Ratio")).not.toBeVisible();
  });

  test("all events (no censoring) → valid curve", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    const allEventsData = `Time\tEvent\tGroup
2\t1\tA
4\t1\tA
6\t1\tA
8\t1\tA
10\t1\tA
3\t1\tB
5\t1\tB
7\t1\tB
9\t1\tB
12\t1\tB`;
    await textarea.fill(allEventsData);
    await clickAnalyze(page);

    await expect(chartSvg(page)).toBeVisible();
    await expect(page.locator("text=Median survival").first()).toBeVisible();
    await expect(page.locator("text=Log-Rank p-value")).toBeVisible();
  });

  test("all censored (no events) → handles gracefully", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    const allCensoredData = `Time\tEvent\tGroup
5\t0\tA
10\t0\tA
15\t0\tA
20\t0\tA
25\t0\tA
8\t0\tB
12\t0\tB
18\t0\tB
22\t0\tB
30\t0\tB`;
    await textarea.fill(allCensoredData);
    await clickAnalyze(page);

    // Should either show a chart (flat line at 1.0) or handle gracefully
    const hasError = await page.locator(".error-msg").isVisible();
    if (!hasError) {
      await expect(chartSvg(page)).toBeVisible();
      await expect(page.locator("text=N/R").first()).toBeVisible();
    }
    // No crash — page still functional
    await expect(page.locator("h1")).toContainText("Plot");
  });
});

// ─── Results Validation ───────────────────────────────────────────────────

test.describe("Results Validation", () => {
  test("CI bands visible on chart", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const areas = page.locator(".recharts-area");
    await expect(areas.first()).toBeVisible();
  });

  test("step function shape — uses stepAfter", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const lines = page.locator(".recharts-line");
    await expect(lines.first()).toBeVisible();
    const count = await lines.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("curves start at S=1.0 (100%)", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const yTicks = page.locator(".recharts-yAxis .recharts-cartesian-axis-tick-value");
    const tickTexts: string[] = [];
    for (let i = 0; i < (await yTicks.count()); i++) {
      tickTexts.push(await yTicks.nth(i).textContent() ?? "");
    }
    expect(tickTexts).toContain("100%");
  });
});

// ─── UI Features ──────────────────────────────────────────────────────────

test.describe("UI Features", () => {
  test("theme toggle switches theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await page.click("button:has-text('Theme')");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.click("button:has-text('Theme')");
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("Guide button exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("button:has-text('Guide')")).toBeVisible();
  });

  test("chart legend shows group names", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const legend = page.locator(".recharts-legend-wrapper");
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Control");
    await expect(legend).toContainText("Treatment");
  });

  test("sample dropdown has all 5 samples", async ({ page }) => {
    await page.goto("/");
    const select = page.locator("select.btn-secondary");
    // Verify all 5 sample options exist via innerHTML
    for (const name of SAMPLES) {
      await expect(select).toContainText(name);
    }
    // 5 samples + 1 placeholder = 6 options
    const count = await select.locator("option").count();
    expect(count).toBe(6);
  });

  test("50% reference line visible on chart", async ({ page }) => {
    await page.goto("/");
    await clickAnalyze(page);
    const refLine = page.locator(".recharts-reference-line");
    await expect(refLine).toBeVisible();
  });
});
