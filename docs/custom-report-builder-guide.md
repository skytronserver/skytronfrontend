# Custom Report Builder Guide

## Overview
The Custom Report Builder lets **superadmin** users assemble tailored dashboard reports using existing Skytron metrics. You can compose layouts by dragging ready-made blocks onto a flexible canvas, configure their appearance, preview the result, and export the configuration for reuse.

## Access Requirements
- **Role:** Available only to users with the `superadmin` role. Other roles will not see the builder tab.
- **Location:** `Dashboard → Custom Reports Builder` tab inside the default dashboard view.

## Getting Started
1. Sign in as a superadmin and open the Dashboard.
2. Navigate to the **Custom Reports Builder** tab (the third tab alongside "Dashboard Overview" and "Analytics & Charts").
3. Enter an optional **Report Title** in the header.

## Building a Report
### Using the Palette
- Four draggable blocks are available: **Text Block**, **Metric Card**, **Chart**, and **Formula**.
- Drag a block from the palette into the canvas area or click it to add instantly.
- The palette is disabled while **Preview** mode is active.

### Canvas Basics
- Empty canvas shows onboarding text; drop components to begin.
- Each component can be selected to reveal contextual controls:
  - **Move Up / Move Down** – reorder items.
  - **Duplicate** – clone an existing item.
  - **Delete** – remove the item from the report.
- Use **Clear Canvas** to remove all components.

### Previewing & Exporting
- Toggle **Preview** to hide edit affordances and view the final layout.
- Click **Export JSON** to download the current configuration for archival or sharing (file includes report title, items, and timestamp).

## Configuring Components
Select a component to open the **Configuration** panel on the right. Options vary per type:

### Text Block
- **Text:** Multi-line content, supports headings or notes.
- **Variant:** Typography variant (e.g. `h5`, `subtitle1`).
- **Align:** Left, center, right, or justify.

### Metric Card
- **Label:** Caption shown above the value.
- **Data Field:** Choose a data key from the superadmin dataset.
- **Prefix / Suffix:** Add currency symbols, percentages, etc.
- **Precision:** Number of decimal places.

### Chart
- **Title:** Heading displayed above the chart.
- **Chart Type:** Bar, Line, or Pie.
- **Data Fields:** Select one or more metrics to visualise.
- **Show Legend:** Toggle chart legend visibility.

### Formula
- **Title:** Heading for the computed metric.
- **Expression:** Combine metrics using arithmetic operations and tokens (see below).
- **Precision:** Decimal places for the computed value.
- Token syntax: wrap field paths in `{{ }}` (example: `({{deviceHealth.online}} / {{vehicleHealth.totalActivatedDevice}}) * 100`).

## Available Data Fields
Only superadmin metrics are exposed. Use the following keys when selecting data fields or writing formulas.

| Token | Friendly Label |
| ------ | --------------- |
| `userStats.stateUser` | State Admins |
| `userStats.eSimUser` | eSIM Providers |
| `userStats.manufacturer` | Manufacturers |
| `userStats.sosAdmin` | SOS Admins |
| `fitmentStats.fitted` | Total Devices |
| `fitmentStats.toggedDevice` | Tagged Devices |
| `fitmentStats.onlineDevice` | Online Devices |
| `fitmentStats.offlineDevice` | Offline Devices |
| `alertStats.totalAlert` | Total Alerts |
| `alertStats.thisMonthAlert` | Monthly Alerts |
| `alertStats.todayAlert` | Today Alerts |
| `overspeedStats.totalAlert` | Overspeed Alerts |
| `overspeedStats.thisMonthAlert` | Overspeed Monthly Alerts |
| `overspeedStats.todayAlert` | Overspeed Today Alerts |
| `stateStats.total` | Total States |
| `stateStats.active` | Active States |
| `stateStats.inactive` | Inactive States |
| `deviceHealth.online` | Devices Online |
| `deviceHealth.todayOffline` | Offline Today |
| `deviceHealth.sevenDaysOffline` | Offline 7 Days |
| `deviceHealth.thirtyDaysOffline` | Offline 30 Days |
| `vehicleHealth.totalActivatedDevice` | Activated Devices |
| `vehicleHealth.todayActive` | Active Today |
| `vehicleHealth.inActiveFor7Days` | Inactive 7 Days |
| `vehicleHealth.inActiveFor30Days` | Inactive 30 Days |

> **Tip:** Click any field in the **Available Fields** list inside the builder to copy its token to the clipboard.

## Best Practices
- Start with a clear goal—decide the key metrics that need highlighting before adding components.
- Use **Preview** frequently to validate layout spacing and typography.
- Keep the number of metrics per chart manageable (3–5) for readability.
- Store exported JSON files in version control to track report iterations.
- Reuse formulas by pasting the same expression into duplicated formula blocks.

## Troubleshooting
- **Cannot access builder tab:** verify that you are logged in as a superadmin. Non-superadmin roles automatically hide the tab.
- **Canvas shows placeholder message:** add at least one component from the palette.
- **Formula shows error:** ensure every token exists in the table above and that the expression contains only numbers, tokens, and arithmetic symbols.

---
For additional questions or feature requests, contact the Skytron frontend team.
