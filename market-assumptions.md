# West Africa calculator assumptions

## Coverage and sources

The calculator uses the United Nations M49 geographical grouping for **West Africa**, which covers 16 countries. Currency names and ISO codes are taken from the IBAN currency-code reference, and electricity-rate benchmarks are taken from GlobalPetrolPrices’ Q2 2026 dataset. The dataset reports 2023–2026 average residential prices in USD/kWh, which makes it a comparison benchmark rather than a quotation or country tariff schedule.

Local-currency starting rates are calculated from the cited USD benchmark using the ExchangeRate-API USD reference snapshot dated 21 August 2026. They are intentionally editable in the interface. A country marked **regional fallback** uses GlobalPetrolPrices’ Africa residential average of USD 0.14/kWh because no country-specific entry appears in that public comparison table.

| Market | Currency | USD/kWh benchmark | Starting-rate basis |
| --- | --- | ---: | --- |
| Benin | XOF | 0.140 | Africa regional fallback |
| Burkina Faso | XOF | 0.209 | Country benchmark |
| Cabo Verde | CVE | 0.329 | Country benchmark |
| Côte d’Ivoire | XOF | 0.132 | Country benchmark |
| The Gambia | GMD | 0.140 | Africa regional fallback |
| Ghana | GHS | 0.147 | Country benchmark |
| Guinea | GNF | 0.140 | Africa regional fallback |
| Guinea-Bissau | XOF | 0.140 | Africa regional fallback |
| Liberia | LRD | 0.140 | Africa regional fallback |
| Mali | XOF | 0.223 | Country benchmark |
| Mauritania | MRU | 0.140 | Africa regional fallback |
| Niger | XOF | 0.140 | Africa regional fallback |
| Nigeria | NGN | 0.036 | Country benchmark |
| Senegal | XOF | 0.183 | Country benchmark |
| Sierra Leone | SLE | 0.232 | Country benchmark |
| Togo | XOF | 0.199 | Country benchmark |

The calculator’s 12,000 kWh monthly-use and 65% solar-coverage fields remain editable planning scenarios, not regional empirical averages. System cost is intentionally blank on market selection because it needs a site-specific Xtorra proposal.

## Reference links

1. [United Nations M49 statistical regions](https://unstats.un.org/unsd/methodology/m49/)
2. [IBAN country currency codes](https://www.iban.com/currency-codes)
3. [GlobalPetrolPrices electricity-price comparison table](https://www.globalpetrolprices.com/electricity_prices/)
4. [ExchangeRate-API USD reference data](https://open.er-api.com/v6/latest/USD)
