# Inverter-model overload shortlist

## Purpose and recommendation rule

The model shortlist is an **indicative engineering screen**, not a procurement instruction. A candidate must meet both the calculator’s continuous inverter requirement and its surge requirement for the longest active user-entered surge duration. The relevant checks are:

`continuous model output ≥ simultaneous load × inverter headroom`

`documented overload tier ≥ combined surge watts × inverter headroom for the governing duration`

The calculator uses the longest duration entered across active surge loads as the governing duration. This is deliberately conservative when motor starts may overlap. Users should replace the planning durations with appliance or motor-start data, and Xtorra must still confirm product variant, regional voltage, parallel operation, temperature derating, battery limits, protection, and available stock before procurement.

## Documented models in the calculator

| Brand | Model | Continuous output | Documented overload tier | Source |
| --- | --- | ---: | --- | --- |
| Deye | SUN-5K-SG04LP1-EU-SM2 | 5 kW | 10 kW for 10 s | [Official Deye model page](https://www.deyeinverter.com/product/single-phase-low-voltage-hybrid-inverter/SUN3-3-6-5-6KSG04LP1EU-36kW-Single-Phase-2-MPPT-Hybrid-Inverter-LV-Battery-Supported-2346.html) |
| Deye | SUN-10K-SG05LP3-EU-SM2 | 10 kW | 20 kW for 10 s | [Official Deye three-phase model page](https://www.deyeinverter.com/product/three-phase-hybrid-inverter-1/sun3-4-5-6-8-10-12ksg05lp3eusm2-312kw-three-phase-2-mppt-hybrid-inverter-lv-battery-supported.html) |
| Sunsynk | SUNSYNK-5K-SG03LP1 | 5 kW | 10 kW for 10 s | [Official Sunsynk manual](https://www.sunsynk.org/uploads/1779953698880-SUNSYNK--3-6-5-K-SG03LP1_v44---en.pdf) |
| Sunsynk | SUNSYNK-8K-SG01LP1 | 8 kW | 16 kW for 10 s | [Official Sunsynk datasheet](https://www.sunsynk.org/uploads/1779874238124-Sunsynk_Hybrid_Inverter_8kW_Datasheet_v22_English.pdf) |
| Victron Energy | Multi RS Solar 48/6000/100-450/100 | 5.2 kW at 52 VDC | 9 kW for 3 s; 7 kW for 4 min | [Official Victron technical specifications](https://www.victronenergy.com/media/pg/Multi_RS_Solar/en/technical-specifications.html) |
| Huawei | SUN2000-5K-MAP0 | 5 kW | 10 kW for 10 s | [Official Huawei specifications](https://solar.huawei.com/en/products/sun2000-5-12k-map0/specs/) |
| Huawei | SUN2000-10K-MAP0 | 10 kW | 20 kW for 10 s | [Official Huawei specifications](https://solar.huawei.com/en/products/sun2000-5-12k-map0/specs/) |
| Growatt | SPF 5000 ES | 5 kW | 10 kVA for 5 s | [Official Growatt user manual](https://us.growatt.com/upload/file/SPF_3500-5000_ES_User_Manual_EN_202109.pdf) |
| Growatt | SPF 6000 ES Plus | 6 kW | 12 kVA for 5 s | [Official Growatt datasheet](https://en.growatt.com/upload/file/SPF_6000_ES_Plus_Datasheet_EN_202211.pdf) |
| Felicity Solar | IVGM5KLP1G2 | 5 kW | 10 kW for 10 s | [Official Felicity user guide](https://doc.felicitysolar.com/manual/Inverter/IVGM3~6KLP1G2/IVGM3KLP1G2-24_IVGM3KLP1G2_IVGM3K6LP1G2_IVGM4K6LP1G2_IVGM5KLP1G2_IVGM6KLP1G2_User_Guide_-_English.pdf) |
| Felicity Solar | IVEM5048-LV | 5 kW | 10 kW for 5 s | [Official Felicity user guide](https://doc.felicitysolar.com/manual/Inverter/IVEM5048-LV/IVEM5048-LV%20User%20Guide%20-%20EN.pdf) |

## Scope limits

The source data identifies output and overload ratings. It does **not** establish local distributor availability, project suitability, string-voltage compatibility, phase configuration, or final electrical protection design. The Huawei MAP0 models, for example, are three-phase products with documented compatibility constraints; a passing overload screen does not make any model suitable for a particular installation.

## Live validation

The design workbench was checked with its default 3,554 W post-headroom surge requirement for 5 seconds. The Deye 5 kW and 10 kW reference models both passed the documented 10-second overload screen. When the refrigeration surge duration was increased to 11 seconds, both Deye models changed to **Review required**, because the cited 200% overload tier is documented for 10 seconds only. This verifies that the recommendation screen responds to duration as well as capacity.
