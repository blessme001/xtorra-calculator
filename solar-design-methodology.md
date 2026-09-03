# Indicative solar-system design methodology

## Purpose and safety boundary

This calculator is a **planning tool**, not an electrical design package. It produces indicative capacity values for early conversations. A qualified solar engineer must verify the site survey, irradiance profile, shading, structural loading, electrical protection, earthing, cable sizing, equipment compatibility, surge demand, battery limits, and applicable codes before procurement or installation.

## Location insolation source

The app uses NASA POWER’s public point-data service to retrieve the daily all-sky surface shortwave downward irradiance parameter, `ALLSKY_SFC_SW_DWN`, for user-entered latitude and longitude. NASA identifies this solar-radiation parameter as suitable for solar-energy applications. The app averages valid daily values over the requested period and presents the resulting value as an editable **peak-sun-hour planning input** in kWh/m²/day.

## Historical rainy-season probability scenarios

The optional **Record rainy scenarios** action requests the previous ten complete calendar years of NASA POWER daily `ALLSKY_SFC_SW_DWN` data for the active latitude and longitude. It discards missing sentinel values (`-999`) and, by default, identifies a location-specific rainy-season proxy as the five calendar months with the lowest ten-year mean daily irradiance. This avoids assigning a fixed rainy season to every West African location while keeping the derivation visible in the interface and BoQ.

Users can instead select a **custom rainy-month window** from January through December. The calculation then uses every valid historical daily irradiance observation within precisely those selected months, over the same ten-year record. At least one month must remain selected. The report and simulation label this as a custom window so it cannot be mistaken for the automatic low-resource derivation.

The resulting daily irradiance values in those five months form a historical distribution. **P50** is the median (50th percentile); **P80** is the 20th percentile, meaning 80% of the observed daily values were at or above that level; and **P90** is the 10th percentile, meaning 90% were at or above it. The P80 and P90 selections therefore provide progressively lower-resource planning cases for the 24-hour energy-balance simulation. They do not alter the active PV-array BoQ sizing calculation, which remains tied to the editable annual peak-sun-hour input.

These values are historical irradiance-frequency indicators, not a probability that it will rain, a weather forecast, a guaranteed energy yield, or a substitute for a bankable site-specific resource assessment. Inter-annual weather shifts, soiling, shading, PV degradation, unusual storm sequences, and load changes remain outside the simplified simulation.

## Battery replacement lifecycle forecast

The lifecycle screen uses four editable budget inputs: a stated currency, the current full-bank replacement allowance, annual nominal escalation, and a scheduled replacement interval. For planning year `y`, the displayed full-bank nominal cost is `current allowance × (1 + escalation)^y`. A replacement event is recorded only when the year is an exact multiple of the selected interval. The **cumulative event allowance** is the sum of those scheduled nominal event costs over the selected horizon.

This is a transparent nominal-cost schedule, not a quote, price index, financing model, or warranty prediction. It does not account for inflation-adjusted real cost, discount rate, salvage value, battery residual capacity, exchange-rate movement, tax, logistics, installation labour, warranty recovery, or actual battery end-of-life. Users should replace the allowance, escalation, interval, and forecast horizon with their approved commercial and technical assumptions before relying on the BoQ summary.

## Load and sizing equations

| Calculation | Indicative method |
| --- | --- |
| Daily energy demand | Sum of `watts × quantity × (daytime hours + nighttime hours) × daily-use factor ÷ 1,000` across the load table. |
| Day-night energy accounting | The same schedule is split into direct daytime solar demand and nighttime battery-supported demand. |
| Simultaneous peak load | Calculate separate day and night peaks from `watts × quantity × simultaneous-use factor`; use the higher of the two for indicative inverter capacity. |
| Composite PV performance factor | Product of the user-adjustable retained fractions for temperature, soiling, mismatch, DC cabling, MPPT/charge control, inverter, AC wiring, and battery round-trip efficiency. |
| Solar array size | `daily AC energy ÷ (peak-sun-hours × composite performance factor) × design margin`, reported in kWp/Wp. |
| Inverter capacity | `simultaneous peak load × inverter headroom/surge factor ÷ 1,000`, reported in kW. |
| Lithium battery capacity | `nighttime AC energy × autonomy days ÷ (usable DoD × inverter efficiency × battery round-trip efficiency)`, reported in kWh. Daytime outage backup is not assumed unless the user includes it in nighttime or autonomy inputs. |

## Backup-scenario starting points

The system-design interface applies transparent **editable starting points** for the battery-autonomy input. Solar plus battery only begins at 1.00 day; generator-supported begins at 0.50 day; and grid-supported begins at 0.25 day. These settings describe an indicative battery window before the selected supporting source is expected to carry the load. They are not reliability guarantees, and the calculator retains a manual autonomy override for site-specific engineering review.

For the generator-supported pathway, the indicative generator recommendation is calculated as `inverter kW ÷ power factor ÷ target loading fraction`. Both power factor and target loading remain user-adjustable. For the grid-supported pathway, the entered average daily outage hours convert to the battery-autonomy starting point as `outage hours ÷ 24`; the user may still override the calculated autonomy. An entered grid tariff is presented as planning context and used to show the estimated daily value of the calculated load, not as a tariff forecast.

The app discloses every factor, keeps all inputs editable, and marks the output as a bill of quantity **basis**, not a procurement schedule.

## Source references

1. [NASA POWER API data-request tutorial](https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/)
2. [NASA POWER Daily API documentation](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)

## Live lookup validation

The in-app lookup was verified with the default Lagos coordinates (6.5244, 3.3792). It retrieved 365 valid NASA POWER daily values for 2025 and updated the editable peak-sun-hour input to a 4.54 kWh/m²/day average.

The branded BoQ export was validated in the browser for the generator-supported scenario. The resulting one-page PDF includes the Xtorra wordmark, supplied contact details, location and insolation inputs, selected scenario, load schedule, sizing basis, core equipment schedule, and design disclaimer.

The current export was also validated with customer and project-cover values. The report renders the customer name, project location, generator kVA basis, location, scenario, and core BoQ schedule on one branded page.

## Equipment preferences and sales handoff

The appliance load table includes selectable starting profiles for common loads. Selecting a profile replaces the row’s wattage, quantity, day and night hours, utilisation, and simultaneous-use values; every field remains editable afterwards. Preferred inverter and battery brands are **preferences only** and are recorded in both the visible and exported BoQ. They do not imply compatibility, availability, or final product selection.

The BoQ sales action transfers customer, project, location, sizing, scenario, load schedule, and equipment-preference data into the existing enquiry workflow. The enquiry opens a user-controlled draft email addressed to **sales@xtorra.com**; the site does not submit or attach data silently.

## Surge-aware inverter sizing

Each active load row now has an editable surge factor of **1.2×**, **2.0×**, or **3.0×**. The calculator derives its row surge contribution as:

`watts × quantity × simultaneous-use factor × surge factor`

It sums the row surge contributions into a combined surge-watt basis, then applies the editable inverter headroom percentage to set the indicative inverter recommendation. Daily energy, PV-array sizing, and battery autonomy continue to use the load schedule’s energy calculations; the surge factor changes the inverter and generator peak-power basis only. Final equipment selection must still be checked against manufacturer surge-duration, motor-starting, BMS, changeover, and protection requirements.

The live selector and generated branded BoQ were checked after implementation. The report now records the combined surge basis, surge-aware inverter capacity, and the per-load surge factor and surge-watt contribution in the load schedule.

## Load-schedule guidance

Every desktop column header now exposes a hover- and keyboard-focus definition. The guide distinguishes **daily-use percentage**, which modifies energy, from **simultaneous-use percentage**, which modifies the coincident-power check. It also makes explicit that surge is calculated in watts rather than watt-hours: active row surge contributions are summed before inverter headroom is applied.

The companion worked examples use the editable initial profiles: LED lighting produces 1.01 kWh/day and a 147 W, one-second surge basis; refrigeration produces 1.40 kWh/day and a 378 W, five-second compressor-start basis; and the water pump produces 0.75 kWh/day and a 1,800 W, three-second motor-start basis. They are explanatory starting values only and must be replaced with confirmed site and manufacturer data for final design.

## Input guardrails and appliance guidance

The load schedule now provides non-blocking input-review notices for unusually high running power, unusually large appliance groups, schedules above 24 hours per day, utilisation or simultaneous-use values above 100%, highly coincident multi-unit loads, high-power 3.0× surge entries, and long surge durations. The sizing calculation remains available so users can revise assumptions without losing their scenario, but a BoQ or equipment decision should not rely on flagged values until they are checked.

Each appliance selection now supplies a practical starting-profile note. The compact mobile editor includes a tap-open field guide with the same definitions as the desktop header tooltips, so its calculation inputs are understandable without hover support.

## Guided load planning and day-night visualisation

The load wizard offers labelled planning-only starting schedules for compact homes, family homes, small offices, and retail shops. Each profile replaces the current editable schedule and should be reconciled to site nameplates, operational hours, and circuit arrangements before a BoQ is used for any technical decision.

Recommended planning ranges are exposed in the desktop header help and the mobile field guide. The calculator also identifies repeated appliance names as a non-blocking review point: users may retain separate rows for genuinely independent circuits, but should combine quantities where the duplicate does not represent a distinct circuit.

The day-night stacked chart is calculated directly from each row’s watts, quantity, operating hours, and daily-use factor. Its daytime series is the solar-direct demand; its nighttime series is the battery-supported energy dependency used by the storage calculation.

## Appliance search and load-scenario comparison

The appliance database is a guided planning library with categories and a text search. Selecting **Add** creates an additional editable schedule row; it never overwrites an active schedule. The listed appliance values are explicit starting profiles only and must be checked against the actual equipment nameplate and operating pattern.

The field library now includes Telecoms, Surveillance, and Internet profiles alongside Kitchen, Comfort, and Entertainment additions. Representative starting profiles include a telecom power plant, telecom radio cabinet, IP CCTV camera, NVR/security recorder, fibre router/ONT, network switch, blender, bread toaster, inverter air conditioner, and music player. Each record is deliberately editable for site-specific wattage, quantity, operating schedule, utilisation, simultaneous use, and surge inputs.

The Business path of the guided load wizard now includes **Remote telecom site** and **Connected telecom site** planning templates. They combine always-on telecom power, radio, surveillance, network, and DC-distribution records, then replace the active schedule for rapid refinement. The appliance library also includes editable battery-charger and DC-distribution cabinet profiles under **DC Power**. These templates and profile values are preliminary planning records, not telecom engineering specifications or a final site design.

## Telecom redundancy and tower-site BoQ

The Telecoms category now includes editable **telecom battery-bank auxiliaries** and **telecom DC rectifier** profiles. The battery-bank record represents BMS, monitoring, and auxiliary consumption only; it is not the calculated battery-energy capacity. The DC-rectifier record is an AC supply placeholder for a DC plant and should not be added together with all downstream DC loads unless the site architecture calls for both.

The **Apply N+1** option adds one reserve unit to every eligible active telecom power plant, radio cabinet, DC rectifier, and battery-bank auxiliary record. The reserve quantity is included transparently in the energy, surge, inverter, PV, battery, generator, BoQ, and sales-context calculations. The site operating architecture, DC bus arrangement, rectifier sharing, and redundancy design remain subject to qualified telecom engineering confirmation.

The BoQ cover can now be set to **Telecom tower site**. This export title carries a tower reference and editable operational context, while the BoQ records the active N+1 reserve count and each affected load’s operating-plus-reserve quantity.

## Multi-tenant radio and rectifier-module planning

The **Multi-tenant tower site** wizard profile starts with shared site equipment and one editable telecom radio-cabinet record per tenant. The tenant count multiplies only that radio-equipment record; it does not multiply shared power, security, network, or distribution loads. Loading the profile also selects the tower-site cover and sets an editable three-tenant planning starting point.

The telecom design basis records a selectable DC-bus voltage of −48 V DC, −24 V DC, or +24 V DC. This is a design-context field, not a conversion of AC load into DC current; confirm the live bus architecture, site voltage limits, and equipment compatibility before final engineering.

The rectifier-module screen is intentionally separate from equipment N+1. It sums the active telecom power and radio planning basis, excludes the DC-rectifier input placeholder, divides the result by the editable module output rating, and rounds up to operating modules. Enabling **Add rectifier N+1** adds one standby module to the equipment schedule only; it does not increase normal daily energy, PV array, battery, inverter, or generator demand.

Saved scenarios are browser-local snapshots that preserve the load schedule and the active site, backup, loss, equipment-preference, and sizing settings. Users can restore a snapshot to continue refining it and select up to two snapshots for a side-by-side comparison of daily energy, daytime solar demand, nighttime battery dependency, combined surge, PV array, inverter, and battery requirements. Browser-local persistence is not a shared project record and can be cleared by browser data settings.

## Editable custom loads and appliance profiles

The **Add load** control creates a fully editable custom record. In the circuit register, users can give it a site-specific appliance name; in the load schedule, they can edit wattage, quantity, daytime and nighttime operation, daily-use percentage, simultaneous-use percentage, surge factor, and surge duration. Selected standard appliance profiles are starting points only: their wattage and every other row-level sizing input remain editable after selection. Both the custom name and the edited design values are retained in saved scenarios and used by the BoQ load schedule.

## Extended load planning and location setup

Each load row has a **Duplicate** control that copies the full editable record and gives the new row a distinct circuit-label suffix. This supports repeated circuits without altering the original row or its calculated energy and surge contribution.

The appliance library includes a browser-local category manager. Users may add or remove custom categories and save a fully edited custom appliance—its site-specific name, category, note, and sizing inputs—into the local searchable library. Removing a category safely returns its dependent local profiles and custom load records to the default **Custom** category. These local records are not shared and can be cleared by browser data settings.

The branded BoQ load schedule now carries each circuit label, appliance name, category, editable wattage and operating values, and any custom load note. The **Load approximate coordinates** action is user-triggered. It uses the supported map geocoder to convert a project-location description into an approximate, editable latitude and longitude; when a detailed address is not matched, it retries the broader location label. Users retain manual coordinate control and should confirm the point before solar-resource lookup or technical design.

## Indicative 24-hour operating simulation

The operating-profile screen is a deterministic planning simulation, recalculated from the live design inputs rather than a representative or random dataset. It allocates the entered daytime energy evenly from 06:00–18:00 and nighttime energy evenly from 18:00–06:00. A daylight-only sine curve is normalised to the current array capacity, peak-sun-hours value, and retained PV performance factor.

The calculation begins with the usable battery reserve fully charged. Solar generation serves hourly load first; available excess is stored subject to the square-root round-trip charging efficiency; and the battery serves any remaining demand subject to discharge efficiency. In generator-supported and grid-supported scenarios, any residual hourly demand is recorded as the respective backup support. Solar-only mode records that energy as unmet load. The model displays direct solar supply, potential solar energy, battery minimum state of charge, curtailed solar energy, and backup or unserved energy.

This is an indicative energy-balance route only. It does not model weather variability, month-to-month irradiance, PV degradation, load coincidence by appliance, inverter overload response, battery BMS limits, generator ramping, grid voltage quality, DC-bus dynamics, or protection settings. A qualified engineer must verify final design and operating behaviour.
