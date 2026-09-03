# Homepage enhancement tasks

- [x] Add a clearly labelled, client-side solar-savings calculator with editable energy-use, electricity-rate, solar-offset, and installation-cost inputs.
- [x] Create a case-studies project gallery that does not state unverified Xtorra project facts and can accept verified project details later.
- [x] Add an interest-selection dropdown with specific renewable-energy pathways to the enquiry form and include that selection in the generated email.
- [x] Validate calculator math, email preparation, desktop layout, and mobile layout before release.

# West Africa calculator localisation

- [x] Confirm the country list, ISO currency codes, and regional currency groupings for the West Africa selector.
- [x] Establish transparent, editable market-default assumptions with sources or clearly stated planning-only rationale.
- [x] Add a country selector, local currency formatting, and country-default fields to the solar-savings calculator.
- [x] Validate calculation and formatting changes across naira, CFA franc, dalasi, leone, Liberian dollar, and Ghanaian cedi markets.

# Calculator context and report export

- [x] Define one reusable savings-calculation payload for the enquiry email, interactive chart, and PDF report.
- [x] Add a cost-comparison chart that responds to edited market and calculator inputs.
- [x] Include the current calculation payload in the prepared enquiry email.
- [x] Add a browser-based PDF estimate report download with calculation inputs, results, and planning disclaimer.
- [x] Verify input changes, email context, PDF download, and mobile calculator presentation.

# Projection, sharing, and PDF branding

- [x] Add the supplied Xtorra contact details and full brand logo to the generated PDF footer.
- [x] Add an interactive 5-, 10-, and 20-year savings-period toggle to the calculator comparison chart.
- [x] Add share actions that prepare a calculation summary in the user’s email client and WhatsApp.
- [x] Validate the branded report, scenario selection, sharing destinations, and responsive layout.

# Solar system design calculator

- [x] Define an indicative sizing methodology for array Wp, inverter kW, and lithium battery kWh, including energy, power, losses, efficiencies, autonomy, and depth-of-discharge inputs.
- [x] Add an editable appliance load table with units, quantities, wattage, daily operating hours, simultaneous-use factor, and daily energy calculations.
- [x] Add a location/insolation selector with live or explicitly editable peak-sun-hour inputs and source disclosure.
- [x] Generate an engineering-assumption summary and bill of quantity outputs for array capacity, inverter capacity, and lithium battery capacity.
- [x] Verify formulas, validation states, safety notices, desktop layout, and mobile layout.

# Day-night load dependency

- [x] Split each appliance entry into daytime and nighttime operating hours while retaining quantity, wattage, daily-use, and simultaneous-use factors.
- [x] Recalculate total daily energy, direct daytime solar demand, nighttime battery energy demand, and the battery capacity requirement from nighttime dependency and selected autonomy.
- [x] Update the visible load table, sizing panel, and bill-of-quantity basis with day-night energy figures and an explicit battery-dependency explanation.
- [x] Verify day-night calculations, edge inputs, desktop presentation, and mobile presentation.

# Backup scenarios and design BoQ export

- [x] Define solar-only, generator-supported, and grid-supported backup scenarios with clear, editable autonomy recommendations and explanation.
- [x] Apply the selected backup scenario to the battery-autonomy sizing basis while preserving a user-editable autonomy override.
- [x] Generate a branded Xtorra PDF bill-of-quantity report with logo, supplied contact details, location, load summary, assumptions, scenario, and core equipment schedule.
- [x] Validate scenario changes, PDF export, contact footer, desktop layout, and mobile layout.

# Site-specific BoQ refinement

- [x] Add customer name and project-location inputs, and carry both into the branded BoQ PDF cover.
- [x] Calculate a scenario-aware generator kVA recommendation from peak load, generator loading target, and selected backup pathway.
- [x] Add editable grid tariff and average daily outage-hour inputs that adjust the grid-supported battery-autonomy starting point and clarify grid context in the BoQ.
- [x] Validate cover details, generator kVA output, grid-supported calculation changes, PDF export, desktop layout, and mobile layout.

# Equipment preferences and BoQ sales handoff

- [x] Add preferred inverter and lithium-battery brand selectors and include the selections in the visible BoQ and exported PDF.
- [x] Add an appliance-load catalogue that users can choose from to populate editable load-schedule rows.
- [x] Add a BoQ-to-sales action that carries customer, project, site, sizing, preferences, and equipment schedule context into the existing enquiry email workflow.
- [x] Validate brand propagation, catalogue row creation, BoQ enquiry context, desktop layout, and mobile layout.

# First-row load explanation

- [x] Add a hover and keyboard-focus explainer to the first appliance-load row that shows its daily-energy formula and live operands.
- [x] Ensure the explanation updates when wattage, quantity, day/night hours, or utilisation changes.
- [x] Validate desktop hover, keyboard focus, and mobile tap-friendly presentation.

# Surge-aware inverter sizing

- [x] Add a per-load surge-factor dropdown with 1.2×, 2.0×, and 3.0× choices.
- [x] Calculate surge-adjusted watts from each row’s simultaneous demand and selected surge factor, then sum the rows into a surge sizing basis.
- [x] Use the surge sizing basis plus the inverter headroom setting for the inverter recommendation, BoQ, sales context, and PDF export.
- [x] Validate surge dropdown behavior, inverter recommendations, report data, and responsive layout.

# Load-factor guidance

- [x] Explain the daily-use percentage and its daily-energy formula beside the load schedule.
- [x] Explain the simultaneous-use percentage and its role in the peak-power and surge calculations.
- [x] Explain the row-level and combined surge-basis formulas, including the subsequent inverter-headroom calculation.
- [x] Validate the guidance on desktop and mobile without obscuring the editable load table.

# Header definitions and worked examples

- [x] Add hover- and focus-accessible definitions to every desktop load-schedule column header.
- [x] Include compact calculation-guide examples for lighting, refrigeration, and water pumps, showing both energy and surge reasoning.
- [x] Validate all header definitions, worked-example content, and mobile load-card guidance.

# Load guardrails and mobile help

- [x] Add clear non-blocking warnings for unusually high appliance wattage, daily-use hours, simultaneous-use assumptions, surge factors, and surge durations.
- [x] Enrich appliance selections with practical guidance on their editable standard starting profiles.
- [x] Add tap-accessible field definitions for each mobile load-card input while preserving the desktop header tooltips.
- [x] Validate warnings, appliance guidance, desktop tooltips, mobile tap help, and calculator responsiveness.

# Guided load planning

- [x] Add guided starting profiles for common home and business load schedules, with clear planning-only labels and reset behavior.
- [x] Add per-field recommended input ranges and warnings for inputs outside those ranges.
- [x] Detect and flag duplicate appliance entries while allowing users to retain intentionally separate circuits.
- [x] Add a live chart and summary that show daytime versus nighttime energy consumption from the current load schedule.
- [x] Validate profile loading, range warnings, duplicate notices, chart updates, desktop layout, and mobile layout.

# Appliance search and scenario comparison

- [x] Add category metadata and a search interface that lets users find appliance profiles and add them directly to the load schedule.
- [x] Save named local load scenarios with the full schedule and key design settings, with clear browser-only persistence behavior.
- [x] Restore saved scenarios and show two selected scenarios side-by-side across daily energy, nighttime dependency, surge basis, PV array, inverter, and battery outputs.
- [x] Validate search, category filters, item additions, scenario persistence, comparison selection, desktop layout, and mobile layout.

# Chart-key repair

- [x] Locate the duplicate appliance-name key used by the load-energy chart or legend.
- [x] Replace the duplicated display-name key with a stable row-level unique key.
- [x] Verify the browser console no longer reports duplicate React child keys after duplicate loads are present.

# Circuit labels and printable counts

- [x] Add an editable circuit-name field to every load row and retain the label across calculator and saved-scenario workflows.
- [x] Display total active load-circuit count and total appliance quantity in the printable BoQ/load-summary page.
- [x] Validate circuit naming, count calculations, printable output, desktop layout, and mobile layout.

# Custom load editing

- [x] Make custom appliance rows editable for the user-defined load name, circuit label, wattage, quantity, day/night hours, utilisation, simultaneous demand, and surge settings.
- [x] Confirm selected default appliance profiles preserve editable wattage and other row-level settings after selection.
- [x] Validate custom-row editing, default-profile wattage editing, derived calculations, desktop layout, and mobile layout.

# Extended load planning and location setup

- [x] Add a quick duplicate action to each load row, preserving editable load values while generating a distinct circuit label.
- [x] Add browser-local custom appliance category creation and management for user-defined load profiles in the searchable appliance library.
- [x] Include each custom-load name, circuit label, and editable load details in the branded BoQ PDF summary.
- [x] Add a user-triggered approximate location lookup that pre-fills editable latitude and longitude from the location text before NASA POWER lookup.
- [x] Validate duplication, local categories, BoQ details, coordinate lookup, desktop layout, and mobile layout.

# Appliance library expansion

- [x] Add Telecoms, Surveillance, and Internet categories with clearly labelled editable planning profiles.
- [x] Add Blender and bread toaster profiles under Kitchen, inverter AC under Comfort, and music player under Entertainment.
- [x] Confirm the expanded catalogue is searchable, category-filtered, and continues to add editable load rows.
- [x] Validate each new profile’s load values, search results, filters, desktop layout, and mobile layout.

# Telecom site planning

- [x] Add guided telecom-site templates with editable load schedules for a compact remote site and a more resilient connected site.
- [x] Add battery-charger and DC-distribution profiles to the searchable appliance library as editable starting records.
- [x] Validate telecom template loading, new profile search and category filtering, calculated day/night energy, and responsive layout.

# Telecom redundancy and tower BoQ

- [x] Add editable telecom battery-bank and DC rectifier appliance profiles to the searchable field library.
- [x] Add an N+1 redundancy control that increases the required count of selected telecom equipment loads while keeping load rows editable and the sizing basis transparent.
- [x] Add a selectable tower-site BoQ cover treatment with tower reference and operational context in the branded PDF export.
- [x] Validate telecom profiles, N+1 calculations, tower-cover export, desktop layout, and mobile layout.

# Telecom tenant, DC-bus, and rectifier module planning

- [x] Add an editable multi-tenant tower-site template and tenant-count control that scales only the selected radio-equipment planning loads.
- [x] Add a telecom DC-bus voltage selector and include the selected voltage in live design context, sales context, and tower-site BoQ exports.
- [x] Add a distinct rectifier-module N+1 control and recommendation that sizes required modules from the active DC rectifier demand without double-counting the general equipment reserve.
- [x] Validate tenant scaling, DC-bus selection, rectifier-module redundancy, tower BoQ details, desktop layout, and mobile layout.

# Indicative 24-hour system simulation

- [x] Define a deterministic 24-hour solar-generation curve, hourly load allocation, battery limits, and scenario-specific backup behaviour from the live design inputs.
- [x] Simulate hourly solar production, direct consumption, battery charge/discharge, state of charge, and grid/generator support where selected.
- [x] Add a live 24-hour visualisation and a concise operating summary that identify battery minimum, solar surplus, and backup energy.
- [x] Validate solar-only, generator-supported, and grid-supported simulation paths, editable input updates, desktop layout, and mobile layout.

# Long-term and seasonal simulation

- [x] Define transparent seasonal solar-resource factors, monthly scenario selection, and deterministic battery-capacity ageing assumptions.
- [x] Add live monthly and seasonal resource scenarios plus an ageing curve that updates the simulated usable battery reserve over time.
- [x] Add the active 24-hour operating-profile chart and long-term scenario context to the branded BoQ PDF export.
- [x] Validate scenario switching, ageing calculations, chart rendering, PDF export, desktop layout, and mobile layout.

## Validation note

The July 2025 NASA resource scenario and a 10-year battery age at 2.0% annual capacity fade were validated in the live calculator. The generated branded BoQ PDF records the active scenario and retained reserve on page 1, and displays the 24-hour load, solar, and support profile chart on page 2.

# Conservative lifecycle and rainy-season planning

- [x] Define editable battery replacement-cost, escalation, and replacement-interval assumptions with a transparent annual forecast method.
- [x] Add data-based rainy-season probability scenarios from multi-year NASA POWER daily irradiance for the active location, with a clear historical-data caveat.
- [x] Include active lifecycle forecast and rainy-season planning context in the live simulation and branded BoQ export.
- [x] Validate lifecycle calculations, probability scenarios, PDF content, desktop layout, and mobile layout.

Validated: Lagos historical lookup returned 1,530 valid daily observations in the locally derived Jun–Oct low-resource window for 2016–2025. The P50/P80/P90 cases were 4.23, 3.06, and 2.37 PSH respectively. A P90 export with a NGN 1,800,000 current allowance, 6% annual nominal escalation, eight-year interval, and twenty-year horizon rendered as a readable three-page branded BoQ with the new annual ledger and required contact footer. `pnpm check` and `pnpm build` passed, and the finished workbench was inspected at desktop and 375 px mobile widths.

# Custom rainy-month windows

- [x] Define an accessible month-selection mode that preserves the automatic low-resource window as the default.
- [x] Recalculate historical P50/P80/P90 scenarios using a user-selected rainy-month window and retain the selection in saved scenarios.
- [x] Carry custom-window context into the simulation, sales handoff, methodology, and branded BoQ output.
- [x] Validate automatic and custom windows, saved scenario restoration, report content, and responsive controls.

Validated: The automatic option remains available. In custom mode, the Lagos Jun–Jul window produced scenarios from 610 valid NASA POWER daily observations across 2016–2025; selecting custom P90 changed the simulated resource to 2.09 PSH and exported a BoQ cover explicitly marked as a custom window. `pnpm check` and `pnpm build` passed; desktop and 375 px mobile presentation were reviewed.

# Header, return control, and resource menu repair

- [x] Correct logo sizing and overflow at the top-left header position.
- [x] Add an accessible go-to-top action positioned above the platform footer notice.
- [x] Repair solar-resource scenario menu clipping and validate all calculated option labels at desktop and mobile sizes.
- [x] Validate the resulting header, footer action, and scenario selector interactions.

Validated: The header shows the complete Xtorra mark at desktop and 375 px mobile widths without clipping. The Go to top link is keyboard-focusable, carries the top anchor, and sits directly above the platform notice. The simulation resource selector now opens in a portal-based overlay; its annual and loaded rainy P50/P80/P90 labels were visibly complete in the rendered menu. `pnpm check` and `pnpm build` passed.

# Workbench navigation and scenario discovery

- [x] Add a compact, accessible sticky go-to-top control that appears after meaningful vertical scrolling.
- [x] Persist and restore the last valid simulation solar-resource scenario in browser-local storage without overriding unavailable historical scenarios.
- [x] Add search and an empty state to the simulation solar-resource menu while preserving keyboard selection.
- [x] Validate scroll threshold behavior, scenario persistence fallbacks, search results, and responsive presentation.

Validated: The return control appears after 560 px of scroll, is keyboard-accessible, and completed a smooth return to the page origin. Search filtered the loaded historical list to the P90 case, and the local P90 record saved its active scenario, rainy-window context, and matching Lagos coordinates. A reload restored P90 immediately for those matching coordinates; a cached non-annual scenario is withheld if coordinates differ. Type/build checks passed, with desktop and 375 px mobile views reviewed.

# Resource comparison and saved field presets

- [x] Add a side-by-side P50/P80/P90 scenario comparison that uses the active historical resource data and makes operating differences legible.
- [x] Add local named resource presets with safe fields, quick apply, deletion, and backwards-compatible browser storage.
- [x] Add a clear preference action that removes only the remembered resource scenario and returns the simulation to annual input.
- [x] Reposition the sticky go-to-top control so it clears the platform banner and remains accessible on desktop and mobile.
- [x] Validate comparative calculations, preset storage, preference clearing, return-control placement, and responsive interaction.

Validated: With the Lagos automatic Jun–Oct 2016–2025 window loaded, the three cards reported P50 4.23 PSH / 6.74 kWh solar route / 25% minimum SOC, P80 3.06 PSH / 4.87 kWh / 1%, and P90 2.37 PSH / 3.78 kWh / 0% with 1.05 kWh unserved in solar-only mode. A named P90 resource preset saved, applied after clearing the remembered selection, and was then removed. The clear action reset only the active resource preference to annual. The fixed top button now clears the preview platform bar at desktop and mobile sizes. `pnpm check` and `pnpm build` passed.

# Surge duration and model shortlist

- [x] Add a per-load surge-duration input and derive the governing overload duration for the combined surge requirement.
- [x] Update inverter sizing, BoQ, PDF, and sales context with the surge-duration requirement and separate continuous versus overload basis.
- [x] Research and record documented inverter models and overload ratings for the brands exposed by the preferred-inverter selector.
- [x] Add a brand-aware indicative model shortlist that checks continuous capacity and supported overload duration against the calculated requirement.
- [x] Validate duration inputs, model-selection logic, report output, desktop layout, and mobile layout.

# Inverter comparison PDF

- [x] Define the candidate eligibility rule and the live sizing facts to compare in the branded report.
- [x] Add a branded comparison PDF export for currently compatible documented inverter candidates.
- [x] Include each model’s continuous output, documented overload tier, phase note, pass status, and official source link in the comparison report.
- [x] Validate candidate filtering, generated report content, download behavior, and responsive action placement.

# Load table overflow fix

- [x] Contain the wide appliance load table in a visible horizontal-scroll region with a bottom scrollbar.
- [x] Prevent the table and its controls from expanding the overall page width.
- [x] Validate the scroll treatment and page-width containment on desktop and mobile.

# Load-editor usability refinement

- [x] Add a reset action that restores the original default load schedule and closes any active first-row explanation state.
- [x] Create a compact mobile card editor for each load row so all inputs remain usable without horizontal scrolling.
- [x] Make the table’s appliance-name header and cells sticky during desktop horizontal scrolling.
- [x] Validate reset behavior, desktop sticky-column scrolling, mobile card editing, and load-calculation updates.

# Energy chart and functional load scrolling

- [x] Add a live pie chart showing daily energy consumption by appliance above the load editor.
- [x] Replace the non-functional schedule slider treatment with an explicit range control synchronized to the table’s horizontal scroll position.
- [x] Remove the stationary visual artifact from the load schedule area.
- [x] Validate live chart updates, slider-to-table synchronization, reset behavior, desktop layout, and mobile layout.

# Printable load summary and active schedule control

- [x] Add a print-friendly load-profile summary with pie chart, appliance energy table, and core sizing figures.
- [x] Add a print action that opens the browser print dialog with only the formatted summary visible.
- [x] Ensure the desktop schedule has sufficient contained overflow for the slider to remain active and remove the inactive stationary thumb state.
- [x] Validate print layout, chart visibility, active slider movement at desktop width, and mobile behavior.

# Print orientation and slider cleanup

- [x] Add a portrait-or-landscape selector for the print-friendly load summary.
- [x] Apply the selected page orientation to the print stylesheet and visible print-summary format.
- [x] Remove the remaining stationary schedule-control artifact while preserving the active slider’s horizontal table movement.
- [x] Validate orientation selection, print invocation, desktop slider movement, and mobile layout.

# Utility-scale solar design calculator

- [x] Define transparent preliminary formulas and safeguards for utility-scale DC/AC capacity, generation, land, modules, inverter blocks, and losses.
- [x] Create a dedicated utility-scale calculator page with editable site, solar-resource, capacity, technology, and loss inputs.
- [x] Add indicative output for DC capacity, AC export capacity, annual generation, land area, module count, inverter blocks, and an energy-yield chart.
- [x] Add routing and clear navigation from the existing design workbench to the new utility-scale page.
- [x] Validate formulas, route behavior, desktop layout, and mobile layout.

# Annual savings output fit

- [x] Reduce and constrain the potential-annual-savings display typography to avoid overlap.
- [x] Verify the savings figure remains legible and contained on desktop and mobile viewports.

# Savings output view and assumptions

- [ ] Add a compact/detailed switch for the savings calculator’s output panel.
- [ ] Ensure detailed-only readings and comparison context can be hidden without changing calculations.
- [ ] Add an accessible tooltip beside potential annual savings that explains the active consumption, tariff, solar-coverage, and planning assumptions.
- [ ] Validate both views, tooltip keyboard access, and responsive layout.
