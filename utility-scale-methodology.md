# Utility-scale solar planning method

## Purpose and limits

This page is a **preliminary planning calculator**, not a bankable energy-yield assessment, interconnection study, detailed design, or construction specification. It makes all important starting assumptions editable and is intended to help frame Xtorra’s early engineering conversations.

## Calculation basis

| Output | Method |
| --- | --- |
| Nominal DC capacity | AC export capacity × DC/AC ratio |
| Annual gross energy | Nominal DC MW × peak-sun-hours/day × 365 |
| Net planning energy | Gross annual energy × (1 − DC loss stack) × availability |
| AC capacity factor | Net annual MWh ÷ (AC export MW × 8,760 hours) |
| Module count | Rounded up DC Wp ÷ selected module Wp |
| Inverter blocks | Rounded up AC export MW ÷ selected inverter-block MW |
| Land estimate | AC export MW × editable acres-per-MW factor |

The live solar-resource control reads the NASA POWER **ALLSKY_SFC_SW_DWN** daily all-sky surface shortwave irradiance series for the supplied coordinates and calculates the calendar-year average. This is equivalent to a daily peak-sun-hour planning input, but does not replace a project-specific resource assessment.

## Land-use starting point

The default footprint is **6 acres per MWac**, which sits in the Solar Energy Industries Association’s stated 5–7 acres per MW range for utility-scale solar. It is intentionally editable because final land requirements depend on technology, topography, setbacks, drainage, environmental exclusions, transmission infrastructure, and local permitting.

## References

1. [NASA POWER Daily API — all-sky surface shortwave irradiance](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
2. [Solar Energy Industries Association — Land Use and Solar Development](https://seia.org/research-resources/land-use-and-solar-development/)
