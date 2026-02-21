# SurvivalPlot — Kaplan-Meier Survival Analysis

## Mission
Replace GraphPad Prism / SPSS survival analysis with a free web tool for KM curves + log-rank test.

## Architecture
- `packages/engine/` — KM estimator, log-rank test, confidence intervals, at-risk table
- `packages/web/` — React + Vite, KM plot with at-risk table, data entry
- `packages/cli/` — Node runner for batch analysis

## MVP Features (Free Tier)
1. Paste time-to-event data with censoring indicator (up to two groups)
2. Generate Kaplan-Meier survival curves
3. Compute log-rank test p-value
4. Display median survival time per group with 95% CI
5. Publication-quality KM plot with at-risk table below
6. Export chart as PNG/SVG + results table as CSV

## Engine Tasks

### E1: Data Parser
- Parse: Subject | Time | Event (1=event, 0=censored) | Group
- Support two groups (treatment vs control)
- Sort by time, validate inputs
- **Validation**: Known survival datasets

### E2: Kaplan-Meier Estimator
- At each event time: `S(t) = S(t-1) × (1 - d/n)`
  - d = events at time t, n = at-risk at time t
- Step function survival curve
- Handle ties (multiple events at same time)
- **Validation**: Textbook KM examples (Bland & Altman, Collett)

### E3: Confidence Intervals (Greenwood's Formula)
- `Var(S(t)) = S(t)² × Σ(d_i / (n_i × (n_i - d_i)))`
- 95% CI: `S(t) ± 1.96 × √Var(S(t))`
- Clamp to [0, 1]
- **Validation**: Published CI calculations

### E4: Median Survival
- Time at which S(t) ≤ 0.5
- CI for median via Brookmeyer-Crowley method
- **Validation**: Known median survival values

### E5: Log-Rank Test
- Chi-square statistic: `χ² = (O₁ - E₁)² / E₁ + (O₂ - E₂)² / E₂`
- Expected events: `E = n_group / n_total × d_total` at each time
- p-value from chi-square distribution (1 df)
- **Validation**: Published log-rank test examples

### E6: At-Risk Table
- Number at risk at specified time points per group
- Standard format: below KM plot at evenly spaced intervals
- **Validation**: Manual count verification

## Web UI Tasks

### W1: Data Entry
- Paste-friendly table: Time | Event | Group
- CSV upload
- Group labeling (Treatment/Control or custom)

### W2: Kaplan-Meier Plot
- Step-function survival curves (one per group, different colors)
- Censored observations marked with tick marks (+)
- 95% CI shaded bands (optional toggle)
- At-risk table aligned below x-axis

### W3: Results Panel
- Median survival per group with 95% CI
- Log-rank test p-value
- Hazard ratio (simple estimate)
- Event counts per group

### W4: Export
- Download KM plot as PNG/SVG (publication-quality)
- Download results table as CSV
- Print-friendly summary

### W5: Toolbar & Theme
- Paste Data, Analyze, Export buttons
- Light/dark theme

## Key Equations
- KM: `S(t) = Π(1 - d_i/n_i)` for all t_i ≤ t
- Greenwood: `Var(S) = S² × Σ(d/(n(n-d)))`
- Log-rank: `χ² = Σ((O-E)²/E)`, df=1
- Median: `t where S(t) = 0.5`

## Validation Strategy
- Bland & Altman "Survival Analysis" worked examples
- R survival package output comparison
- Published clinical trial KM curves with known statistics
