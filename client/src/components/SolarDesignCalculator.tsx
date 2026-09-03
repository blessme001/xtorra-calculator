/* Solar Cartography component: an engineered field-workbench using Navy authority, Solar Lime decision cues, explicit inputs, and directional measurement details. */
/* Solar Cartography field instrument: measured outputs lead, while sparse navy datum lines and Solar Lime route points keep this long workbench legible as one mapped energy journey. */
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BatteryCharging, Calculator, Download, Factory, FolderOpen, Info, MapPin, Plus, Printer, RotateCw, Save, Search, Send, ShieldCheck, SunMedium, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/Map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LoadRow = {
  id: string;
  item: string;
  circuitName: string;
  category?: string;
  notes?: string;
  watts: number;
  quantity: number;
  dayHours: number;
  nightHours: number;
  utilisation: number;
  simultaneous: number;
  surgeFactor: number;
  surgeDurationSec: number;
};

export type BoqSalesContext = {
  customerName: string;
  projectLocation: string;
  summary: string;
};

type SolarDesignCalculatorProps = {
  onBoqEnquiry?: (context: BoqSalesContext) => void;
};

type AppliancePreset = {
  id: string;
  category: string;
  label: string;
  item: string;
  notes?: string;
  watts: number;
  quantity: number;
  dayHours: number;
  nightHours: number;
  utilisation: number;
  simultaneous: number;
  surgeFactor: number;
  surgeDurationSec: number;
};

type BoqCoverType = "standard" | "tower-site";

type SavedScenario = {
  id: string;
  name: string;
  savedAt: string;
  loads: LoadRow[];
  location: string;
  customerName: string;
  projectLocation: string;
  latitude: number;
  longitude: number;
  peakSunHours: number;
  temperatureLoss: number;
  soilingLoss: number;
  shadingLoss: number;
  mismatchLoss: number;
  dcCableLoss: number;
  mpptEfficiency: number;
  inverterEfficiency: number;
  acCableLoss: number;
  batteryRoundTrip: number;
  depthOfDischarge: number;
  autonomyDays: number;
  backupScenarioId: "solar-only" | "generator" | "grid";
  gridTariff: number;
  gridCurrency: string;
  gridOutageHours: number;
  generatorPowerFactor: number;
  generatorLoadingTarget: number;
  arrayMargin: number;
  inverterHeadroom: number;
  moduleWattage: number;
  inverterBrand: string;
  batteryBrand: string;
  telecomNPlusOne?: boolean;
  tenantCount?: number;
  dcBusVoltage?: string;
  rectifierModuleWatts?: number;
  rectifierModuleNPlusOne?: boolean;
  boqCoverType?: BoqCoverType;
  towerReference?: string;
  towerOperationalContext?: string;
  solarResourceScenario?: string;
  rainyMonthMode?: "automatic" | "custom";
  customRainyMonths?: number[];
  batteryAgeYears?: number;
  batteryAnnualDegradation?: number;
  lifecycleCurrency?: string;
  batteryReplacementCost?: number;
  batteryReplacementEscalation?: number;
  batteryReplacementIntervalYears?: number;
  batteryReplacementForecastYears?: number;
  outputs: {
    dailyEnergy: number;
    dayEnergy: number;
    nightEnergy: number;
    surgePeakWatts: number;
    arrayWp: number;
    inverterKw: number;
    batteryKwh: number;
  };
};

type GuidedLoadProfile = {
  id: string;
  audience: "home" | "business";
  label: string;
  note: string;
  loads: Array<Omit<LoadRow, "id" | "circuitName"> & { circuitName?: string }>;
};

type InverterModel = {
  brand: string;
  model: string;
  continuousKw: number;
  overloadTiers: Array<{ watts: number; durationSec: number }>;
  sourceUrl: string;
  phaseNote: string;
};

type NASAResponse = {
  properties?: {
    parameter?: {
      ALLSKY_SFC_SW_DWN?: Record<string, number>;
    };
  };
};

type MonthlySolarResource = {
  id: string;
  label: string;
  psh: number;
};

type RainySeasonResourceScenario = MonthlySolarResource & {
  probability: "P50" | "P80" | "P90";
  periodLabel: string;
  recordWindow: string;
  observationCount: number;
  windowMode: "automatic" | "custom";
};

type HistoricalRainyResource = {
  records: Array<{ monthIndex: number; value: number }>;
  startYear: number;
  endYear: number;
  latitude: number;
  longitude: number;
};

type StoredResourceScenarioPreference = {
  id: string;
  rainyMonthMode?: "automatic" | "custom";
  customRainyMonths?: number[];
  scenario?: MonthlySolarResource;
  rainyScenario?: RainySeasonResourceScenario;
  latitude?: number;
  longitude?: number;
};

type ResourcePreset = {
  id: string;
  name: string;
  savedAt: string;
  preference: StoredResourceScenarioPreference;
  peakSunHours: number;
};

type BatteryReplacementForecast = {
  year: number;
  futureCost: number;
  replacementEventCost: number;
  isScheduledReplacement: boolean;
};

const initialLoads: LoadRow[] = [
  { id: "lighting", item: "LED lighting", circuitName: "Lighting circuit", watts: 12, quantity: 12, dayHours: 0, nightHours: 7, utilisation: 100, simultaneous: 85, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "refrigeration", item: "Refrigeration", circuitName: "Cold storage circuit", watts: 180, quantity: 1, dayHours: 8, nightHours: 4, utilisation: 65, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
  { id: "workstation", item: "Workstation / office equipment", circuitName: "Office sockets", watts: 120, quantity: 4, dayHours: 8, nightHours: 0, utilisation: 80, simultaneous: 90, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "pump", item: "Water pump", circuitName: "Water pump circuit", watts: 750, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 80, surgeFactor: 3, surgeDurationSec: 3 },
];

const applianceCatalogue: AppliancePreset[] = [
  { id: "led-lighting", category: "Lighting", label: "LED lighting · 12 W", item: "LED lighting", watts: 12, quantity: 12, dayHours: 0, nightHours: 7, utilisation: 100, simultaneous: 85, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "security-lighting", category: "Lighting", label: "Security lighting · 20 W", item: "Security lighting", watts: 20, quantity: 4, dayHours: 0, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "telecom-power-plant", category: "Telecoms", label: "Telecom power plant · 900 W", item: "Telecom power plant", watts: 900, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "telecom-radio-cabinet", category: "Telecoms", label: "Telecom radio cabinet · 600 W", item: "Telecom radio cabinet", watts: 600, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "telecom-battery-bank", category: "Telecoms", label: "Telecom battery bank auxiliaries · 50 W", item: "Telecom battery bank auxiliaries", notes: "Planning placeholder for BMS, monitoring, and auxiliary consumption only; do not use it as the battery capacity requirement.", watts: 50, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "telecom-dc-rectifier", category: "Telecoms", label: "Telecom DC rectifier · 1,200 W", item: "Telecom DC rectifier", notes: "Use as the AC supply placeholder for a DC plant; avoid double-counting it with its downstream DC loads unless the site architecture requires both.", watts: 1200, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "ip-cctv-camera", category: "Surveillance", label: "IP CCTV camera · 12 W", item: "IP CCTV camera", watts: 12, quantity: 8, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "security-recorder", category: "Surveillance", label: "NVR / security recorder · 60 W", item: "NVR / security recorder", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "fibre-router", category: "Internet", label: "Fibre router / ONT · 20 W", item: "Fibre router / ONT", watts: 20, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "network-switch", category: "Internet", label: "Network switch · 60 W", item: "Network switch", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "battery-charger", category: "DC Power", label: "Battery charger · 800 W", item: "Battery charger", watts: 800, quantity: 1, dayHours: 6, nightHours: 0, utilisation: 70, simultaneous: 80, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "dc-distribution", category: "DC Power", label: "DC distribution cabinet · 50 W", item: "DC distribution cabinet", watts: 50, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "refrigeration", category: "Refrigeration", label: "Refrigeration · 180 W", item: "Refrigeration", watts: 180, quantity: 1, dayHours: 8, nightHours: 4, utilisation: 65, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
  { id: "chest-freezer", category: "Refrigeration", label: "Chest freezer · 200 W", item: "Chest freezer", watts: 200, quantity: 1, dayHours: 8, nightHours: 4, utilisation: 60, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
  { id: "television", category: "Entertainment", label: "Television / display · 120 W", item: "Television / display", watts: 120, quantity: 1, dayHours: 3, nightHours: 4, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "music-player", category: "Entertainment", label: "Music player · 60 W", item: "Music player", watts: 60, quantity: 1, dayHours: 2, nightHours: 4, utilisation: 80, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "ceiling-fan", category: "Comfort", label: "Ceiling fan · 75 W", item: "Ceiling fan", watts: 75, quantity: 4, dayHours: 4, nightHours: 6, utilisation: 80, simultaneous: 80, surgeFactor: 2, surgeDurationSec: 3 },
  { id: "inverter-air-conditioner", category: "Comfort", label: "Inverter air conditioner · 1,000 W", item: "Inverter air conditioner", watts: 1000, quantity: 1, dayHours: 4, nightHours: 4, utilisation: 70, simultaneous: 100, surgeFactor: 2, surgeDurationSec: 3 },
  { id: "workstation", category: "Office", label: "Workstation / office equipment · 120 W", item: "Workstation / office equipment", watts: 120, quantity: 4, dayHours: 8, nightHours: 0, utilisation: 80, simultaneous: 90, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "router", category: "Office", label: "Router / network equipment · 25 W", item: "Router / network equipment", watts: 25, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "laser-printer", category: "Office", label: "Laser printer · 600 W", item: "Laser printer", watts: 600, quantity: 1, dayHours: 2, nightHours: 0, utilisation: 20, simultaneous: 60, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "water-pump", category: "Pumps & motors", label: "Water pump · 750 W", item: "Water pump", watts: 750, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 80, surgeFactor: 3, surgeDurationSec: 3 },
  { id: "borehole-pump", category: "Pumps & motors", label: "Borehole pump · 1,100 W", item: "Borehole pump", watts: 1100, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 100, surgeFactor: 3, surgeDurationSec: 5 },
  { id: "air-conditioner", category: "Comfort", label: "Split air conditioner · 1,200 W", item: "Split air conditioner", watts: 1200, quantity: 1, dayHours: 4, nightHours: 4, utilisation: 70, simultaneous: 100, surgeFactor: 3, surgeDurationSec: 5 },
  { id: "microwave", category: "Kitchen", label: "Microwave oven · 1,000 W", item: "Microwave oven", watts: 1000, quantity: 1, dayHours: 0.25, nightHours: 0.25, utilisation: 100, simultaneous: 70, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "blender", category: "Kitchen", label: "Blender · 500 W", item: "Blender", watts: 500, quantity: 1, dayHours: 0.15, nightHours: 0.1, utilisation: 100, simultaneous: 60, surgeFactor: 2, surgeDurationSec: 1 },
  { id: "bread-toaster", category: "Kitchen", label: "Bread toaster · 800 W", item: "Bread toaster", watts: 800, quantity: 1, dayHours: 0.1, nightHours: 0.1, utilisation: 100, simultaneous: 60, surgeFactor: 1.2, surgeDurationSec: 1 },
  { id: "washing-machine", category: "Laundry", label: "Washing machine · 600 W", item: "Washing machine", watts: 600, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 80, surgeFactor: 2, surgeDurationSec: 3 },
];

const baseApplianceCategories = ["All", ...Array.from(new Set(applianceCatalogue.map((preset) => preset.category)))];
const scenarioStorageKey = "xtorra-load-scenarios-v1";
const resourceScenarioStorageKey = "xtorra-solar-resource-scenario-v1";
const resourcePresetStorageKey = "xtorra-solar-resource-presets-v1";
const customCategoryStorageKey = "xtorra-custom-appliance-categories-v1";
const customApplianceStorageKey = "xtorra-custom-appliance-profiles-v1";

const guidedLoadProfiles: GuidedLoadProfile[] = [
  { id: "compact-home", audience: "home", label: "Compact home", note: "Lighting, refrigeration, fans, a television and basic water pumping.", loads: [
    { item: "LED lighting", watts: 12, quantity: 8, dayHours: 0, nightHours: 6, utilisation: 100, simultaneous: 85, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Refrigeration", watts: 180, quantity: 1, dayHours: 8, nightHours: 4, utilisation: 65, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
    { item: "Ceiling fan", watts: 75, quantity: 2, dayHours: 2, nightHours: 6, utilisation: 80, simultaneous: 80, surgeFactor: 2, surgeDurationSec: 3 },
    { item: "Television / display", watts: 120, quantity: 1, dayHours: 2, nightHours: 3, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Water pump", watts: 750, quantity: 1, dayHours: 0.5, nightHours: 0, utilisation: 100, simultaneous: 80, surgeFactor: 3, surgeDurationSec: 3 },
  ] },
  { id: "family-home", audience: "home", label: "Family home", note: "A larger residential starting schedule with more lighting, fans and cooling demand.", loads: [
    { item: "LED lighting", watts: 12, quantity: 18, dayHours: 0, nightHours: 7, utilisation: 100, simultaneous: 80, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Refrigeration", watts: 180, quantity: 2, dayHours: 8, nightHours: 4, utilisation: 65, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
    { item: "Ceiling fan", watts: 75, quantity: 5, dayHours: 3, nightHours: 7, utilisation: 80, simultaneous: 75, surgeFactor: 2, surgeDurationSec: 3 },
    { item: "Television / display", watts: 120, quantity: 2, dayHours: 3, nightHours: 4, utilisation: 100, simultaneous: 80, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Water pump", watts: 750, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 80, surgeFactor: 3, surgeDurationSec: 3 },
  ] },
  { id: "small-office", audience: "business", label: "Small office", note: "Workstations, lighting, cooling and a network/refrigeration support load.", loads: [
    { item: "LED lighting", watts: 12, quantity: 20, dayHours: 8, nightHours: 0, utilisation: 90, simultaneous: 85, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Workstation / office equipment", watts: 120, quantity: 8, dayHours: 8, nightHours: 0, utilisation: 80, simultaneous: 90, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Split air conditioner", watts: 1200, quantity: 2, dayHours: 7, nightHours: 0, utilisation: 70, simultaneous: 85, surgeFactor: 3, surgeDurationSec: 5 },
    { item: "Refrigeration", watts: 180, quantity: 1, dayHours: 8, nightHours: 0, utilisation: 65, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 5 },
    { item: "Water pump", watts: 750, quantity: 1, dayHours: 0.5, nightHours: 0, utilisation: 100, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 3 },
  ] },
  { id: "retail-shop", audience: "business", label: "Retail shop", note: "Display lighting, refrigeration, fans, point-of-sale and pumping loads.", loads: [
    { item: "LED lighting", watts: 12, quantity: 24, dayHours: 10, nightHours: 0, utilisation: 90, simultaneous: 90, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Refrigeration", watts: 180, quantity: 2, dayHours: 10, nightHours: 0, utilisation: 70, simultaneous: 80, surgeFactor: 3, surgeDurationSec: 5 },
    { item: "Ceiling fan", watts: 75, quantity: 4, dayHours: 9, nightHours: 0, utilisation: 85, simultaneous: 85, surgeFactor: 2, surgeDurationSec: 3 },
    { item: "Workstation / office equipment", watts: 120, quantity: 2, dayHours: 10, nightHours: 0, utilisation: 80, simultaneous: 90, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Water pump", watts: 750, quantity: 1, dayHours: 0.5, nightHours: 0, utilisation: 100, simultaneous: 70, surgeFactor: 3, surgeDurationSec: 3 },
  ] },
  { id: "remote-telecom-site", audience: "business", label: "Remote telecom site", note: "A planning start for always-on radio, DC power, security, and network equipment at a compact remote location.", loads: [
    { item: "Telecom power plant", circuitName: "DC power plant", watts: 900, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Telecom radio cabinet", circuitName: "Radio equipment", watts: 600, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "IP CCTV camera", circuitName: "Site surveillance", watts: 12, quantity: 4, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "NVR / security recorder", circuitName: "Security recorder", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Fibre router / ONT", circuitName: "Internet gateway", watts: 20, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "DC distribution cabinet", circuitName: "DC distribution", watts: 50, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  ] },
  { id: "connected-telecom-site", audience: "business", label: "Connected telecom site", note: "A higher-resilience planning start for a connected telecom site with multiple radio cabinets, security, and network support.", loads: [
    { item: "Telecom power plant", circuitName: "Primary DC power plant", watts: 1200, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Telecom radio cabinet", circuitName: "Radio equipment", watts: 600, quantity: 2, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "IP CCTV camera", circuitName: "Site surveillance", watts: 12, quantity: 8, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "NVR / security recorder", circuitName: "Security recorder", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Network switch", circuitName: "Network distribution", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "DC distribution cabinet", circuitName: "DC distribution", watts: 50, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  ] },
  { id: "multi-tenant-tower", audience: "business", label: "Multi-tenant tower site", note: "A telecom tower planning start with one editable radio cabinet per tenant, plus shared security and network support.", loads: [
    { item: "Telecom power plant", circuitName: "Primary DC power plant", watts: 1200, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Telecom radio cabinet", circuitName: "Tenant radio equipment", watts: 600, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 90, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "IP CCTV camera", circuitName: "Site surveillance", watts: 12, quantity: 8, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "NVR / security recorder", circuitName: "Security recorder", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "Network switch", circuitName: "Network distribution", watts: 60, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
    { item: "DC distribution cabinet", circuitName: "DC distribution", watts: 50, quantity: 1, dayHours: 12, nightHours: 12, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 },
  ] },
];

const inverterBrandOptions = ["No preference / Xtorra recommendation", "Deye", "Sunsynk", "Victron Energy", "Huawei", "Growatt", "Felicity Solar", "Other / subject to technical review"];
const batteryBrandOptions = ["No preference / Xtorra recommendation", "Felicity Solar", "Pylontech", "Dyness", "BYD Battery-Box", "Hubble Lithium", "Other / subject to technical review"];

const inverterModelLibrary: InverterModel[] = [
  { brand: "Deye", model: "SUN-5K-SG04LP1-EU-SM2", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 10 }], sourceUrl: "https://www.deyeinverter.com/product/single-phase-low-voltage-hybrid-inverter/SUN3-3-6-5-6KSG04LP1EU-36kW-Single-Phase-2-MPPT-Hybrid-Inverter-LV-Battery-Supported-2346.html", phaseNote: "Single phase; confirm regional variant" },
  { brand: "Deye", model: "SUN-10K-SG05LP3-EU-SM2", continuousKw: 10, overloadTiers: [{ watts: 20000, durationSec: 10 }], sourceUrl: "https://www.deyeinverter.com/product/three-phase-hybrid-inverter-1/sun3-4-5-6-8-10-12ksg05lp3eusm2-312kw-three-phase-2-mppt-hybrid-inverter-lv-battery-supported.html", phaseNote: "Three phase; confirm site configuration" },
  { brand: "Sunsynk", model: "SUNSYNK-5K-SG03LP1", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 10 }], sourceUrl: "https://www.sunsynk.org/uploads/1779953698880-SUNSYNK--3-6-5-K-SG03LP1_v44---en.pdf", phaseNote: "Single phase" },
  { brand: "Sunsynk", model: "SUNSYNK-8K-SG01LP1", continuousKw: 8, overloadTiers: [{ watts: 16000, durationSec: 10 }], sourceUrl: "https://www.sunsynk.org/uploads/1779874238124-Sunsynk_Hybrid_Inverter_8kW_Datasheet_v22_English.pdf", phaseNote: "Single phase" },
  { brand: "Victron Energy", model: "Multi RS Solar 48/6000/100-450/100", continuousKw: 5.2, overloadTiers: [{ watts: 9000, durationSec: 3 }, { watts: 7000, durationSec: 240 }], sourceUrl: "https://www.victronenergy.com/media/pg/Multi_RS_Solar/en/technical-specifications.html", phaseNote: "Single phase; 5.2 kW applies at 52 VDC" },
  { brand: "Huawei", model: "SUN2000-5K-MAP0", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 10 }], sourceUrl: "https://solar.huawei.com/en/products/sun2000-5-12k-map0/specs/", phaseNote: "Three phase; requires compatible backup device" },
  { brand: "Huawei", model: "SUN2000-10K-MAP0", continuousKw: 10, overloadTiers: [{ watts: 20000, durationSec: 10 }], sourceUrl: "https://solar.huawei.com/en/products/sun2000-5-12k-map0/specs/", phaseNote: "Three phase; requires compatible backup device" },
  { brand: "Growatt", model: "SPF 5000 ES", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 5 }], sourceUrl: "https://us.growatt.com/upload/file/SPF_3500-5000_ES_User_Manual_EN_202109.pdf", phaseNote: "Confirm regional voltage model" },
  { brand: "Growatt", model: "SPF 6000 ES Plus", continuousKw: 6, overloadTiers: [{ watts: 12000, durationSec: 5 }], sourceUrl: "https://en.growatt.com/upload/file/SPF_6000_ES_Plus_Datasheet_EN_202211.pdf", phaseNote: "Confirm regional voltage model" },
  { brand: "Felicity Solar", model: "IVGM5KLP1G2", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 10 }], sourceUrl: "https://doc.felicitysolar.com/manual/Inverter/IVGM3~6KLP1G2/IVGM3KLP1G2-24_IVGM3KLP1G2_IVGM3K6LP1G2_IVGM4K6LP1G2_IVGM5KLP1G2_IVGM6KLP1G2_User_Guide_-_English.pdf", phaseNote: "Confirm regional voltage model" },
  { brand: "Felicity Solar", model: "IVEM5048-LV", continuousKw: 5, overloadTiers: [{ watts: 10000, durationSec: 5 }], sourceUrl: "https://doc.felicitysolar.com/manual/Inverter/IVEM5048-LV/IVEM5048-LV%20User%20Guide%20-%20EN.pdf", phaseNote: "Confirm regional voltage model" },
];

const reportLogoUrl = "/manus-storage/xtorra-logo_6cfa4db6.png";
const loadChartColors = ["#58A90E", "#0F6693", "#E5AD14", "#082C67", "#71A7B6", "#8C6A2A", "#A9D829", "#8FABC1"];
const telecomRedundancyItems = new Set(["Telecom power plant", "Telecom radio cabinet", "Telecom DC rectifier", "Telecom battery bank auxiliaries"]);
const isTelecomRedundancyEligible = (row: LoadRow) => row.category === "Telecoms" && telecomRedundancyItems.has(row.item);
const isTenantScalableRadioLoad = (row: LoadRow) => row.category === "Telecoms" && row.item === "Telecom radio cabinet";

const headerRecommendedRanges: Record<string, string> = {
  "Watts": "1–5,000 W per appliance; confirm the nameplate above this range.",
  "Qty": "1–20 identical appliances per row.",
  "Day h": "0–24 h, with day and night hours together not exceeding 24 h/day.",
  "Night h": "0–24 h, with day and night hours together not exceeding 24 h/day.",
  "Daily use %": "20–100% of the entered schedule; never above 100%.",
  "Simult. %": "50–100% for typical coincident-load planning; never above 100%.",
  "Surge factor": "Use 1.2× for electronics, 2.0× for moderate motor loads, or 3.0× when the motor start data supports it.",
  "Surge s": "0.5–10 seconds unless documented manufacturer data supports a longer start window.",
};

function LoadHeaderHelp({ label, description, align = "right" }: { label: string; description: string; align?: "left" | "right" }) {
  const recommendedRange = headerRecommendedRanges[label];
  const fullDescription = recommendedRange ? `${description} Recommended range: ${recommendedRange}` : description;
  return <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`${label}: ${fullDescription}`} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm outline-none transition-colors hover:text-[#0F6693] focus-visible:ring-2 focus-visible:ring-[#58A90E] ${align === "right" ? "ml-auto" : ""}`}><span>{label}</span><Info aria-hidden="true" className="h-3 w-3 opacity-75" /></button></TooltipTrigger><TooltipContent side="top" sideOffset={8} className="max-w-[240px] rounded-none bg-[#082C67] px-3 py-2 text-left text-[0.7rem] leading-5 text-white"><p>{description}</p>{recommendedRange && <p className="mt-2 border-t border-white/20 pt-2 font-bold text-[#CBEF7B]">Recommended: {recommendedRange}</p>}</TooltipContent></Tooltip>;
}

const mobileFieldDefinitions = [
  ["Watts", "The running power rating for one appliance. Recommended starting range: 1–5,000 W; confirm the nameplate above this range."], ["Quantity", "Number of identical appliances in this row. Recommended starting range: 1–20."], ["Day / night hours", "Average operating hours during daylight and after solar production. Keep their total at or below 24 h/day."], ["Daily use %", "The share of scheduled hours when the load actually runs; it changes energy only. Typical planning range: 20–100%."], ["Simultaneous %", "The share of this load expected to run together; it changes the inverter power check, not kWh. Typical planning range: 50–100%."], ["Surge factor", "Start-up multiplier applied to simultaneous watts. Choose 1.2×, 2.0×, or 3.0× according to documented start characteristics."], ["Surge seconds", "Expected duration of the start-up surge. Typical planning range: 0.5–10 seconds; the longest active value is used for inverter overload screening."],
] as const;

const applianceProfileGuidance: Record<string, string> = {
  "LED lighting": "Low-starting-load profile; adjust night hours and simultaneous use to match switching zones.",
  "Security lighting": "Nighttime lighting profile; confirm switching controls, sensor operation, and actual operating window.",
  "Refrigeration": "Compressor-cycle profile; confirm nameplate running watts and locked-rotor / start-up demand.",
  "Chest freezer": "Compressor-cycle profile; confirm the appliance label, ambient conditions, and expected duty cycle.",
  "Television / display": "Electronic-load profile; update operating hours, quantity, and concurrent use for the room plan.",
  "Ceiling fan": "Motor-load profile; set quantity and night hours to reflect occupied rooms and fan speed.",
  "Workstation / office equipment": "Office-load profile; amend workstation count and actual working-hours utilisation.",
  "Router / network equipment": "Always-on electronics profile; confirm any switch, access-point, or server loads on the same circuit.",
  "Laser printer": "Intermittent office-load profile; confirm the peak print-cycle rating where relevant to circuit design.",
  "Water pump": "Motor-load profile; confirm pump nameplate watts, duty cycle, and manufacturer starting current.",
  "Split air conditioner": "Compressor profile; verify inverter/non-inverter type, circuit rating, and coincident cooling demand.",
  "Borehole pump": "High-starting-load profile; verify motor rating, lift, controller requirements, and start current.",
  "Microwave oven": "Short-duration kitchen profile; confirm the input power on the rating label rather than output cooking watts.",
  "Washing machine": "Intermittent motor-load profile; confirm heating element presence and motor start characteristics.",
};

function getLoadWarnings(row: LoadRow) {
  const warnings: string[] = [];
  const scheduledHours = Math.max(0, row.dayHours || 0) + Math.max(0, row.nightHours || 0);
  if (row.watts > 5000) warnings.push("Running power exceeds 5,000 W. Verify the unit is in watts, not kilowatts, and use the equipment nameplate.");
  if (row.quantity > 20) warnings.push("More than 20 units are included. Confirm this is one appliance group and not a duplicated row.");
  if (scheduledHours > 24) warnings.push("Day and night operating hours exceed 24 h/day. Check the schedule split.");
  if (row.utilisation > 100) warnings.push("Daily use cannot exceed 100%. Calculations are capped at 100% until the input is corrected.");
  if (row.simultaneous > 100) warnings.push("Simultaneous use cannot exceed 100%. Calculations are capped at 100% until the input is corrected.");
  if (row.quantity > 1 && row.simultaneous > 90) warnings.push("Nearly all units are assumed to start together. Confirm this coincident-load assumption.");
  if (row.surgeFactor >= 3 && row.watts >= 1500) warnings.push("A 3.0× surge factor is being used on a high-power load. Confirm the manufacturer’s start-current and duration data.");
  if (row.surgeDurationSec > 10) warnings.push("Surge duration exceeds 10 seconds. Verify the starting sequence and inverter overload specification.");
  return warnings;
}

const backupScenarios = {
  "solar-only": {
    label: "Solar + battery only",
    shortLabel: "Solar-only",
    defaultAutonomy: 1,
    description: "Battery carries the selected nighttime load without a planned generator or grid contribution.",
  },
  generator: {
    label: "Generator-supported",
    shortLabel: "Generator backup",
    defaultAutonomy: 0.5,
    description: "Generator support is assumed after the selected half-day battery window; validate generator availability and changeover design.",
  },
  grid: {
    label: "Grid-supported",
    shortLabel: "Grid backup",
    defaultAutonomy: 0.25,
    description: "Grid support is assumed after the selected six-hour battery window; use a higher autonomy value where grid reliability requires it.",
  },
} as const;

type BackupScenarioId = keyof typeof backupScenarios;

const number = (value: number, maximumFractionDigits = 0) => new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(Number.isFinite(value) ? value : 0);
const money = (currency: string, value: number) => `${currency.trim().toUpperCase() || "Currency"} ${number(Math.max(0, value), 0)}`;
const rainyMonthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const percentile = (values: number[], probability: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const position = Math.min(sorted.length - 1, Math.max(0, probability) * (sorted.length - 1));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

const normaliseRainyMonthSelection = (monthIndices: number[]) => Array.from(new Set(monthIndices.filter((monthIndex) => Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < 12))).sort((left, right) => left - right);

const deriveRainySeasonScenarios = (historical: HistoricalRainyResource, mode: "automatic" | "custom", customMonths: number[]) => {
  const customWindow = normaliseRainyMonthSelection(customMonths);
  const monthMeans = Array.from({ length: 12 }, (_, monthIndex) => {
    const values = historical.records.filter((entry) => entry.monthIndex === monthIndex).map((entry) => entry.value);
    return { monthIndex, average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.POSITIVE_INFINITY };
  });
  const monthIndices = mode === "custom" ? customWindow : monthMeans.sort((left, right) => left.average - right.average).slice(0, 5).map((entry) => entry.monthIndex).sort((left, right) => left - right);
  const values = historical.records.filter((entry) => monthIndices.includes(entry.monthIndex)).map((entry) => entry.value);
  if (monthIndices.length === 0 || values.length < 60) return null;
  const periodLabel = monthIndices.map((monthIndex) => rainyMonthOptions[monthIndex]).join(", ");
  const recordWindow = `${historical.startYear}–${historical.endYear}`;
  const modeLabel = mode === "custom" ? "Custom rainy window" : "Rainy proxy";
  const scenarioPrefix = mode === "custom" ? "rainy-custom" : "rainy-auto";
  const scenario = (probability: "P50" | "P80" | "P90", fraction: number): RainySeasonResourceScenario => ({
    id: `${scenarioPrefix}-${probability.toLowerCase()}`,
    label: `${modeLabel} ${probability} · ${recordWindow}`,
    psh: Number(percentile(values, fraction).toFixed(2)),
    probability,
    periodLabel,
    recordWindow,
    observationCount: values.length,
    windowMode: mode,
  });
  return [scenario("P50", 0.5), scenario("P80", 0.2), scenario("P90", 0.1)];
};

const runEnergySimulation = ({
  dayEnergy,
  nightEnergy,
  arrayWp,
  batteryKwh,
  retainedPvFactor,
  batteryRoundTrip,
  depthOfDischarge,
  inverterEfficiency,
  batteryAgeRetention,
  backupScenarioId,
  peakSunHours,
}: {
  dayEnergy: number;
  nightEnergy: number;
  arrayWp: number;
  batteryKwh: number;
  retainedPvFactor: number;
  batteryRoundTrip: number;
  depthOfDischarge: number;
  inverterEfficiency: number;
  batteryAgeRetention: number;
  backupScenarioId: BackupScenarioId;
  peakSunHours: number;
}) => {
  const safeBatteryRoundTrip = Math.min(1, Math.max(0.01, batteryRoundTrip / 100));
  const batteryExchangeEfficiency = Math.sqrt(safeBatteryRoundTrip);
  const usableBatteryKwh = Math.max(0, batteryKwh * Math.min(1, Math.max(0, depthOfDischarge / 100)) * Math.min(1, Math.max(0, inverterEfficiency / 100)) * safeBatteryRoundTrip * batteryAgeRetention);
  const potentialSolarKwh = Math.max(0, (arrayWp / 1000) * peakSunHours * Math.max(0, retainedPvFactor));
  const solarShape = Array.from({ length: 24 }, (_, hour) => hour >= 6 && hour < 18 ? Math.sin(((hour - 5.5) / 12) * Math.PI) : 0);
  const solarShapeTotal = solarShape.reduce((total, value) => total + value, 0) || 1;
  let batterySocKwh = usableBatteryKwh;
  let minimumBatterySocKwh = usableBatteryKwh;
  let directSolarKwh = 0;
  let solarCurtailmentKwh = 0;
  let generatorSupportKwh = 0;
  let gridSupportKwh = 0;
  let unservedKwh = 0;
  const hourly = Array.from({ length: 24 }, (_, hour) => {
    const isDaytime = hour >= 6 && hour < 18;
    const loadKwh = isDaytime ? dayEnergy / 12 : nightEnergy / 12;
    const solarKwh = (solarShape[hour] / solarShapeTotal) * potentialSolarKwh;
    const solarToLoadKwh = Math.min(loadKwh, solarKwh);
    directSolarKwh += solarToLoadKwh;
    const solarExcessKwh = Math.max(0, solarKwh - solarToLoadKwh);
    const storedKwh = Math.min(Math.max(0, usableBatteryKwh - batterySocKwh), solarExcessKwh * batteryExchangeEfficiency);
    batterySocKwh += storedKwh;
    solarCurtailmentKwh += Math.max(0, solarExcessKwh - storedKwh / batteryExchangeEfficiency);
    const remainingLoadKwh = Math.max(0, loadKwh - solarToLoadKwh);
    const batteryWithdrawnKwh = Math.min(batterySocKwh, remainingLoadKwh / batteryExchangeEfficiency);
    const batteryDeliveredKwh = batteryWithdrawnKwh * batteryExchangeEfficiency;
    batterySocKwh -= batteryWithdrawnKwh;
    minimumBatterySocKwh = Math.min(minimumBatterySocKwh, batterySocKwh);
    const remainingAfterBatteryKwh = Math.max(0, remainingLoadKwh - batteryDeliveredKwh);
    if (backupScenarioId === "generator") generatorSupportKwh += remainingAfterBatteryKwh;
    else if (backupScenarioId === "grid") gridSupportKwh += remainingAfterBatteryKwh;
    else unservedKwh += remainingAfterBatteryKwh;
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      load: Number(loadKwh.toFixed(3)),
      solar: Number(solarKwh.toFixed(3)),
      batterySoc: Number(batterySocKwh.toFixed(3)),
      backup: Number(remainingAfterBatteryKwh.toFixed(3)),
    };
  });
  return {
    hourly,
    usableBatteryKwh,
    potentialSolarKwh,
    directSolarKwh,
    solarCurtailmentKwh,
    generatorSupportKwh,
    gridSupportKwh,
    unservedKwh,
    minimumBatterySocKwh,
    minimumBatterySocPercent: usableBatteryKwh > 0 ? (minimumBatterySocKwh / usableBatteryKwh) * 100 : 0,
  };
};

const getSimulationSupportKwh = (simulation: ReturnType<typeof runEnergySimulation>, backupScenarioId: BackupScenarioId) => backupScenarioId === "generator" ? simulation.generatorSupportKwh : backupScenarioId === "grid" ? simulation.gridSupportKwh : simulation.unservedKwh;

function InputCell({ value, onChange, min = 0, max, step = 1, ariaLabel }: { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; ariaLabel: string }) {
  return <input aria-label={ariaLabel} type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full min-w-[72px] border-b border-[#C9D6D8] bg-transparent px-1.5 py-2 text-right text-sm font-bold text-[#082C67] outline-none transition-colors focus:border-[#58A90E]" />;
}

export default function SolarDesignCalculator({ onBoqEnquiry }: SolarDesignCalculatorProps) {
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [customerName, setCustomerName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [latitude, setLatitude] = useState(6.5244);
  const [longitude, setLongitude] = useState(3.3792);
  const [peakSunHours, setPeakSunHours] = useState(4.5);
  const [monthlySolarResource, setMonthlySolarResource] = useState<MonthlySolarResource[]>([]);
  const [rainySeasonResource, setRainySeasonResource] = useState<RainySeasonResourceScenario[]>([]);
  const [rainySeasonResourceCoordinate, setRainySeasonResourceCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [historicalRainyResource, setHistoricalRainyResource] = useState<HistoricalRainyResource | null>(null);
  const [rainyMonthMode, setRainyMonthMode] = useState<"automatic" | "custom">("automatic");
  const [customRainyMonths, setCustomRainyMonths] = useState<number[]>([5, 6, 7, 8, 9]);
  const [solarResourceScenario, setSolarResourceScenario] = useState("annual");
  const [storedResourceScenario, setStoredResourceScenario] = useState<StoredResourceScenarioPreference | null>(null);
  const [shouldRestoreStoredResourceScenario, setShouldRestoreStoredResourceScenario] = useState(false);
  const [resourceScenarioSearch, setResourceScenarioSearch] = useState("");
  const [resourcePresetName, setResourcePresetName] = useState("");
  const [resourcePresets, setResourcePresets] = useState<ResourcePreset[]>([]);
  const [resourcePresetNote, setResourcePresetNote] = useState("Resource presets stay in this browser.");
  const [batteryAgeYears, setBatteryAgeYears] = useState(0);
  const [batteryAnnualDegradation, setBatteryAnnualDegradation] = useState(2);
  const [lifecycleCurrency, setLifecycleCurrency] = useState("NGN");
  const [batteryReplacementCost, setBatteryReplacementCost] = useState(0);
  const [batteryReplacementEscalation, setBatteryReplacementEscalation] = useState(6);
  const [batteryReplacementIntervalYears, setBatteryReplacementIntervalYears] = useState(8);
  const [batteryReplacementForecastYears, setBatteryReplacementForecastYears] = useState(20);
  const [insolationNote, setInsolationNote] = useState("Editable planning input; set a location or lookup the NASA POWER daily average.");
  const [insolationLoading, setInsolationLoading] = useState(false);
  const [rainySeasonLoading, setRainySeasonLoading] = useState(false);
  const [rainySeasonNote, setRainySeasonNote] = useState("Load the last 10 complete years of NASA POWER daily irradiance to add conservative, historical low-resource season scenarios.");
  const [loads, setLoads] = useState<LoadRow[]>(initialLoads);
  const [temperatureLoss, setTemperatureLoss] = useState(8);
  const [soilingLoss, setSoilingLoss] = useState(4);
  const [shadingLoss, setShadingLoss] = useState(5);
  const [mismatchLoss, setMismatchLoss] = useState(2);
  const [dcCableLoss, setDcCableLoss] = useState(3);
  const [mpptEfficiency, setMpptEfficiency] = useState(98);
  const [inverterEfficiency, setInverterEfficiency] = useState(92);
  const [acCableLoss, setAcCableLoss] = useState(2);
  const [batteryRoundTrip, setBatteryRoundTrip] = useState(94);
  const [depthOfDischarge, setDepthOfDischarge] = useState(80);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [backupScenarioId, setBackupScenarioId] = useState<BackupScenarioId>("solar-only");
  const [gridTariff, setGridTariff] = useState(48.53);
  const [gridCurrency, setGridCurrency] = useState("NGN");
  const [gridOutageHours, setGridOutageHours] = useState(6);
  const [generatorPowerFactor, setGeneratorPowerFactor] = useState(0.8);
  const [generatorLoadingTarget, setGeneratorLoadingTarget] = useState(80);
  const [arrayMargin, setArrayMargin] = useState(15);
  const [inverterHeadroom, setInverterHeadroom] = useState(25);
  const [moduleWattage, setModuleWattage] = useState(550);
  const [inverterBrand, setInverterBrand] = useState(inverterBrandOptions[0]);
  const [batteryBrand, setBatteryBrand] = useState(batteryBrandOptions[0]);
  const [telecomNPlusOne, setTelecomNPlusOne] = useState(false);
  const [tenantCount, setTenantCount] = useState(1);
  const [dcBusVoltage, setDcBusVoltage] = useState("−48 V DC");
  const [rectifierModuleWatts, setRectifierModuleWatts] = useState(3000);
  const [rectifierModuleNPlusOne, setRectifierModuleNPlusOne] = useState(false);
  const [boqCoverType, setBoqCoverType] = useState<BoqCoverType>("standard");
  const [towerReference, setTowerReference] = useState("");
  const [towerOperationalContext, setTowerOperationalContext] = useState("Telecom tower site");
  const [wizardAudience, setWizardAudience] = useState<GuidedLoadProfile["audience"]>("home");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCategory, setCatalogueCategory] = useState("All");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customApplianceProfiles, setCustomApplianceProfiles] = useState<AppliancePreset[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [comparisonScenarioIds, setComparisonScenarioIds] = useState<string[]>([]);
  const [scenarioNote, setScenarioNote] = useState("Scenarios are saved only in this browser.");
  const [firstRowHovered, setFirstRowHovered] = useState(false);
  const [firstRowExplanationPinned, setFirstRowExplanationPinned] = useState(false);
  const [mobileFieldGuideOpen, setMobileFieldGuideOpen] = useState(false);
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");
  const scheduleScrollRef = useRef<HTMLDivElement>(null);
  const [scheduleScrollLeft, setScheduleScrollLeft] = useState(0);
  const [scheduleScrollMax, setScheduleScrollMax] = useState(0);
  const geocodeMapRef = useRef<google.maps.Map | null>(null);
  const [geocodeReady, setGeocodeReady] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeNote, setGeocodeNote] = useState("Use the project location to load approximate editable coordinates before requesting solar-resource data.");

  useEffect(() => {
    setLoads((current) => current.map((row) => {
      const legacyRow = row as LoadRow & { hours?: number; surgeFactor?: number; surgeDurationSec?: number; circuitName?: string };
      const hasDayNightSchedule = Number.isFinite(legacyRow.dayHours) && Number.isFinite(legacyRow.nightHours);
      const hasCircuitName = Boolean(legacyRow.circuitName?.trim());
      if (hasDayNightSchedule && Number.isFinite(legacyRow.surgeFactor) && Number.isFinite(legacyRow.surgeDurationSec) && hasCircuitName) return row;
      return {
        ...row,
        dayHours: hasDayNightSchedule ? Number(legacyRow.dayHours) : (Number.isFinite(legacyRow.hours) ? Number(legacyRow.hours) : 0),
        nightHours: hasDayNightSchedule ? Number(legacyRow.nightHours) : 0,
        circuitName: legacyRow.circuitName?.trim() || `${row.item || "Load"} circuit`,
        surgeFactor: Number.isFinite(legacyRow.surgeFactor) ? Number(legacyRow.surgeFactor) : 1.2,
        surgeDurationSec: Number.isFinite(legacyRow.surgeDurationSec) ? Number(legacyRow.surgeDurationSec) : 1,
      };
    }));
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(scenarioStorageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as SavedScenario[];
      if (Array.isArray(parsed)) setSavedScenarios(parsed.filter((scenario) => scenario?.id && scenario?.outputs).slice(0, 6));
    } catch {
      setScenarioNote("Saved scenarios could not be restored in this browser. You can still save new scenarios.");
    }
  }, []);

  useEffect(() => {
    try {
      const storedCategories = JSON.parse(window.localStorage.getItem(customCategoryStorageKey) ?? "[]");
      const storedProfiles = JSON.parse(window.localStorage.getItem(customApplianceStorageKey) ?? "[]");
      if (Array.isArray(storedCategories)) setCustomCategories(storedCategories.filter((category): category is string => typeof category === "string" && category.trim().length > 0).slice(0, 12));
      if (Array.isArray(storedProfiles)) setCustomApplianceProfiles(storedProfiles.filter((profile): profile is AppliancePreset => Boolean(profile?.id && profile?.item && profile?.category)).slice(0, 30));
    } catch {
      setScenarioNote("Your custom appliance library could not be restored in this browser. You can still add new local profiles.");
    }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(resourceScenarioStorageKey) ?? "null") as StoredResourceScenarioPreference | null;
      if (!stored?.id || typeof stored.id !== "string") return;
      setStoredResourceScenario(stored);
      setShouldRestoreStoredResourceScenario(true);
      if (stored.rainyMonthMode === "custom") setRainyMonthMode("custom");
      const savedMonths = normaliseRainyMonthSelection(stored.customRainyMonths ?? []);
      if (savedMonths.length > 0) setCustomRainyMonths(savedMonths);
    } catch {
      // A malformed local preference must never block the annual default.
    }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(resourcePresetStorageKey) ?? "[]") as ResourcePreset[];
      if (!Array.isArray(stored)) return;
      setResourcePresets(stored.filter((preset): preset is ResourcePreset => Boolean(preset?.id && preset?.name?.trim() && preset?.preference?.id)).slice(0, 8));
    } catch {
      setResourcePresetNote("Saved resource presets could not be restored in this browser. You can still save new presets.");
    }
  }, []);

  useEffect(() => {
    if (!historicalRainyResource) return;
    const scenarios = deriveRainySeasonScenarios(historicalRainyResource, rainyMonthMode, customRainyMonths);
    if (!scenarios) {
      setRainySeasonResource([]);
      setRainySeasonNote("Select at least one custom rainy month, then record the historical scenarios again.");
      return;
    }
    setRainySeasonResource(scenarios);
    setRainySeasonResourceCoordinate({ latitude: historicalRainyResource.latitude, longitude: historicalRainyResource.longitude });
    const selectedProbability = solarResourceScenario.match(/p(50|80|90)$/i)?.[0]?.toUpperCase();
    if (solarResourceScenario.startsWith("rainy-")) setSolarResourceScenario(scenarios.find((scenario) => scenario.probability === selectedProbability)?.id ?? scenarios[0].id);
    const modeDescription = rainyMonthMode === "custom" ? "Custom rainy window ready" : "Automatic rainy-season proxy ready";
    setRainySeasonNote(`${modeDescription}: ${scenarios[0].periodLabel} · ${scenarios[0].recordWindow} · ${scenarios[0].observationCount} valid daily observations. P50/P80/P90 are historical daily-resource planning cases, not weather forecasts.`);
  }, [historicalRainyResource, rainyMonthMode, customRainyMonths]);

  const telecomRedundancyRows = useMemo(() => loads.filter(isTelecomRedundancyEligible), [loads]);
  const redundancyReserveCount = telecomNPlusOne ? telecomRedundancyRows.length : 0;
  const operatingQuantity = (row: LoadRow) => Math.max(0, row.quantity) * (isTenantScalableRadioLoad(row) ? Math.max(1, Math.round(tenantCount || 1)) : 1);
  const effectiveQuantity = (row: LoadRow) => operatingQuantity(row) + (telecomNPlusOne && isTelecomRedundancyEligible(row) ? 1 : 0);
  const rectifierModuleDemandWatts = useMemo(() => loads.filter((row) => row.category === "Telecoms" && row.item !== "Telecom DC rectifier").reduce((total, row) => total + Math.max(0, row.watts) * effectiveQuantity(row) * (Math.min(100, Math.max(0, row.utilisation)) / 100), 0), [loads, telecomNPlusOne, tenantCount]);
  const rectifierOperatingModules = rectifierModuleWatts > 0 && rectifierModuleDemandWatts > 0 ? Math.ceil(rectifierModuleDemandWatts / rectifierModuleWatts) : 0;
  const rectifierRecommendedModules = rectifierOperatingModules + (rectifierModuleNPlusOne && rectifierOperatingModules > 0 ? 1 : 0);

  const totals = useMemo(() => {
    const dayEnergy = loads.reduce((total, row) => total + Math.max(0, row.watts) * effectiveQuantity(row) * Math.max(0, row.dayHours) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000, 0);
    const nightEnergy = loads.reduce((total, row) => total + Math.max(0, row.watts) * effectiveQuantity(row) * Math.max(0, row.nightHours) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000, 0);
    const dailyEnergy = dayEnergy + nightEnergy;
    const dayPeak = loads.reduce((total, row) => total + (row.dayHours > 0 ? Math.max(0, row.watts) * effectiveQuantity(row) * (Math.min(100, Math.max(0, row.simultaneous)) / 100) : 0), 0);
    const nightPeak = loads.reduce((total, row) => total + (row.nightHours > 0 ? Math.max(0, row.watts) * effectiveQuantity(row) * (Math.min(100, Math.max(0, row.simultaneous)) / 100) : 0), 0);
    const simultaneousPeak = Math.max(dayPeak, nightPeak);
    const surgePeakWatts = loads.reduce((total, row) => total + (row.dayHours > 0 || row.nightHours > 0 ? Math.max(0, row.watts) * effectiveQuantity(row) * (Math.min(100, Math.max(0, row.simultaneous)) / 100) * ([1.2, 2, 3].includes(row.surgeFactor) ? row.surgeFactor : 1.2) : 0), 0);
    const governingSurgeDurationSec = loads.reduce((longest, row) => row.dayHours > 0 || row.nightHours > 0 ? Math.max(longest, Math.max(0, row.surgeDurationSec || 0)) : longest, 0);
    const retainedPvFactor =
      (1 - Math.min(100, Math.max(0, temperatureLoss)) / 100) *
      (1 - Math.min(100, Math.max(0, soilingLoss)) / 100) *
      (1 - Math.min(100, Math.max(0, shadingLoss)) / 100) *
      (1 - Math.min(100, Math.max(0, mismatchLoss)) / 100) *
      (1 - Math.min(100, Math.max(0, dcCableLoss)) / 100) *
      (Math.min(100, Math.max(0, mpptEfficiency)) / 100) *
      (Math.min(100, Math.max(0, inverterEfficiency)) / 100) *
      (1 - Math.min(100, Math.max(0, acCableLoss)) / 100) *
      (Math.min(100, Math.max(0, batteryRoundTrip)) / 100);
    const arrayWp = peakSunHours > 0 && retainedPvFactor > 0 ? (dailyEnergy / peakSunHours / retainedPvFactor) * (1 + Math.max(0, arrayMargin) / 100) * 1000 : 0;
    const inverterKw = surgePeakWatts > 0 ? (surgePeakWatts / 1000) * (1 + Math.max(0, inverterHeadroom) / 100) : 0;
    const batteryKwh = depthOfDischarge > 0 && inverterEfficiency > 0 && batteryRoundTrip > 0 ? (nightEnergy * Math.max(0, autonomyDays)) / ((Math.min(100, depthOfDischarge) / 100) * (Math.min(100, inverterEfficiency) / 100) * (Math.min(100, batteryRoundTrip) / 100)) : 0;
    return { dailyEnergy, dayEnergy, nightEnergy, dayPeak, nightPeak, simultaneousPeak, surgePeakWatts, governingSurgeDurationSec, retainedPvFactor, arrayWp, inverterKw, batteryKwh, moduleCount: moduleWattage > 0 ? Math.ceil(arrayWp / moduleWattage) : 0 };
  }, [loads, telecomNPlusOne, temperatureLoss, soilingLoss, shadingLoss, mismatchLoss, dcCableLoss, mpptEfficiency, inverterEfficiency, acCableLoss, batteryRoundTrip, depthOfDischarge, autonomyDays, arrayMargin, inverterHeadroom, peakSunHours, moduleWattage]);

  const loadEnergyBreakdown = useMemo(() => loads.map((row, index) => ({
    id: row.id,
    name: row.item || `Load ${index + 1}`,
    value: Math.max(0, row.watts) * effectiveQuantity(row) * (Math.max(0, row.dayHours) + Math.max(0, row.nightHours)) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000,
    color: loadChartColors[index % loadChartColors.length],
  })).filter((item) => item.value > 0), [loads, telecomNPlusOne]);

  const dayNightEnergyBreakdown = useMemo(() => loads.map((row, index) => ({
    name: row.item || `Load ${index + 1}`,
    daytime: Math.max(0, row.watts) * effectiveQuantity(row) * Math.max(0, row.dayHours) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000,
    nighttime: Math.max(0, row.watts) * effectiveQuantity(row) * Math.max(0, row.nightHours) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000,
  })).filter((item) => item.daytime > 0 || item.nighttime > 0), [loads, telecomNPlusOne]);

  const rainySeasonResourceIsCurrent = Boolean(rainySeasonResourceCoordinate && Math.abs(rainySeasonResourceCoordinate.latitude - latitude) < 0.00005 && Math.abs(rainySeasonResourceCoordinate.longitude - longitude) < 0.00005);
  const storedResourceScenarioIsCurrent = Boolean(storedResourceScenario && (storedResourceScenario.id === "annual" || (typeof storedResourceScenario.latitude === "number" && typeof storedResourceScenario.longitude === "number" && Math.abs(storedResourceScenario.latitude - latitude) < 0.00005 && Math.abs(storedResourceScenario.longitude - longitude) < 0.00005)));
  const resourceScenarioOptions = useMemo(() => {
    const options: MonthlySolarResource[] = [{ id: "annual", label: "Annual average / current input", psh: peakSunHours }];
    if (monthlySolarResource.length === 12) {
      const average = (items: MonthlySolarResource[]) => items.reduce((sum, item) => sum + item.psh, 0) / items.length;
      const janJun = monthlySolarResource.slice(0, 6);
      const julDec = monthlySolarResource.slice(6, 12);
      options.push(
        { id: "jan-jun", label: "Jan–Jun seasonal average", psh: average(janJun) },
        { id: "jul-dec", label: "Jul–Dec seasonal average", psh: average(julDec) },
        ...monthlySolarResource,
      );
    }
    const sourceOptions = [...options, ...(rainySeasonResourceIsCurrent ? rainySeasonResource : [])];
    const cachedScenario = storedResourceScenarioIsCurrent ? (storedResourceScenario?.rainyScenario ?? storedResourceScenario?.scenario) : undefined;
    return cachedScenario && !sourceOptions.some((option) => option.id === cachedScenario.id) ? [...sourceOptions, cachedScenario] : sourceOptions;
  }, [monthlySolarResource, peakSunHours, rainySeasonResource, rainySeasonResourceIsCurrent, storedResourceScenario, storedResourceScenarioIsCurrent]);

  const activeResourceScenario = resourceScenarioOptions.find((option) => option.id === solarResourceScenario) ?? resourceScenarioOptions[0];
  const activeRainySeasonScenario = rainySeasonResource.find((option) => option.id === activeResourceScenario?.id) ?? (storedResourceScenarioIsCurrent && storedResourceScenario?.rainyScenario?.id === activeResourceScenario?.id ? storedResourceScenario.rainyScenario : undefined);
  const filteredResourceScenarioOptions = useMemo(() => {
    const query = resourceScenarioSearch.trim().toLowerCase();
    if (!query) return resourceScenarioOptions;
    return resourceScenarioOptions.filter((option) => `${option.label} ${number(option.psh, 2)} PSH`.toLowerCase().includes(query));
  }, [resourceScenarioOptions, resourceScenarioSearch]);
  useEffect(() => {
    if (!shouldRestoreStoredResourceScenario || !storedResourceScenario || !resourceScenarioOptions.some((option) => option.id === storedResourceScenario.id)) return;
    setSolarResourceScenario(storedResourceScenario.id);
    setShouldRestoreStoredResourceScenario(false);
  }, [resourceScenarioOptions, shouldRestoreStoredResourceScenario, storedResourceScenario]);
  const buildResourcePreference = (scenarioId: string): StoredResourceScenarioPreference => {
    const scenario = resourceScenarioOptions.find((option) => option.id === scenarioId);
    const rainyScenario = rainySeasonResource.find((option) => option.id === scenarioId);
    return {
      id: scenarioId,
      rainyMonthMode,
      customRainyMonths: normaliseRainyMonthSelection(customRainyMonths),
      scenario: scenarioId === "annual" ? undefined : scenario,
      rainyScenario,
      latitude: scenarioId === "annual" ? undefined : latitude,
      longitude: scenarioId === "annual" ? undefined : longitude,
    };
  };
  const selectSolarResourceScenario = (scenarioId: string) => {
    setSolarResourceScenario(scenarioId);
    setShouldRestoreStoredResourceScenario(false);
    const preference = buildResourcePreference(scenarioId);
    setStoredResourceScenario(preference);
    try {
      window.localStorage.setItem(resourceScenarioStorageKey, JSON.stringify(preference));
    } catch {
      // The active selection still works if browser storage is unavailable.
    }
  };
  const clearResourceScenarioPreference = () => {
    setStoredResourceScenario(null);
    setShouldRestoreStoredResourceScenario(false);
    setSolarResourceScenario("annual");
    setResourceScenarioSearch("");
    try {
      window.localStorage.removeItem(resourceScenarioStorageKey);
      setResourcePresetNote("Remembered resource selection cleared. The simulation is using the annual input.");
    } catch {
      setResourcePresetNote("The remembered selection could not be cleared in this browser, but the simulation is using the annual input.");
    }
  };
  const persistResourcePresets = (presets: ResourcePreset[]) => {
    setResourcePresets(presets);
    try {
      window.localStorage.setItem(resourcePresetStorageKey, JSON.stringify(presets));
    } catch {
      setResourcePresetNote("Your browser could not save resource presets. Keep this tab open or check browser storage settings.");
    }
  };
  const saveCurrentResourcePreset = () => {
    const name = resourcePresetName.trim().replace(/\s+/g, " ") || `${activeResourceScenario.label} resource`;
    const preference = buildResourcePreference(solarResourceScenario);
    const preset: ResourcePreset = { id: `resource-preset-${Date.now()}`, name, savedAt: new Date().toISOString(), preference, peakSunHours: Math.max(0, peakSunHours) };
    const next = [...resourcePresets, preset].slice(-8);
    persistResourcePresets(next);
    setResourcePresetName("");
    setResourcePresetNote(`Saved “${name}” in this browser.`);
  };
  const applyResourcePreset = (preset: ResourcePreset) => {
    const preference = preset.preference;
    const coordinatesMatch = preference.id === "annual" || (typeof preference.latitude === "number" && typeof preference.longitude === "number" && Math.abs(preference.latitude - latitude) < 0.00005 && Math.abs(preference.longitude - longitude) < 0.00005);
    setPeakSunHours(Math.max(0, preset.peakSunHours || peakSunHours));
    setRainyMonthMode(preference.rainyMonthMode === "custom" ? "custom" : "automatic");
    const savedMonths = normaliseRainyMonthSelection(preference.customRainyMonths ?? []);
    if (savedMonths.length > 0) setCustomRainyMonths(savedMonths);
    setStoredResourceScenario(preference);
    setShouldRestoreStoredResourceScenario(coordinatesMatch);
    if (coordinatesMatch) {
      setSolarResourceScenario(preference.id);
      try { window.localStorage.setItem(resourceScenarioStorageKey, JSON.stringify(preference)); } catch { /* The active selection still works without storage. */ }
      setResourcePresetNote(`Applied “${preset.name}”.`);
    } else {
      setSolarResourceScenario("annual");
      setResourcePresetNote(`Applied “${preset.name}” settings. Its historical resource case needs matching coordinates, so the simulation is using the annual input.`);
    }
  };
  const removeResourcePreset = (id: string) => {
    const next = resourcePresets.filter((preset) => preset.id !== id);
    persistResourcePresets(next);
    setResourcePresetNote("Resource preset removed from this browser.");
  };
  const simulationPeakSunHours = Math.max(0, activeResourceScenario?.psh ?? peakSunHours);
  const safeBatteryAnnualDegradation = Math.min(10, Math.max(0, batteryAnnualDegradation || 0));
  const safeBatteryAgeYears = Math.min(20, Math.max(0, batteryAgeYears || 0));
  const batteryAgeRetention = Math.pow(1 - safeBatteryAnnualDegradation / 100, safeBatteryAgeYears);
  const batteryAgeingCurve = useMemo(() => {
    const initialUsableReserve = Math.max(0, totals.batteryKwh * Math.min(1, Math.max(0, depthOfDischarge / 100)) * Math.min(1, Math.max(0, inverterEfficiency / 100)) * Math.min(1, Math.max(0, batteryRoundTrip / 100)));
    return Array.from({ length: 21 }, (_, year) => ({
      year: `Y${year}`,
      usableReserve: Number((initialUsableReserve * Math.pow(1 - safeBatteryAnnualDegradation / 100, year)).toFixed(3)),
    }));
  }, [totals.batteryKwh, depthOfDischarge, inverterEfficiency, batteryRoundTrip, safeBatteryAnnualDegradation]);
  const safeLifecycleCurrency = lifecycleCurrency.trim().toUpperCase() || "NGN";
  const safeBatteryReplacementCost = Math.max(0, batteryReplacementCost || 0);
  const safeBatteryReplacementEscalation = Math.min(30, Math.max(0, batteryReplacementEscalation || 0));
  const safeBatteryReplacementIntervalYears = Math.min(20, Math.max(1, Math.round(batteryReplacementIntervalYears || 1)));
  const safeBatteryReplacementForecastYears = Math.min(25, Math.max(1, Math.round(batteryReplacementForecastYears || 1)));
  const batteryReplacementForecast = useMemo<BatteryReplacementForecast[]>(() => Array.from({ length: safeBatteryReplacementForecastYears }, (_, index) => {
    const year = index + 1;
    const futureCost = safeBatteryReplacementCost * Math.pow(1 + safeBatteryReplacementEscalation / 100, year);
    const isScheduledReplacement = year % safeBatteryReplacementIntervalYears === 0;
    return { year, futureCost, replacementEventCost: isScheduledReplacement ? futureCost : 0, isScheduledReplacement };
  }), [safeBatteryReplacementCost, safeBatteryReplacementEscalation, safeBatteryReplacementForecastYears, safeBatteryReplacementIntervalYears]);
  const scheduledBatteryReplacements = batteryReplacementForecast.filter((entry) => entry.isScheduledReplacement);
  const lifecycleReplacementProvision = scheduledBatteryReplacements.reduce((sum, entry) => sum + entry.replacementEventCost, 0);
  const firstScheduledBatteryReplacement = scheduledBatteryReplacements[0];

  const simulationInputs = useMemo(() => ({ dayEnergy: totals.dayEnergy, nightEnergy: totals.nightEnergy, arrayWp: totals.arrayWp, batteryKwh: totals.batteryKwh, retainedPvFactor: totals.retainedPvFactor, batteryRoundTrip, depthOfDischarge, inverterEfficiency, batteryAgeRetention, backupScenarioId }), [totals.dayEnergy, totals.nightEnergy, totals.arrayWp, totals.batteryKwh, totals.retainedPvFactor, batteryRoundTrip, depthOfDischarge, inverterEfficiency, batteryAgeRetention, backupScenarioId]);
  const energySimulation = useMemo(() => runEnergySimulation({ ...simulationInputs, peakSunHours: simulationPeakSunHours }), [simulationInputs, simulationPeakSunHours]);
  const probabilityScenarioComparison = useMemo(() => ["P50", "P80", "P90"].map((probability) => rainySeasonResource.find((scenario) => scenario.probability === probability)).filter((scenario): scenario is RainySeasonResourceScenario => Boolean(scenario)).map((scenario) => ({ scenario, simulation: runEnergySimulation({ ...simulationInputs, peakSunHours: scenario.psh }) })), [rainySeasonResource, simulationInputs]);

  const searchableApplianceCatalogue = useMemo(() => [...applianceCatalogue, ...customApplianceProfiles], [customApplianceProfiles]);
  const applianceCategories = useMemo(() => {
    const categories = new Set([
      ...baseApplianceCategories.filter((category) => category !== "All" && category !== "Custom"),
      ...customCategories,
      ...customApplianceProfiles.map((profile) => profile.category),
    ]);
    return ["All", "Custom", ...Array.from(categories)];
  }, [customCategories, customApplianceProfiles]);
  const filteredApplianceCatalogue = useMemo(() => {
    const search = catalogueSearch.trim().toLowerCase();
    return searchableApplianceCatalogue.filter((preset) => {
      const matchesCategory = catalogueCategory === "All" || preset.category === catalogueCategory;
      const matchesSearch = !search || `${preset.label} ${preset.item} ${preset.category}`.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [catalogueCategory, catalogueSearch, searchableApplianceCatalogue]);

  const selectedComparisonScenarios = useMemo(() => comparisonScenarioIds.map((id) => savedScenarios.find((scenario) => scenario.id === id)).filter((scenario): scenario is SavedScenario => Boolean(scenario)), [comparisonScenarioIds, savedScenarios]);

  const comparisonMetrics = [
    ["Daily energy", "kWh/day", (scenario: SavedScenario) => number(scenario.outputs.dailyEnergy, 2)],
    ["Daytime solar", "kWh/day", (scenario: SavedScenario) => number(scenario.outputs.dayEnergy, 2)],
    ["Night battery", "kWh/night", (scenario: SavedScenario) => number(scenario.outputs.nightEnergy, 2)],
    ["Combined surge", "W", (scenario: SavedScenario) => number(scenario.outputs.surgePeakWatts)],
    ["PV array", "kWp", (scenario: SavedScenario) => number(scenario.outputs.arrayWp / 1000, 2)],
    ["Inverter", "kW", (scenario: SavedScenario) => number(scenario.outputs.inverterKw, 2)],
    ["Lithium battery", "kWh", (scenario: SavedScenario) => number(scenario.outputs.batteryKwh, 2)],
  ] as const;

  const duplicateLoads = useMemo(() => {
    const groups = new Map<string, string[]>();
    loads.forEach((row, index) => {
      const normalized = row.item.trim().toLowerCase();
      if (!normalized || normalized === "custom load") return;
      groups.set(normalized, [...(groups.get(normalized) ?? []), row.item || `Load ${index + 1}`]);
    });
    return Array.from(groups.values()).filter((entries) => entries.length > 1).map((entries) => ({ label: entries[0], count: entries.length }));
  }, [loads]);

  const loadWarnings = useMemo(() => [
    ...loads.flatMap((row, index) => getLoadWarnings(row).map((message) => ({ id: `${row.id}-${message}`, load: row.item || `Load ${index + 1}`, message }))),
    ...duplicateLoads.map((duplicate) => ({ id: `duplicate-${duplicate.label}`, load: duplicate.label, message: `This appliance appears in ${duplicate.count} separate rows. Keep them only when they represent distinct circuits; otherwise combine the quantities.` })),
  ], [loads, duplicateLoads]);

  const syncScheduleMetrics = () => {
    const schedule = scheduleScrollRef.current;
    if (!schedule) return;
    const max = Math.max(0, schedule.scrollWidth - schedule.clientWidth);
    setScheduleScrollMax(max);
    setScheduleScrollLeft(Math.min(schedule.scrollLeft, max));
  };

  useEffect(() => {
    const schedule = scheduleScrollRef.current;
    if (!schedule) return;
    syncScheduleMetrics();
    const observer = new ResizeObserver(syncScheduleMetrics);
    observer.observe(schedule);
    window.addEventListener("resize", syncScheduleMetrics);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncScheduleMetrics);
    };
  }, [loads.length]);

  const updateLoad = (id: string, key: keyof Omit<LoadRow, "id">, value: string | number) => setLoads((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
  const addLoad = () => setLoads((current) => [...current, { id: `load-${Date.now()}`, item: "Custom load", circuitName: "New load circuit", category: "Custom", notes: "", watts: 0, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 }]);
  const addApplianceFromCatalogue = (preset: AppliancePreset) => setLoads((current) => [...current, { id: `catalogue-${preset.id}-${Date.now()}`, item: preset.item, circuitName: `${preset.item} circuit`, category: preset.category, notes: preset.notes ?? "", watts: preset.watts, quantity: preset.quantity, dayHours: preset.dayHours, nightHours: preset.nightHours, utilisation: preset.utilisation, simultaneous: preset.simultaneous, surgeFactor: preset.surgeFactor, surgeDurationSec: preset.surgeDurationSec }]);
  const duplicateLoad = (id: string) => setLoads((current) => {
    const source = current.find((row) => row.id === id);
    return source ? [...current, { ...source, id: `duplicate-${source.id}-${Date.now()}`, circuitName: `${source.circuitName || source.item || "Load"} copy` }] : current;
  });
  const removeLoad = (id: string) => setLoads((current) => current.filter((row) => row.id !== id));
  const resetLoadsToDefaults = () => {
    setLoads(initialLoads.map((row) => ({ ...row })));
    setFirstRowHovered(false);
    setFirstRowExplanationPinned(false);
    window.requestAnimationFrame(() => {
      if (scheduleScrollRef.current) scheduleScrollRef.current.scrollLeft = 0;
      setScheduleScrollLeft(0);
    });
  };
  const applyGuidedLoadProfile = (profile: GuidedLoadProfile) => {
    const seed = Date.now();
    setLoads(profile.loads.map((row, index) => ({ ...row, category: applianceCatalogue.find((preset) => preset.item === row.item)?.category ?? "Custom", notes: "", circuitName: row.circuitName?.trim() || `${row.item} circuit`, id: `${profile.id}-${seed}-${index}` })));
    if (profile.id === "multi-tenant-tower") {
      setTenantCount(3);
      setBoqCoverType("tower-site");
      setTowerOperationalContext("Multi-tenant telecom tower site");
    }
    setFirstRowHovered(false);
    setFirstRowExplanationPinned(false);
    window.requestAnimationFrame(() => {
      if (scheduleScrollRef.current) scheduleScrollRef.current.scrollLeft = 0;
      setScheduleScrollLeft(0);
    });
  };
  const persistScenarios = (scenarios: SavedScenario[]) => {
    setSavedScenarios(scenarios);
    try {
      window.localStorage.setItem(scenarioStorageKey, JSON.stringify(scenarios));
    } catch {
      setScenarioNote("Your browser could not save scenarios. Keep this tab open or try a different browser setting.");
    }
  };
  const persistCustomCategories = (categories: string[]) => {
    setCustomCategories(categories);
    try { window.localStorage.setItem(customCategoryStorageKey, JSON.stringify(categories)); } catch { setScenarioNote("Your browser could not save custom appliance categories."); }
  };
  const persistCustomApplianceProfiles = (profiles: AppliancePreset[]) => {
    setCustomApplianceProfiles(profiles);
    try { window.localStorage.setItem(customApplianceStorageKey, JSON.stringify(profiles)); } catch { setScenarioNote("Your browser could not save custom appliance profiles."); }
  };
  const addCustomCategory = () => {
    const category = customCategoryName.trim().replace(/\s+/g, " ");
    if (!category) return;
    if (applianceCategories.some((entry) => entry.toLowerCase() === category.toLowerCase())) { setScenarioNote(`“${category}” already exists in your appliance library.`); return; }
    persistCustomCategories([...customCategories, category].slice(0, 12));
    setCatalogueCategory(category);
    setCustomCategoryName("");
    setScenarioNote(`Added “${category}” as a browser-local appliance category.`);
  };
  const removeCustomCategory = (category: string) => {
    persistCustomCategories(customCategories.filter((entry) => entry !== category));
    if (catalogueCategory === category) setCatalogueCategory("All");
  };
  const saveCustomLoadToLibrary = (row: LoadRow) => {
    const item = row.item.trim();
    const category = row.category?.trim() || "Custom";
    if (!item || item.toLowerCase() === "custom load") { setScenarioNote("Name the custom appliance before saving it to your local library."); return; }
    const profile: AppliancePreset = { id: `custom-profile-${Date.now()}`, label: `${item} · ${number(row.watts)} W`, item, category, notes: row.notes?.trim() || "", watts: row.watts, quantity: row.quantity, dayHours: row.dayHours, nightHours: row.nightHours, utilisation: row.utilisation, simultaneous: row.simultaneous, surgeFactor: row.surgeFactor, surgeDurationSec: row.surgeDurationSec };
    persistCustomApplianceProfiles([profile, ...customApplianceProfiles].slice(0, 30));
    if (!applianceCategories.some((entry) => entry.toLowerCase() === category.toLowerCase())) persistCustomCategories([...customCategories, category].slice(0, 12));
    setScenarioNote(`Saved “${item}” to the ${category} category in this browser.`);
  };
  const saveCurrentScenario = () => {
    const name = scenarioName.trim() || `${projectLocation || location || "New"} load scenario`;
    const scenario: SavedScenario = {
      id: `scenario-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      loads: loads.map((row) => ({ ...row })),
      location, customerName, projectLocation, latitude, longitude, peakSunHours,
      temperatureLoss, soilingLoss, shadingLoss, mismatchLoss, dcCableLoss, mpptEfficiency, inverterEfficiency, acCableLoss, batteryRoundTrip, depthOfDischarge,
      autonomyDays, backupScenarioId, gridTariff, gridCurrency, gridOutageHours, generatorPowerFactor, generatorLoadingTarget, arrayMargin, inverterHeadroom, moduleWattage, inverterBrand, batteryBrand, telecomNPlusOne, tenantCount, dcBusVoltage, rectifierModuleWatts, rectifierModuleNPlusOne, boqCoverType, towerReference, towerOperationalContext, solarResourceScenario, rainyMonthMode, customRainyMonths, batteryAgeYears, batteryAnnualDegradation, lifecycleCurrency: safeLifecycleCurrency, batteryReplacementCost: safeBatteryReplacementCost, batteryReplacementEscalation: safeBatteryReplacementEscalation, batteryReplacementIntervalYears: safeBatteryReplacementIntervalYears, batteryReplacementForecastYears: safeBatteryReplacementForecastYears,
      outputs: { dailyEnergy: totals.dailyEnergy, dayEnergy: totals.dayEnergy, nightEnergy: totals.nightEnergy, surgePeakWatts: totals.surgePeakWatts, arrayWp: totals.arrayWp, inverterKw: totals.inverterKw, batteryKwh: totals.batteryKwh },
    };
    const next = [scenario, ...savedScenarios].slice(0, 6);
    persistScenarios(next);
    setComparisonScenarioIds((current) => [scenario.id, ...current.filter((id) => id !== scenario.id)].slice(0, 2));
    setScenarioName("");
    setScenarioNote(`Saved “${name}” in this browser. Choose up to two scenarios to compare.`);
  };
  const restoreScenario = (scenario: SavedScenario) => {
    setLoads(scenario.loads.map((row) => ({ ...row, category: row.category?.trim() || searchableApplianceCatalogue.find((preset) => preset.item === row.item)?.category || "Custom", notes: row.notes ?? "", circuitName: row.circuitName?.trim() || `${row.item || "Load"} circuit`, id: `${row.id}-restore-${Date.now()}` })));
    setLocation(scenario.location); setCustomerName(scenario.customerName); setProjectLocation(scenario.projectLocation); setLatitude(scenario.latitude); setLongitude(scenario.longitude); setPeakSunHours(scenario.peakSunHours);
    setTemperatureLoss(scenario.temperatureLoss); setSoilingLoss(scenario.soilingLoss); setShadingLoss(scenario.shadingLoss); setMismatchLoss(scenario.mismatchLoss); setDcCableLoss(scenario.dcCableLoss); setMpptEfficiency(scenario.mpptEfficiency); setInverterEfficiency(scenario.inverterEfficiency); setAcCableLoss(scenario.acCableLoss); setBatteryRoundTrip(scenario.batteryRoundTrip); setDepthOfDischarge(scenario.depthOfDischarge);
    setAutonomyDays(scenario.autonomyDays); setBackupScenarioId(scenario.backupScenarioId); setGridTariff(scenario.gridTariff); setGridCurrency(scenario.gridCurrency); setGridOutageHours(scenario.gridOutageHours); setGeneratorPowerFactor(scenario.generatorPowerFactor); setGeneratorLoadingTarget(scenario.generatorLoadingTarget); setArrayMargin(scenario.arrayMargin); setInverterHeadroom(scenario.inverterHeadroom); setModuleWattage(scenario.moduleWattage); setInverterBrand(scenario.inverterBrand); setBatteryBrand(scenario.batteryBrand); setTelecomNPlusOne(Boolean(scenario.telecomNPlusOne)); setTenantCount(Math.max(1, Math.round(scenario.tenantCount ?? 1))); setDcBusVoltage(scenario.dcBusVoltage ?? "−48 V DC"); setRectifierModuleWatts(Math.max(1, scenario.rectifierModuleWatts ?? 3000)); setRectifierModuleNPlusOne(Boolean(scenario.rectifierModuleNPlusOne)); setBoqCoverType(scenario.boqCoverType ?? "standard"); setTowerReference(scenario.towerReference ?? ""); setTowerOperationalContext(scenario.towerOperationalContext ?? "Telecom tower site"); setSolarResourceScenario(scenario.solarResourceScenario?.startsWith("rainy-") ? "annual" : scenario.solarResourceScenario ?? "annual"); setRainyMonthMode(scenario.rainyMonthMode === "custom" ? "custom" : "automatic"); setCustomRainyMonths(normaliseRainyMonthSelection(scenario.customRainyMonths ?? [5, 6, 7, 8, 9]).length ? normaliseRainyMonthSelection(scenario.customRainyMonths ?? [5, 6, 7, 8, 9]) : [5, 6, 7, 8, 9]); setBatteryAgeYears(Math.min(20, Math.max(0, scenario.batteryAgeYears ?? 0))); setBatteryAnnualDegradation(Math.min(10, Math.max(0, scenario.batteryAnnualDegradation ?? 2))); setLifecycleCurrency((scenario.lifecycleCurrency ?? "NGN").toUpperCase()); setBatteryReplacementCost(Math.max(0, scenario.batteryReplacementCost ?? 0)); setBatteryReplacementEscalation(Math.min(30, Math.max(0, scenario.batteryReplacementEscalation ?? 6))); setBatteryReplacementIntervalYears(Math.min(20, Math.max(1, Math.round(scenario.batteryReplacementIntervalYears ?? 8)))); setBatteryReplacementForecastYears(Math.min(25, Math.max(1, Math.round(scenario.batteryReplacementForecastYears ?? 20))));
    setScenarioNote(`Restored “${scenario.name}”. The live workbench is ready to refine or export.`);
  };
  const removeScenario = (id: string) => {
    const next = savedScenarios.filter((scenario) => scenario.id !== id);
    persistScenarios(next);
    setComparisonScenarioIds((current) => current.filter((scenarioId) => scenarioId !== id));
  };
  const toggleScenarioComparison = (id: string) => setComparisonScenarioIds((current) => current.includes(id) ? current.filter((scenarioId) => scenarioId !== id) : [id, ...current].slice(0, 2));
  const handleScheduleScroll = () => {
    const schedule = scheduleScrollRef.current;
    if (!schedule) return;
    setScheduleScrollLeft(schedule.scrollLeft);
    setScheduleScrollMax(Math.max(0, schedule.scrollWidth - schedule.clientWidth));
  };
  const setScheduleScrollFromSlider = (percent: number) => {
    const schedule = scheduleScrollRef.current;
    if (!schedule || scheduleScrollMax <= 0) return;
    const next = (Math.min(100, Math.max(0, percent)) / 100) * scheduleScrollMax;
    schedule.scrollLeft = next;
    setScheduleScrollLeft(next);
  };
  const printLoadSummary = () => {
    const styleId = "xtorra-print-orientation";
    document.getElementById(styleId)?.remove();
    const orientationStyle = document.createElement("style");
    orientationStyle.id = styleId;
    orientationStyle.textContent = `@page { size: ${printOrientation}; margin: 12mm; }`;
    document.head.appendChild(orientationStyle);
    const clearOrientation = () => document.getElementById(styleId)?.remove();
    window.addEventListener("afterprint", clearOrientation, { once: true });
    window.print();
  };
  const loadPresetId = (row: LoadRow) => searchableApplianceCatalogue.find((preset) => preset.item === row.item)?.id ?? "custom";
  const applyLoadPreset = (loadId: string, presetId: string) => {
    const preset = searchableApplianceCatalogue.find((item) => item.id === presetId);
    setLoads((current) => current.map((row) => {
      if (row.id !== loadId) return row;
      if (!preset) return { ...row, item: "Custom load", category: "Custom", notes: "", watts: 0, quantity: 1, dayHours: 1, nightHours: 0, utilisation: 100, simultaneous: 100, surgeFactor: 1.2, surgeDurationSec: 1 };
      return { ...row, item: preset.item, category: preset.category, notes: preset.notes ?? "", watts: preset.watts, quantity: preset.quantity, dayHours: preset.dayHours, nightHours: preset.nightHours, utilisation: preset.utilisation, simultaneous: preset.simultaneous, surgeFactor: preset.surgeFactor, surgeDurationSec: preset.surgeDurationSec };
    }));
  };

  const lookupProjectCoordinates = () => {
    const query = (projectLocation || location).trim();
    const broaderLocation = location.trim();
    if (!query) { setGeocodeNote("Enter a project location or location label before loading approximate coordinates."); return; }
    if (!window.google || !geocodeMapRef.current || !geocodeReady) { setGeocodeNote("Location lookup is still preparing. Please try again in a moment or enter coordinates manually."); return; }
    setGeocodeLoading(true);
    setGeocodeNote(`Looking up an approximate point for “${query}”…`);
    const updatePoint = (result: google.maps.GeocoderResult, source: string, usedBroaderFallback = false) => {
      const point = result.geometry.location;
      setLatitude(Number(point.lat().toFixed(4)));
      setLongitude(Number(point.lng().toFixed(4)));
      setLocation(result.formatted_address || source);
      setGeocodeLoading(false);
      setGeocodeNote(usedBroaderFallback ? "No match for the detailed project address; approximate coordinates were loaded from the broader location label. Confirm the pin and edit latitude/longitude for the site." : "Approximate coordinates loaded from the project location. Confirm the pin and edit latitude/longitude for the site before using the solar-resource lookup.");
    };
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      const result = results?.[0];
      if (status === "OK" && result) { updatePoint(result, query); return; }
      if (broaderLocation && broaderLocation !== query) {
        geocoder.geocode({ address: broaderLocation }, (fallbackResults, fallbackStatus) => {
          const fallbackResult = fallbackResults?.[0];
          if (fallbackStatus === "OK" && fallbackResult) { updatePoint(fallbackResult, broaderLocation, true); return; }
          setGeocodeLoading(false);
          setGeocodeNote("No approximate coordinate match was found. Try a fuller location, or enter latitude and longitude manually.");
        });
        return;
      }
      setGeocodeLoading(false);
      setGeocodeNote("No approximate coordinate match was found. Try a fuller location, or enter latitude and longitude manually.");
    });
  };

  const lookupInsolation = async () => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setInsolationNote("Enter valid latitude (-90 to 90) and longitude (-180 to 180) before looking up solar resource data.");
      return;
    }
    setInsolationLoading(true);
    setInsolationNote("Requesting NASA POWER daily all-sky solar data for this point…");
    try {
      const year = new Date().getUTCFullYear() - 1;
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}&start=${year}0101&end=${year}1231&format=JSON`);
      if (!response.ok) throw new Error("Solar resource lookup failed");
      const data = await response.json() as NASAResponse;
      const dailyResource = data.properties?.parameter?.ALLSKY_SFC_SW_DWN ?? {};
      const values = Object.values(dailyResource).map(Number).filter((value) => Number.isFinite(value) && value >= 0 && value !== -999);
      if (values.length === 0) throw new Error("No usable solar resource values returned");
      const average = values.reduce((total, value) => total + value, 0) / values.length;
      const monthly = Array.from({ length: 12 }, (_, monthIndex) => {
        const prefix = `${year}${String(monthIndex + 1).padStart(2, "0")}`;
        const monthValues = Object.entries(dailyResource).filter(([date, value]) => date.startsWith(prefix) && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) !== -999).map(([, value]) => Number(value));
        const monthAverage = monthValues.length ? monthValues.reduce((total, value) => total + value, 0) / monthValues.length : average;
        return { id: `month-${String(monthIndex + 1).padStart(2, "0")}`, label: new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(Date.UTC(year, monthIndex, 1))), psh: Number(monthAverage.toFixed(2)) };
      });
      setPeakSunHours(Number(average.toFixed(2)));
      setMonthlySolarResource(monthly);
      setSolarResourceScenario("annual");
      setInsolationNote(`NASA POWER ${year} all-sky daily average: ${average.toFixed(2)} kWh/m²/day from ${values.length} valid days. Monthly and seasonal simulation scenarios are now available; the annual planning input remains editable.`);
    } catch {
      setInsolationNote("The NASA POWER lookup could not complete. Continue with an editable peak-sun-hour input or try again later.");
    } finally {
      setInsolationLoading(false);
    }
  };

  const loadRainySeasonScenarios = async () => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setRainySeasonNote("Enter valid latitude (-90 to 90) and longitude (-180 to 180) before loading historical rainy-season planning data.");
      return;
    }
    const endYear = new Date().getUTCFullYear() - 1;
    const startYear = endYear - 9;
    setRainySeasonLoading(true);
    setRainySeasonNote(`Requesting ${startYear}–${endYear} NASA POWER daily data to prepare automatic and custom rainy-month planning windows…`);
    try {
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}&start=${startYear}0101&end=${endYear}1231&format=JSON`);
      if (!response.ok) throw new Error("Historical solar resource lookup failed");
      const data = await response.json() as NASAResponse;
      const dailyResource = data.properties?.parameter?.ALLSKY_SFC_SW_DWN ?? {};
      const records = Object.entries(dailyResource).map(([date, value]) => ({ date, value: Number(value), monthIndex: Number(date.slice(4, 6)) - 1 })).filter((entry) => entry.monthIndex >= 0 && entry.monthIndex < 12 && Number.isFinite(entry.value) && entry.value >= 0 && entry.value !== -999);
      if (records.length < 300) throw new Error("Too few usable historical solar resource values returned");
      setHistoricalRainyResource({ records: records.map(({ monthIndex, value }) => ({ monthIndex, value })), startYear, endYear, latitude, longitude });
    } catch {
      setRainySeasonResource([]);
      setRainySeasonResourceCoordinate(null);
      setRainySeasonNote("Historical rainy-season scenarios could not be loaded. Existing annual and monthly simulation inputs remain available; try again later or use a qualified site-specific resource study.");
    } finally {
      setRainySeasonLoading(false);
    }
  };

  const factorFields = [
    ["Temperature loss", temperatureLoss, setTemperatureLoss, "% loss"], ["Soiling loss", soilingLoss, setSoilingLoss, "% loss"], ["Shading / horizon loss", shadingLoss, setShadingLoss, "% loss"], ["Mismatch loss", mismatchLoss, setMismatchLoss, "% loss"], ["DC cable loss", dcCableLoss, setDcCableLoss, "% loss"], ["MPPT / charge efficiency", mpptEfficiency, setMpptEfficiency, "% retained"], ["Inverter efficiency", inverterEfficiency, setInverterEfficiency, "% retained"], ["AC cable loss", acCableLoss, setAcCableLoss, "% loss"], ["Battery round-trip efficiency", batteryRoundTrip, setBatteryRoundTrip, "% retained"],
  ] as const;

  const backupScenario = backupScenarios[backupScenarioId];
  const safeGeneratorPowerFactor = Math.min(1, Math.max(0.1, generatorPowerFactor || 0.8));
  const safeGeneratorLoading = Math.min(100, Math.max(1, generatorLoadingTarget || 80)) / 100;
  const gridAutonomyDays = Math.max(0, gridOutageHours || 0) / 24;
  const generatorKva = totals.inverterKw > 0 ? totals.inverterKw / safeGeneratorPowerFactor / safeGeneratorLoading : 0;
  const dailyGridEnergyValue = Math.max(0, gridTariff || 0) * totals.dailyEnergy;
  const dailyOutageEnergyEquivalent = totals.dailyEnergy * Math.min(24, Math.max(0, gridOutageHours || 0)) / 24;
  const requiredInverterWatts = totals.inverterKw * 1000;
  const activeCircuitCount = loads.filter((row) => row.item.trim() || row.circuitName.trim()).length;
  const totalApplianceQuantity = loads.reduce((total, row) => total + Math.max(0, row.quantity || 0), 0);
  const totalEquipmentQuantity = loads.reduce((total, row) => total + effectiveQuantity(row), 0);
  const allModelRecommendations = useMemo(() => {
    return inverterModelLibrary
      .map((model) => {
        const supportedTier = model.overloadTiers
          .filter((tier) => tier.watts >= requiredInverterWatts && tier.durationSec >= totals.governingSurgeDurationSec)
          .sort((a, b) => a.watts - b.watts || a.durationSec - b.durationSec)[0];
        const continuousPass = model.continuousKw * 1000 >= requiredInverterWatts;
        return { model, continuousPass, overloadPass: Boolean(supportedTier), supportedTier };
      })
      .sort((a, b) => Number(b.continuousPass && b.overloadPass) - Number(a.continuousPass && a.overloadPass) || a.model.continuousKw - b.model.continuousKw);
  }, [requiredInverterWatts, totals.governingSurgeDurationSec]);
  const modelRecommendations = inverterModelLibrary.some((model) => model.brand === inverterBrand) ? allModelRecommendations.filter((item) => item.model.brand === inverterBrand) : [];
  const compatibleModels = modelRecommendations.filter((item) => item.continuousPass && item.overloadPass);
  const comparisonCandidates = allModelRecommendations.filter((item) => item.continuousPass && item.overloadPass);

  const selectBackupScenario = (scenarioId: BackupScenarioId) => {
    const scenario = backupScenarios[scenarioId];
    setBackupScenarioId(scenarioId);
    setAutonomyDays(scenarioId === "grid" ? gridAutonomyDays : scenario.defaultAutonomy);
  };

  const downloadBoqReport = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let logoImage: HTMLImageElement | null = null;
    try {
      logoImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = reportLogoUrl;
      });
    } catch {
      logoImage = null;
    }

    const footer = () => {
      const footerY = pageHeight - 31;
      doc.setFillColor(7, 31, 75);
      doc.rect(0, footerY, pageWidth, 31, "F");
      if (logoImage) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(13, footerY + 7, 47, 16, 1.5, 1.5, "F");
        doc.addImage(logoImage, "PNG", 15, footerY + 8.25, 43, 14);
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Xtorra Renewables", 15, footerY + 17);
      }
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.4);
      doc.text("XTORRA RENEWABLES", 68, footerY + 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.6);
      doc.text("sales@xtorra.com  |  info@xtorra.com  |  technical@xtorra.com", 68, footerY + 15);
      doc.text("+234 701 638 2231  |  www.xtorra.com  |  52 Odozi Street, Ojodu Berger, Lagos", 68, footerY + 20);
      doc.text("info@chybonsolarenergy.com", 68, footerY + 25);
    };

    let y = 19;
    const ensureSpace = (space: number) => {
      if (y + space > pageHeight - 39) {
        doc.addPage();
        y = 20;
      }
    };
    const sectionTitle = (title: string) => {
      ensureSpace(12);
      doc.setDrawColor(88, 169, 14);
      doc.setLineWidth(0.7);
      doc.line(16, y, 28, y);
      doc.setTextColor(8, 44, 103);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, 32, y + 1.5);
      y += 9;
    };
    const detailLine = (label: string, value: string) => {
      ensureSpace(7);
      doc.setTextColor(53, 92, 121);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.3);
      doc.text(label, 18, y);
      doc.setTextColor(69, 93, 108);
      doc.setFont("helvetica", "normal");
      doc.text(value, pageWidth - 18, y, { align: "right", maxWidth: 110 });
      y += 6.5;
    };

    doc.setFillColor(8, 44, 103);
    doc.rect(0, 0, pageWidth, 39, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(boqCoverType === "tower-site" ? "Tower Site Bill of Quantity" : "Solar System Bill of Quantity", 16, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(boqCoverType === "tower-site" ? "Indicative telecom tower design basis" : "Indicative system-design basis", 16, 26);
    doc.text(`Prepared ${new Date().toLocaleDateString()}`, 16, 33);
    y = 54;

    sectionTitle("Project coordinates");
    detailLine("Customer", customerName || "Not supplied");
    detailLine("Project location", projectLocation || location || "Not supplied");
    detailLine("Location", location || "Unlabelled site");
    detailLine("Latitude / longitude", `${latitude.toFixed(4)} / ${longitude.toFixed(4)}`);
    detailLine("Peak-sun-hours", `${number(peakSunHours, 2)} kWh/m²/day`);
    detailLine("Simulation resource", `${activeResourceScenario.label} · ${number(simulationPeakSunHours, 2)} kWh/m²/day`);
    if (activeRainySeasonScenario) detailLine("Rainy probability basis", `${activeRainySeasonScenario.probability} daily-resource percentile · ${activeRainySeasonScenario.windowMode === "custom" ? "custom window" : "automatic low-resource window"}: ${activeRainySeasonScenario.periodLabel} · ${activeRainySeasonScenario.recordWindow} · ${number(activeRainySeasonScenario.observationCount)} observations`);
    detailLine("Battery ageing state", `Year ${number(safeBatteryAgeYears)} at ${number(safeBatteryAnnualDegradation, 1)}% annual fade · ${number(batteryAgeRetention * 100, 1)}% usable reserve retained`);
    detailLine("Backup scenario", `${backupScenario.label} · ${number(autonomyDays, 2)} autonomy day(s)`);
    detailLine("Preferred inverter brand", inverterBrand);
    detailLine("Preferred battery brand", batteryBrand);
    if (boqCoverType === "tower-site") {
      detailLine("Tower reference", towerReference || "Not supplied");
      detailLine("Operational context", towerOperationalContext || "Telecom tower site");
      detailLine("Radio tenants", `${number(Math.max(1, tenantCount))} tenant(s) applied to telecom radio equipment`);
    }
    detailLine("Telecom DC bus", dcBusVoltage);
    if (backupScenarioId === "grid") {
      detailLine("Local grid tariff", `${gridCurrency || "Local currency"} ${number(gridTariff, 2)} / kWh`);
      detailLine("Average daily outage", `${number(gridOutageHours, 2)} h/day · ${number(dailyOutageEnergyEquivalent, 2)} kWh equivalent exposure`);
    }

    sectionTitle("Load and sizing summary");
    detailLine("Daytime solar demand", `${number(totals.dayEnergy, 2)} kWh/day`);
    detailLine("Night battery dependency", `${number(totals.nightEnergy, 2)} kWh/night`);
    detailLine("Total AC energy", `${number(totals.dailyEnergy, 2)} kWh/day`);
    detailLine("Active circuits / equipment", `${number(activeCircuitCount)} circuit(s) · ${number(totalEquipmentQuantity)} equipment unit(s)`);
    if (telecomNPlusOne) detailLine("Telecom N+1 reserve", telecomRedundancyRows.length > 0 ? `${number(redundancyReserveCount)} additional reserve unit(s) across ${number(telecomRedundancyRows.length)} eligible telecom load(s)` : "Enabled, but no eligible telecom equipment records are active");
    detailLine("Day / night peak", `${number(totals.dayPeak / 1000, 2)} / ${number(totals.nightPeak / 1000, 2)} kW`);
    detailLine("Combined surge peak", `${number(totals.surgePeakWatts)} W before ${number(inverterHeadroom)}% inverter headroom`);
    detailLine("Governing surge duration", `${number(totals.governingSurgeDurationSec, 1)} s from the longest active load surge`);
    detailLine("Required inverter overload", `${number(requiredInverterWatts)} W for ${number(totals.governingSurgeDurationSec, 1)} s after headroom`);
    detailLine("PV performance retained", `${number(totals.retainedPvFactor * 100, 1)}%`);
    if (rectifierOperatingModules > 0) detailLine("Rectifier-module screen", `${number(rectifierModuleDemandWatts)} W telecom demand ÷ ${number(rectifierModuleWatts)} W/module = ${number(rectifierOperatingModules)} operating module(s)${rectifierModuleNPlusOne ? " + 1 N+1 reserve" : ""}`);
    if (backupScenarioId === "generator") detailLine("Generator sizing basis", `${number(generatorKva, 2)} kVA at ${number(safeGeneratorPowerFactor, 2)} PF and ${number(safeGeneratorLoading * 100)}% target loading`);

    sectionTitle("Core bill of quantity");
    detailLine("PV modules", totals.moduleCount > 0 ? `${number(totals.moduleCount)} × ${number(moduleWattage)} Wp` : "Add valid inputs");
    detailLine("Solar array", `${number(totals.arrayWp)} Wp / ${number(totals.arrayWp / 1000, 2)} kWp`);
    detailLine("Hybrid inverter", `${number(totals.inverterKw, 2)} kW minimum from ${number(totals.surgePeakWatts)} W combined surge basis`);
    detailLine("Preferred inverter", inverterBrand);
    detailLine("Compatible model shortlist", compatibleModels.length > 0 ? compatibleModels.map((item) => item.model.model).join("; ") : "No documented selected-brand model passes the active screen");
    detailLine("Lithium battery bank", `${number(totals.batteryKwh, 2)} kWh nominal capacity`);
    detailLine("Preferred battery", batteryBrand);
    detailLine("Telecom DC bus", dcBusVoltage);
    detailLine("Rectifier modules", rectifierOperatingModules > 0 ? `${number(rectifierRecommendedModules)} × ${number(rectifierModuleWatts)} W module(s) · ${number(rectifierOperatingModules)} operating${rectifierModuleNPlusOne ? " + 1 N+1 reserve" : ""}` : "Add eligible telecom DC loads to screen rectifier modules");
    detailLine("Generator backup", backupScenarioId === "generator" ? `${number(generatorKva, 2)} kVA indicative recommendation` : `Not included in the ${backupScenario.shortLabel.toLowerCase()} pathway`);
    detailLine("Balance of system", "Structure, protection, isolators, cables, earthing, monitoring — site specific");

    sectionTitle("Battery replacement lifecycle forecast");
    detailLine("Forecast inputs", `Current allowance ${money(safeLifecycleCurrency, safeBatteryReplacementCost)} · escalation ${number(safeBatteryReplacementEscalation, 1)}%/year · interval ${number(safeBatteryReplacementIntervalYears)} year(s)`);
    detailLine("Forecast horizon", `Year 1–${number(safeBatteryReplacementForecastYears)} · ${number(totals.batteryKwh, 2)} kWh nominal battery bank`);
    if (safeBatteryReplacementCost > 0 && firstScheduledBatteryReplacement) {
      detailLine("First scheduled replacement", `Year ${number(firstScheduledBatteryReplacement.year)} · ${money(safeLifecycleCurrency, firstScheduledBatteryReplacement.replacementEventCost)} nominal event allowance`);
      detailLine("Cumulative event allowance", `${money(safeLifecycleCurrency, lifecycleReplacementProvision)} across ${number(scheduledBatteryReplacements.length)} scheduled event(s)`);
      const drawLifecycleTableHeader = () => {
        ensureSpace(8);
        doc.setFillColor(234, 241, 237);
        doc.rect(16, y, pageWidth - 32, 6, "F");
        doc.setTextColor(53, 92, 121);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.3);
        doc.text("YEAR", 18, y + 4);
        doc.text("FULL-BANK NOMINAL ALLOWANCE", 96, y + 4, { align: "right" });
        doc.text("SCHEDULED EVENT", 145, y + 4, { align: "right" });
        doc.text("CUMULATIVE EVENTS", pageWidth - 18, y + 4, { align: "right" });
        y += 7;
      };
      drawLifecycleTableHeader();
      let cumulativeEventAllowance = 0;
      batteryReplacementForecast.forEach((entry) => {
        if (y + 5.5 > pageHeight - 39) {
          doc.addPage();
          y = 20;
          sectionTitle("Battery replacement lifecycle forecast · continued");
          drawLifecycleTableHeader();
        }
        cumulativeEventAllowance += entry.replacementEventCost;
        if (entry.isScheduledReplacement) {
          doc.setFillColor(247, 251, 240);
          doc.rect(16, y - 3.7, pageWidth - 32, 5.5, "F");
        }
        doc.setFont("helvetica", entry.isScheduledReplacement ? "bold" : "normal");
        doc.setFontSize(7);
        doc.setTextColor(53, 92, 121);
        doc.text(`Year ${number(entry.year)}`, 18, y);
        doc.setTextColor(69, 93, 108);
        doc.text(money(safeLifecycleCurrency, entry.futureCost), 96, y, { align: "right" });
        doc.setTextColor(entry.isScheduledReplacement ? 63 : 123, entry.isScheduledReplacement ? 125 : 148, entry.isScheduledReplacement ? 12 : 163);
        doc.text(entry.isScheduledReplacement ? money(safeLifecycleCurrency, entry.replacementEventCost) : "—", 145, y, { align: "right" });
        doc.setTextColor(8, 44, 103);
        doc.text(money(safeLifecycleCurrency, cumulativeEventAllowance), pageWidth - 18, y, { align: "right" });
        y += 5.5;
      });
    } else {
      detailLine("Forecast status", "Enter a current battery replacement allowance to show annual nominal planning values. This field is an editable budget assumption, not a market quotation.");
    }

    sectionTitle("Load schedule");
    loads.forEach((row) => {
      const rowQuantity = effectiveQuantity(row);
      const rowEnergy = row.watts * rowQuantity * (row.dayHours + row.nightHours) * (row.utilisation / 100) / 1000;
      const rowSurgeWatts = row.watts * rowQuantity * (row.simultaneous / 100) * row.surgeFactor;
      const tenancyNote = isTenantScalableRadioLoad(row) && tenantCount > 1 ? ` · tenancy: ${number(row.quantity)} per tenant × ${number(tenantCount)} tenant(s)` : "";
      const redundancyNote = telecomNPlusOne && isTelecomRedundancyEligible(row) ? ` · equipment N+1: ${number(operatingQuantity(row))} operating + 1 reserve` : "";
      detailLine(row.circuitName || "Unlabelled circuit", `${row.category ? `[${row.category}] ` : ""}${row.item || "Unlabelled load"} · ${number(row.watts)} W × ${number(rowQuantity)}${tenancyNote}${redundancyNote} · day ${number(row.dayHours, 2)} h · night ${number(row.nightHours, 2)} h · surge ${number(row.surgeFactor, 1)}× for ${number(row.surgeDurationSec, 1)} s = ${number(rowSurgeWatts)} W · ${number(rowEnergy, 2)} kWh/day${row.notes?.trim() ? ` · Note: ${row.notes.trim()}` : ""}`);
    });

    ensureSpace(74);
    sectionTitle("24-hour operating profile");
    const chartX = 18;
    const chartY = y + 2;
    const chartWidth = pageWidth - 36;
    const chartHeight = 42;
    const chartValues = energySimulation.hourly.flatMap((entry) => [entry.load, entry.solar, entry.backup]);
    const chartMax = Math.max(0.1, ...chartValues);
    const chartBottom = chartY + chartHeight;
    const toX = (index: number) => chartX + (index / Math.max(1, energySimulation.hourly.length - 1)) * chartWidth;
    const toY = (value: number) => chartBottom - (Math.max(0, value) / chartMax) * (chartHeight - 7);
    doc.setFillColor(248, 250, 247);
    doc.roundedRect(chartX - 2, chartY - 3, chartWidth + 4, chartHeight + 8, 1.5, 1.5, "F");
    doc.setDrawColor(201, 214, 216);
    doc.setLineWidth(0.25);
    doc.line(chartX, chartBottom, chartX + chartWidth, chartBottom);
    doc.line(chartX, chartY, chartX, chartBottom);
    [0.5, 1].forEach((fraction) => {
      const gridY = chartBottom - (chartHeight - 7) * fraction;
      doc.setDrawColor(220, 230, 226);
      doc.line(chartX, gridY, chartX + chartWidth, gridY);
    });
    const drawSeries = (key: "load" | "solar" | "backup", color: [number, number, number]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(key === "load" ? 0.9 : 0.7);
      energySimulation.hourly.slice(1).forEach((entry, index) => {
        const previous = energySimulation.hourly[index];
        doc.line(toX(index), toY(previous[key]), toX(index + 1), toY(entry[key]));
      });
    };
    drawSeries("load", [8, 44, 103]);
    drawSeries("solar", [88, 169, 14]);
    drawSeries("backup", [196, 146, 63]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(84, 117, 138);
    [0, 6, 12, 18, 23].forEach((index) => doc.text(energySimulation.hourly[index].hour, toX(index), chartBottom + 5, { align: index === 0 ? "left" : index === 23 ? "right" : "center" }));
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 44, 103);
    doc.text("Load", chartX, chartY - 7);
    doc.setTextColor(63, 125, 12);
    doc.text("Solar", chartX + 26, chartY - 7);
    doc.setTextColor(134, 92, 27);
    doc.text(backupScenarioId === "solar-only" ? "Unserved" : `${backupScenario.shortLabel} support`, chartX + 52, chartY - 7);
    y = chartBottom + 14;
    detailLine("Operating result", `Direct solar ${number(energySimulation.directSolarKwh, 2)} kWh · battery minimum ${number(energySimulation.minimumBatterySocPercent, 0)}% SOC · ${backupScenarioId === "solar-only" ? "unserved" : `${backupScenario.shortLabel.toLowerCase()} support`} ${number(backupScenarioId === "generator" ? energySimulation.generatorSupportKwh : backupScenarioId === "grid" ? energySimulation.gridSupportKwh : energySimulation.unservedKwh, 2)} kWh`);

    ensureSpace(24);
    doc.setFillColor(237, 246, 220);
    doc.roundedRect(16, y, pageWidth - 32, 22, 2, 2, "F");
    doc.setTextColor(63, 125, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("IMPORTANT DESIGN NOTE", 22, y + 7);
    doc.setTextColor(65, 91, 113);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.text("This is an indicative bill of quantity for early planning. A qualified solar engineer must validate site survey, shading, structural loading, string design, surge and protection requirements, earthing, equipment compatibility, generator/grid integration, and applicable codes before procurement or installation.", 22, y + 12, { maxWidth: pageWidth - 44, lineHeightFactor: 1.25 });

    for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
      doc.setPage(page);
      footer();
    }
    const safeLocation = (location || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    doc.save(`xtorra-solar-boq-${safeLocation || "site"}.pdf`);
  };

  const downloadInverterComparisonReport = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let logoImage: HTMLImageElement | null = null;
    try {
      logoImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = reportLogoUrl;
      });
    } catch {
      logoImage = null;
    }

    const footer = () => {
      const footerY = pageHeight - 31;
      doc.setFillColor(7, 31, 75);
      doc.rect(0, footerY, pageWidth, 31, "F");
      if (logoImage) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(13, footerY + 7, 47, 16, 1.5, 1.5, "F");
        doc.addImage(logoImage, "PNG", 15, footerY + 8.25, 43, 14);
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Xtorra Renewables", 15, footerY + 17);
      }
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.4);
      doc.text("XTORRA RENEWABLES", 68, footerY + 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.6);
      doc.text("sales@xtorra.com  |  info@xtorra.com  |  technical@xtorra.com", 68, footerY + 15);
      doc.text("+234 701 638 2231  |  www.xtorra.com  |  52 Odozi Street, Ojodu Berger, Lagos", 68, footerY + 20);
      doc.text("info@chybonsolarenergy.com", 68, footerY + 25);
    };

    let y = 19;
    const ensureSpace = (space: number) => {
      if (y + space > pageHeight - 39) {
        doc.addPage();
        y = 20;
      }
    };
    const writeLine = (label: string, value: string) => {
      ensureSpace(7);
      doc.setTextColor(53, 92, 121);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.text(label, 18, y);
      doc.setTextColor(69, 93, 108);
      doc.setFont("helvetica", "normal");
      doc.text(value, pageWidth - 18, y, { align: "right", maxWidth: 110 });
      y += 6.5;
    };

    doc.setFillColor(8, 44, 103);
    doc.rect(0, 0, pageWidth, 39, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Inverter Candidate Comparison", 16, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Indicative documented-model screen", 16, 26);
    doc.text(`Prepared ${new Date().toLocaleDateString()}`, 16, 33);
    y = 54;

    doc.setFillColor(237, 246, 220);
    doc.roundedRect(16, y, pageWidth - 32, 30, 2, 2, "F");
    doc.setTextColor(63, 125, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.text("LIVE SCREEN REQUIREMENT", 22, y + 8);
    doc.setTextColor(8, 44, 103);
    doc.setFontSize(15);
    doc.text(`${number(totals.inverterKw, 2)} kW continuous basis`, 22, y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.text(`${number(requiredInverterWatts)} W overload held for ${number(totals.governingSurgeDurationSec, 1)} s after ${number(inverterHeadroom)}% headroom`, 22, y + 25);
    y += 42;

    doc.setTextColor(8, 44, 103);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Project and operating basis", 18, y);
    y += 8;
    writeLine("Customer", customerName || "Not supplied");
    writeLine("Project location", projectLocation || location || "Not supplied");
    writeLine("Preferred inverter brand", inverterBrand);
    writeLine("Backup scenario", `${backupScenario.label} · ${number(autonomyDays, 2)} autonomy day(s)`);
    writeLine("Candidate count", `${comparisonCandidates.length} documented model(s) pass this live screen`);
    y += 4;

    doc.setTextColor(8, 44, 103);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Compatible inverter candidates", 18, y);
    y += 7;

    if (comparisonCandidates.length === 0) {
      doc.setTextColor(94, 118, 138);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("No documented model in the current reference library passes the active continuous and duration-aware overload screen. Adjust the live assumptions or contact Xtorra for a technical review.", 18, y, { maxWidth: pageWidth - 36, lineHeightFactor: 1.35 });
      y += 18;
    } else {
      comparisonCandidates.forEach(({ model, supportedTier }) => {
        ensureSpace(43);
        doc.setDrawColor(205, 224, 212);
        doc.setFillColor(model.brand === inverterBrand ? 245 : 250, model.brand === inverterBrand ? 250 : 252, model.brand === inverterBrand ? 236 : 248);
        doc.roundedRect(16, y, pageWidth - 32, 37, 1.5, 1.5, "FD");
        doc.setTextColor(8, 44, 103);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${model.brand} · ${model.model}`, 22, y + 8);
        doc.setTextColor(63, 125, 12);
        doc.setFontSize(7.5);
        doc.text(model.brand === inverterBrand ? "PREFERRED-BRAND SCREEN PASS" : "DOCUMENTED SCREEN PASS", pageWidth - 22, y + 8, { align: "right" });
        doc.setTextColor(69, 93, 108);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.1);
        doc.text(`Continuous: ${number(model.continuousKw, 1)} kW`, 22, y + 16);
        doc.text(`Documented overload: ${supportedTier ? `${number(supportedTier.watts)} W for ${number(supportedTier.durationSec, 1)} s` : "No matching tier"}`, 22, y + 22);
        doc.text(`Configuration note: ${model.phaseNote}`, 22, y + 28, { maxWidth: pageWidth - 44 });
        doc.setTextColor(36, 79, 114);
        doc.setFontSize(6.7);
        doc.text(`Official source: ${model.sourceUrl}`, 22, y + 34, { maxWidth: pageWidth - 44 });
        y += 42;
      });
    }

    ensureSpace(22);
    doc.setFillColor(255, 247, 226);
    doc.roundedRect(16, y, pageWidth - 32, 20, 2, 2, "F");
    doc.setTextColor(113, 82, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);
    doc.text("ENGINEERING REVIEW REQUIRED", 22, y + 7);
    doc.setTextColor(91, 104, 111);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text("The comparison is an indicative screen only. Confirm product variant, phase, battery compatibility, voltage window, temperature derating, protection, local availability, warranty, and final site design with Xtorra before procurement or installation.", 22, y + 12, { maxWidth: pageWidth - 44, lineHeightFactor: 1.25 });

    for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
      doc.setPage(page);
      footer();
    }
    const safeLocation = (projectLocation || location || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    doc.save(`xtorra-inverter-comparison-${safeLocation || "site"}.pdf`);
  };

  const handoffBoqToSales = () => {
    const loadSummary = loads.map((row) => `${row.circuitName || "Unlabelled circuit"}: ${row.category ? `[${row.category}] ` : ""}${row.item || "Unlabelled load"} · ${number(row.watts)} W × ${number(effectiveQuantity(row))}${isTenantScalableRadioLoad(row) && tenantCount > 1 ? ` · ${number(row.quantity)} per tenant × ${number(tenantCount)} tenant(s)` : ""}${telecomNPlusOne && isTelecomRedundancyEligible(row) ? ` · N+1: ${number(operatingQuantity(row))} operating + 1 reserve` : ""} · day ${number(row.dayHours, 2)} h · night ${number(row.nightHours, 2)} h · surge ${number(row.surgeFactor, 1)}× for ${number(row.surgeDurationSec, 1)} s${row.notes?.trim() ? ` · Note: ${row.notes.trim()}` : ""}`).join("\n");
    onBoqEnquiry?.({
      customerName,
      projectLocation: projectLocation || location,
      summary: [
        "Solar system BoQ context",
        `Customer: ${customerName || "Not supplied"}`,
        `Project location: ${projectLocation || location || "Not supplied"}`,
        `Site coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        `Peak-sun-hours: ${number(peakSunHours, 2)} kWh/m²/day`,
        `Backup scenario: ${backupScenario.label} · ${number(autonomyDays, 2)} autonomy day(s)`,
        `Telecom N+1 reserve: ${telecomNPlusOne ? `${number(redundancyReserveCount)} reserve unit(s) across ${number(telecomRedundancyRows.length)} eligible telecom load(s)` : "Not selected"}`,
        `Radio tenancy: ${number(Math.max(1, tenantCount))} tenant(s) applied to eligible radio equipment`,
        `Telecom DC bus: ${dcBusVoltage}`,
        `Rectifier modules: ${rectifierOperatingModules > 0 ? `${number(rectifierRecommendedModules)} × ${number(rectifierModuleWatts)} W module(s) · ${number(rectifierOperatingModules)} operating${rectifierModuleNPlusOne ? " + 1 N+1 reserve" : ""}` : "No eligible telecom DC demand to screen"}`,
        `BoQ cover: ${boqCoverType === "tower-site" ? `Tower site · ${towerReference || "reference not supplied"} · ${towerOperationalContext || "telecom tower site"}` : "Standard energy project"}`,
        `Solar array: ${number(totals.arrayWp)} Wp / ${number(totals.arrayWp / 1000, 2)} kWp`,
        `Combined surge peak: ${number(totals.surgePeakWatts)} W before ${number(inverterHeadroom)}% headroom`,
        `Governing surge duration: ${number(totals.governingSurgeDurationSec, 1)} s · required overload: ${number(requiredInverterWatts)} W`,
        `Hybrid inverter: ${number(totals.inverterKw, 2)} kW minimum from surge basis · preference: ${inverterBrand}`,
        `Compatible model shortlist: ${compatibleModels.length > 0 ? compatibleModels.map((item) => item.model.model).join("; ") : "No documented selected-brand model passes the active screen"}`,
        `Lithium battery: ${number(totals.batteryKwh, 2)} kWh nominal · preference: ${batteryBrand}`,
        `Battery lifecycle allowance: ${safeBatteryReplacementCost > 0 ? `${money(safeLifecycleCurrency, safeBatteryReplacementCost)} current replacement allowance · ${number(safeBatteryReplacementEscalation, 1)}% annual nominal escalation · every ${number(safeBatteryReplacementIntervalYears)} year(s) through year ${number(safeBatteryReplacementForecastYears)} · cumulative scheduled events ${money(safeLifecycleCurrency, lifecycleReplacementProvision)}` : "Enter a current replacement allowance to create an editable lifecycle forecast"}`,
        activeRainySeasonScenario ? `Simulation rainy planning: ${activeRainySeasonScenario.probability} daily-resource percentile across the ${activeRainySeasonScenario.windowMode === "custom" ? "custom selected" : "automatic low-resource"} window (${activeRainySeasonScenario.periodLabel}), based on ${activeRainySeasonScenario.recordWindow} NASA POWER history` : "Simulation rainy planning: no historical rainy-season probability scenario selected",
        backupScenarioId === "generator" ? `Generator backup: ${number(generatorKva, 2)} kVA indicative` : "Generator backup: not selected",
        backupScenarioId === "grid" ? `Grid support: ${gridCurrency || "Local currency"} ${number(gridTariff, 2)}/kWh · ${number(gridOutageHours, 2)} h/day outage` : "Grid support: not selected",
        "Load schedule:",
        loadSummary,
      ].join("\n"),
    });
  };

  return (
    <>
    <section id="system-design" className="relative overflow-hidden bg-[#F2F6F3] py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"><MapView initialCenter={{ lat: latitude, lng: longitude }} initialZoom={8} onMapReady={(map) => { geocodeMapRef.current = map; setGeocodeReady(true); }} /></div>
      <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full border border-[#0F6693]/12" />
      <div className="pointer-events-none absolute left-0 top-24 h-px w-[34vw] energy-line opacity-80" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-96 w-96 rounded-full border border-[#58A90E]/15" />
      <div className="pointer-events-none absolute right-8 top-8 hidden border border-[#0F6693]/20 bg-[#F8F8F3]/80 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] backdrop-blur lg:block">FIELD STATION 05 · DESIGN BASIS</div>
      <div className="pointer-events-none absolute right-0 top-28 hidden h-48 w-[38vw] lg:block" aria-hidden="true"><svg viewBox="0 0 520 180" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-10 158C106 98 196 130 310 63C390 16 455 36 532 8" stroke="#0F6693" strokeOpacity=".18" /><path d="M-10 170C125 118 221 151 334 79" stroke="#58A90E" strokeOpacity=".42" strokeDasharray="4 9" /><circle cx="334" cy="79" r="4" fill="#58A90E" /></svg></div>
      <div className="pointer-events-none absolute -left-10 top-[8.5rem] hidden h-52 w-52 opacity-60 lg:block" aria-hidden="true"><svg viewBox="0 0 220 220" className="h-full w-full" fill="none"><path d="M18 194A176 176 0 0 1 196 18" stroke="#0F6693" strokeOpacity=".26" /><path d="M18 194L68 101M18 194L118 64M18 194L166 37" stroke="#58A90E" strokeOpacity=".55" strokeDasharray="3 7" /><circle cx="18" cy="194" r="5" fill="#58A90E" /></svg></div>
      <div className="container relative">
        <div className="pointer-events-none absolute -left-3 bottom-12 top-[15rem] hidden w-11 lg:block" aria-hidden="true"><svg viewBox="0 0 44 1440" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M23 0C5 106 36 194 19 304C4 399 33 489 18 597C3 709 35 804 21 912C6 1024 35 1123 18 1240C12 1302 20 1375 25 1440" stroke="#0F6693" strokeOpacity=".26" strokeWidth="1.2" /><path d="M25 22C14 144 32 210 21 318M21 726C32 822 8 919 23 1009M21 1220C14 1302 20 1364 25 1428" stroke="#58A90E" strokeOpacity=".82" strokeDasharray="4 10" /><circle cx="21" cy="318" r="5" fill="#58A90E" /><circle cx="23" cy="1009" r="3.5" fill="#0F6693" /><circle cx="25" cy="1428" r="5" fill="#58A90E" /></svg><span className="absolute left-6 top-[21%] -rotate-90 whitespace-nowrap text-[0.5rem] font-extrabold uppercase tracking-[0.16em] text-[#54758A]">Route / live readings</span><span className="absolute left-6 top-[67%] -rotate-90 whitespace-nowrap text-[0.5rem] font-extrabold uppercase tracking-[0.16em] text-[#54758A]">Datum / equipment basis</span></div>
        <div className="field-instrument-header relative grid gap-8 overflow-hidden border-b border-[#C6D7CF] pb-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden h-16 opacity-70 lg:block" aria-hidden="true"><svg viewBox="0 0 1140 64" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-20 60C146 11 247 68 408 29C572 -11 673 55 838 20C954 -4 1058 22 1160 4" stroke="#0F6693" strokeOpacity=".16" /><path d="M-20 62C152 22 250 72 414 38C576 2 680 61 844 29" stroke="#58A90E" strokeOpacity=".52" strokeDasharray="5 11" /><circle cx="844" cy="29" r="4" fill="#58A90E" /></svg></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-[#58A90E]" /><p className="eyebrow">05 / System design workbench</p></div>
            <h2 className="mt-5 max-w-[610px] font-display text-5xl leading-[0.95] tracking-[-0.045em] text-[#082C67] sm:text-6xl">Map an indicative solar system around your real load.</h2>
          </div>
          <div className="relative z-10">
            <p className="max-w-[590px] text-base leading-8 text-[#527087]">Build an early sizing basis from daily energy, simultaneous peak demand, a location-aware solar resource input, and editable engineering factors. The resulting bill of quantity is a conversation starter—not a final installation design.</p>
            <div className="mt-5 flex items-start gap-3 border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#5E7B88]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#58A90E]" />Final designs require a qualified engineer to confirm site, structural, protection, cable, earthing, equipment, and code requirements.</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#D5E1DB] bg-[#082C67] px-4 py-3 text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[#B9CCDC]"><span className="flex items-center gap-2 text-white"><span className="sunburst-mark !border-white/40 !bg-[#CBEF7B]" />Route / 05A</span><span className="text-[#CBEF7B]">Coordinates</span><span className="h-px w-6 bg-[#CBEF7B]" /> <span>Load and surge</span><span className="h-px w-6 bg-[#CBEF7B]" /> <span>Loss stack</span><span className="h-px w-6 bg-[#CBEF7B]" /> <span>Equipment screen</span></div>
        <section aria-label="Current design readings" className="relative mt-5 overflow-hidden border border-[#0F6693]/25 bg-[#EAF1ED] p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full border border-[#0F6693]/15" aria-hidden="true" />
          <div className="relative grid gap-4 sm:grid-cols-[1.15fr_.85fr_.85fr_.85fr] sm:items-end"><div><p className="eyebrow">Live reading / design route</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">The system is reading the active schedule before equipment is screened.</p></div><div className="border-l border-[#B9CBD0] pl-4"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Demand</p><p className="mt-1 text-2xl font-extrabold text-[#082C67]">{number(totals.dailyEnergy, 2)} <span className="text-xs">kWh/day</span></p></div><div className="border-l border-[#B9CBD0] pl-4"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Solar resource</p><p className="mt-1 text-2xl font-extrabold text-[#082C67]">{number(peakSunHours, 2)} <span className="text-xs">PSH</span></p></div><div className="border-l border-[#58A90E] pl-4"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Reserve</p><p className="mt-1 text-2xl font-extrabold text-[#3F7D0C]">{number(totals.batteryKwh, 2)} <span className="text-xs">kWh</span></p></div></div>
        </section>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.27fr_0.73fr]">
          <div className="min-w-0 space-y-8">
            <section className="paper-card p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D6E2DB] pb-5"><div><p className="eyebrow">Field coordinate / solar resource</p><h3 className="mt-2 text-xl font-extrabold text-[#082C67]">Location and insolation</h3></div><div className="flex items-center gap-2"><span className="hidden border border-[#0F6693]/20 px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D] sm:block">DATUM A</span><span className="rounded-full bg-[#E5F6BB] px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#3F7D0C]">NASA POWER ready</span></div></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D] sm:col-span-2">Location label<input value={location} onChange={(event) => setLocation(event.target.value)} className="field-input mt-2 font-bold" placeholder="City, site, or project name" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Latitude<input type="number" min="-90" max="90" step="0.0001" value={latitude} onChange={(event) => setLatitude(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Longitude<input type="number" min="-180" max="180" step="0.0001" value={longitude} onChange={(event) => setLongitude(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
              </div>
              <div className="mt-6 border-t border-[#D6E2DB] pt-5">
                <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">BoQ cover details</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Client and project record</h4></div><p className="max-w-[265px] text-right text-xs leading-5 text-[#638093]">These details appear on the branded bill-of-quantity cover page.</p></div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2"><label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Customer name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="field-input mt-2 font-bold" placeholder="Customer or organisation" /></label><label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Project location<input value={projectLocation} onChange={(event) => setProjectLocation(event.target.value)} className="field-input mt-2 font-bold" placeholder="Site address or project area" /></label></div>
                <div className="mt-5 border-t border-[#D6E2DB] pt-5 sm:grid sm:grid-cols-2 sm:gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">BoQ cover format</p><Select value={boqCoverType} onValueChange={(value) => setBoqCoverType(value as BoqCoverType)}><SelectTrigger aria-label="BoQ cover format" className="mt-2 h-11 w-full rounded-none border-0 border-b border-[#B8C7D4] bg-transparent px-0 font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">Standard energy project</SelectItem><SelectItem value="tower-site">Telecom tower site</SelectItem></SelectContent></Select><p className="mt-2 text-xs leading-5 text-[#638093]">Tower-site format adds a tower reference and operational context to the export cover.</p></div>{boqCoverType === "tower-site" && <div className="mt-5 grid gap-5 sm:mt-0"><label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Tower reference<input value={towerReference} onChange={(event) => setTowerReference(event.target.value)} className="field-input mt-2 font-bold" placeholder="e.g. LAG-ODJ-014" /></label><label className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Operational context<input value={towerOperationalContext} onChange={(event) => setTowerOperationalContext(event.target.value)} className="field-input mt-2 font-bold" placeholder="e.g. Rooftop shared telecom site" /></label></div>}</div>
                <div className="mt-4 flex flex-wrap items-center gap-3"><Button type="button" variant="outline" onClick={lookupProjectCoordinates} disabled={!geocodeReady || geocodeLoading} className="h-10 rounded-none border-[#B9CBD0] bg-white px-4 text-xs font-extrabold text-[#244F72] hover:bg-[#EDF5E0] disabled:opacity-60"><MapPin className="mr-2 h-3.5 w-3.5 text-[#58A90E]" />{geocodeLoading ? "Locating…" : geocodeReady ? "Load approximate coordinates" : "Preparing location lookup…"}</Button><p className="max-w-[580px] text-xs leading-5 text-[#638093]">{geocodeNote}</p></div>
              </div>
              <div className="mt-6 flex flex-col gap-5 border-t border-[#D6E2DB] pt-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-1 items-end gap-3"><label className="w-full max-w-[220px] text-xs font-extrabold uppercase tracking-[0.13em] text-[#345E7D]">Peak-sun-hours<input type="number" min="0" step="0.01" value={peakSunHours} onChange={(event) => setPeakSunHours(Number(event.target.value))} className="field-input mt-2 font-bold" /></label><span className="pb-3 text-sm font-bold text-[#527087]">kWh/m²/day</span></div><Button type="button" onClick={lookupInsolation} disabled={insolationLoading} className="h-11 rounded-none bg-[#082C67] px-5 text-xs font-extrabold text-white hover:bg-[#0D3D83] active:scale-[.97]"><MapPin className="mr-2 h-3.5 w-3.5" />{insolationLoading ? "Looking up…" : "Look up insolation"}</Button></div>
              <p className="mt-4 text-xs leading-5 text-[#638093]">{insolationNote}</p>
              <div className="mt-4 border-l-2 border-[#58A90E] bg-[#F7FAF7] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-[640px]"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Conservative rainy-season planning</p><p className="mt-2 text-xs leading-5 text-[#58758A]">{rainySeasonResource.length > 0 && !rainySeasonResourceIsCurrent ? "The saved historical scenarios belong to a different coordinate. Reload them before using a rainy-season probability case at this point. " : ""}{rainySeasonNote}</p></div><Button type="button" variant="outline" onClick={loadRainySeasonScenarios} disabled={rainySeasonLoading} className="h-11 shrink-0 rounded-none border-[#0F6693] bg-white px-4 text-xs font-extrabold text-[#082C67] hover:bg-[#EDF7D2]"><SunMedium className="mr-2 h-3.5 w-3.5 text-[#58A90E]" />{rainySeasonLoading ? "Reading history…" : "Record rainy scenarios"}</Button></div>
                <div className="mt-4 border-t border-[#D6E2DB] pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Rainy-month window</p><p className="mt-1 text-xs leading-5 text-[#638093]">Choose the automatically derived lowest-resource months, or record a local operating window for the same historical analysis.</p></div><div className="flex border border-[#B8C7D4] bg-white p-1" role="group" aria-label="Rainy-month window mode"><button type="button" onClick={() => setRainyMonthMode("automatic")} aria-pressed={rainyMonthMode === "automatic"} className={`px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] transition-colors ${rainyMonthMode === "automatic" ? "bg-[#082C67] text-white" : "text-[#527087] hover:bg-[#EDF7D2]"}`}>Auto low-resource</button><button type="button" onClick={() => setRainyMonthMode("custom")} aria-pressed={rainyMonthMode === "custom"} className={`px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] transition-colors ${rainyMonthMode === "custom" ? "bg-[#082C67] text-white" : "text-[#527087] hover:bg-[#EDF7D2]"}`}>Custom months</button></div></div>
                  {rainyMonthMode === "custom" && <fieldset className="mt-4"><legend className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Select the months to include</legend><div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{rainyMonthOptions.map((month, monthIndex) => { const selected = customRainyMonths.includes(monthIndex); return <button key={month} type="button" onClick={() => setCustomRainyMonths((current) => selected ? current.length > 1 ? current.filter((item) => item !== monthIndex) : current : normaliseRainyMonthSelection([...current, monthIndex]))} aria-pressed={selected} className={`border px-2 py-2.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] transition-colors ${selected ? "border-[#58A90E] bg-[#E5F6BB] text-[#3F7D0C]" : "border-[#C9D6D8] bg-white text-[#58758A] hover:border-[#58A90E] hover:bg-[#F7FBF0]"}`}>{month}</button>; })}</div><p className="mt-3 text-xs leading-5 text-[#58758A]">{customRainyMonths.length} month{customRainyMonths.length === 1 ? "" : "s"} selected: <strong className="text-[#244F72]">{normaliseRainyMonthSelection(customRainyMonths).map((monthIndex) => rainyMonthOptions[monthIndex]).join(", ")}</strong>. The analysis uses all valid NASA POWER daily observations in this selected window across the historical record.</p></fieldset>}
                </div>
              </div>
            </section>

            <section className="paper-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D6E2DB] px-5 py-5 sm:px-7"><div><p className="eyebrow">Load schedule / AC demand</p><h3 className="mt-2 text-xl font-extrabold text-[#082C67]">Appliance load calculator</h3><p className="mt-1 max-w-[560px] text-xs leading-5 text-[#638093]">Select a load type to apply an editable starting profile. Each profile explains its typical starting assumption below; always confirm nameplate data and actual operating patterns.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={resetLoadsToDefaults} className="h-10 rounded-none border-[#B9CBD0] bg-white px-4 text-xs font-extrabold text-[#244F72] hover:bg-[#F2F7ED]"><RotateCw className="mr-2 h-3.5 w-3.5 text-[#58A90E]" />Reset to Default</Button><Button type="button" variant="outline" onClick={addLoad} className="h-10 rounded-none border-[#B9CBD0] bg-white px-4 text-xs font-extrabold text-[#082C67] hover:bg-[#EDF5E0]"><Plus className="mr-2 h-3.5 w-3.5" />Add load</Button></div></div>
              <section aria-label="Guided load wizard" className="border-b border-[#D6E2DB] bg-[#F7FAF7] px-5 py-5 sm:px-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Quick start / load wizard</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Begin with a typical site pattern</h4><p className="mt-1 max-w-[520px] text-xs leading-5 text-[#638093]">Step 1: choose a site type. Step 2: choose a starting profile, then refine every load against actual equipment and operating hours.</p></div><span className="border border-[#B8D8A3] bg-[#EDF7D2] px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Planning start only</span></div><div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose load wizard site type"><button type="button" onClick={() => setWizardAudience("home")} aria-pressed={wizardAudience === "home"} className={`border px-4 py-2 text-xs font-extrabold transition-colors ${wizardAudience === "home" ? "border-[#082C67] bg-[#082C67] text-white" : "border-[#B8C7D4] bg-white text-[#527087] hover:border-[#58A90E]"}`}>Home</button><button type="button" onClick={() => setWizardAudience("business")} aria-pressed={wizardAudience === "business"} className={`border px-4 py-2 text-xs font-extrabold transition-colors ${wizardAudience === "business" ? "border-[#082C67] bg-[#082C67] text-white" : "border-[#B8C7D4] bg-white text-[#527087] hover:border-[#58A90E]"}`}>Business</button></div><div className="mt-3 grid gap-3 sm:grid-cols-2">{guidedLoadProfiles.filter((profile) => profile.audience === wizardAudience).map((profile) => <button key={profile.id} type="button" onClick={() => applyGuidedLoadProfile(profile)} className="group border border-[#D6E2DB] bg-white p-4 text-left transition-colors hover:border-[#58A90E] hover:bg-[#F7FBF0]"><span className="block text-sm font-extrabold text-[#082C67]">{profile.label}</span><span className="mt-1 block text-xs leading-5 text-[#638093]">{profile.note}</span><span className="mt-3 inline-flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#3F7D0C]">Load this schedule <span aria-hidden="true">→</span></span></button>)}</div></section>
              <section aria-label="Appliance database" className="border-b border-[#D6E2DB] bg-white px-5 py-5 sm:px-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Appliance database / field library</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Find and add a load profile</h4><p className="mt-1 max-w-[520px] text-xs leading-5 text-[#638093]">Search by appliance, power use, or category. Adding a profile creates a new editable row; it does not overwrite the current schedule.</p></div><span className="border border-[#CDE0D4] bg-[#F7FAF7] px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">{filteredApplianceCatalogue.length} profiles</span></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_200px]"><label className="relative block"><span className="sr-only">Search appliance database</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#54758A]" /><input value={catalogueSearch} onChange={(event) => setCatalogueSearch(event.target.value)} className="field-input h-11 pl-10 font-bold" placeholder="Search lighting, pump, freezer, office…" /></label><Select value={catalogueCategory} onValueChange={setCatalogueCategory}><SelectTrigger aria-label="Filter appliance database by category" className="h-11 w-full rounded-none border-0 border-b border-[#B8C7D4] bg-transparent px-0 font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{applianceCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{filteredApplianceCatalogue.slice(0, 8).map((preset) => <div key={preset.id} className="flex items-center justify-between gap-3 border border-[#D6E2DB] bg-[#FBFCF8] p-3"><div className="min-w-0"><p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">{preset.category}</p><p className="mt-1 truncate text-xs font-extrabold text-[#082C67]">{preset.label}</p><p className="mt-1 text-[0.68rem] text-[#638093]">{preset.dayHours} h day · {preset.nightHours} h night · {preset.surgeFactor.toFixed(1)}× surge</p></div><button type="button" onClick={() => addApplianceFromCatalogue(preset)} className="shrink-0 border border-[#082C67] bg-white px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-[#082C67] transition-colors hover:border-[#58A90E] hover:bg-[#EDF7D2]">Add</button></div>)}{filteredApplianceCatalogue.length === 0 && <div className="border border-dashed border-[#B8C7D4] px-4 py-5 text-center text-xs text-[#638093] sm:col-span-2">No appliance profile matches that search. Add a custom load and use the equipment nameplate for starting values.</div>}</div>{filteredApplianceCatalogue.length > 8 && <p className="mt-3 text-xs leading-5 text-[#638093]">Showing the first 8 matches. Refine the search or select a category to narrow the appliance database.</p>}<div className="mt-5 border-t border-[#D6E2DB] pt-5"><p className="eyebrow">Local category manager</p><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={customCategoryName} onChange={(event) => setCustomCategoryName(event.target.value)} className="field-input h-10 flex-1 font-bold" placeholder="Create a custom category, e.g. Security" /><button type="button" onClick={addCustomCategory} className="border border-[#082C67] bg-[#082C67] px-4 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0D3D83]">Add category</button></div>{customCategories.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{customCategories.map((category) => <span key={category} className="inline-flex items-center gap-2 border border-[#B8D8A3] bg-[#F7FBF0] px-2 py-1 text-[0.62rem] font-extrabold text-[#3F7D0C]">{category}<button type="button" onClick={() => removeCustomCategory(category)} aria-label={`Remove custom category ${category}`} className="text-[#54758A] hover:text-[#B54C32]">×</button></span>)}</div>}<p className="mt-3 text-xs leading-5 text-[#638093]">Custom categories and saved custom appliance profiles stay in this browser only.</p></div></section>
              <div className="relative overflow-hidden bg-[#082C67] px-5 py-5 text-white shadow-[0_20px_42px_rgba(8,44,103,0.2)] ring-1 ring-[#58A90E]/35 sm:px-7">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-35" aria-hidden="true"><svg viewBox="0 0 440 120" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-8 104C96 42 184 112 292 50C348 18 388 36 450 12" stroke="white" strokeOpacity=".5" /><path d="M-8 112C108 58 196 120 318 64" stroke="#CBEF7B" strokeDasharray="4 9" /><circle cx="318" cy="64" r="4" fill="#CBEF7B" /></svg></div>
                <div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow !text-[#CBEF7B]">Measured load / 05A</p><p className="mt-2 max-w-[330px] text-sm leading-5 text-[#C0D2DF]">This field reading separates the energy route from the overload route before equipment is screened.</p></div><div className="grid min-w-[270px] grid-cols-3 divide-x divide-white/15 border border-white/15 bg-[#071F4B]/55"><div className="px-3 py-3"><p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Daily demand</p><p className="mt-1 text-lg font-extrabold">{number(totals.dailyEnergy, 2)}<span className="ml-1 text-xs text-[#C0D2DF]">kWh</span></p></div><div className="px-3 py-3"><p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Overload lock</p><p className="mt-1 text-lg font-extrabold text-[#CBEF7B]">{number(requiredInverterWatts)}<span className="ml-1 text-xs text-[#C0D2DF]">W</span></p></div><div className="px-3 py-3"><p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Hold window</p><p className="mt-1 text-lg font-extrabold">{number(totals.governingSurgeDurationSec, 1)}<span className="ml-1 text-xs text-[#C0D2DF]">s</span></p></div></div></div>
              </div>
              <div className="field-instrument-chart grid gap-5 border-b border-[#D6E2DB] px-5 py-5 sm:grid-cols-[0.82fr_1.18fr] sm:px-7"><div><div className="flex items-center gap-2"><span className="sunburst-mark" /><p className="eyebrow">Load profile / daily energy</p></div><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Where the daily energy goes</h4><p className="mt-2 max-w-[260px] text-xs leading-5 text-[#638093]">This live split updates whenever appliance power, quantity, operating hours, or utilisation changes.</p><div className="mt-4 space-y-2">{loadEnergyBreakdown.map((item) => <div key={`load-legend-${item.id}`} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 font-bold text-[#345E7D]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /> <span className="truncate">{item.name}</span></span><span className="shrink-0 font-extrabold text-[#082C67]">{number(item.value, 2)} kWh</span></div>)}</div></div><div className="relative min-h-[220px]" role="img" aria-label="Daily energy consumption breakdown by appliance"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={loadEnergyBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={3} stroke="none">{loadEnergyBreakdown.map((item) => <Cell key={`load-cell-${item.id}`} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Measured total</p><p className="mt-1 text-2xl font-extrabold text-[#082C67]">{number(totals.dailyEnergy, 2)}</p><p className="text-xs font-bold text-[#527087]">kWh/day</p></div></div></div></div>
              <div className="hidden flex-wrap items-center justify-between gap-2 border-b border-[#D6E2DB] bg-[#F7FAF7] px-5 py-2 text-[0.63rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A] md:flex sm:px-7"><span>Wide schedule / contained view</span><span className="text-[#3F7D0C]">Use the active slider below to view all inputs →</span></div>
              <div ref={scheduleScrollRef} onScroll={handleScheduleScroll} className="load-schedule-scroll hidden w-full max-w-full overflow-x-auto overflow-y-hidden md:block" role="region" aria-label="Scrollable appliance load schedule" tabIndex={0}>
                <table className="min-w-[1260px] w-full text-left">
                  <thead className="bg-[#EAF1ED] text-[0.61rem] font-extrabold uppercase tracking-[0.12em] text-[#466477]"><tr><th className="sticky left-0 z-20 w-[252px] bg-[#EAF1ED] px-5 py-3 text-left shadow-[7px_0_10px_rgba(8,44,103,0.05)] sm:px-7"><LoadHeaderHelp align="left" label="Selected load" description="Choose a starting appliance profile, then edit any input to match the site." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Watts" description="The appliance’s running power rating in watts." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Qty" description="How many identical appliances are included in this row." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Day h" description="Average operating hours during solar-producing daylight." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Night h" description="Average operating hours after solar production, creating battery-supported energy demand." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Daily use %" description="Share of the entered day and night hours when the appliance actually runs. It reduces daily energy, not the coincident power check." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Simult. %" description="Share of this load expected to run at the same moment as other loads. It sets coincident watts for inverter sizing, not daily kWh." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Surge factor" description="Start-up multiplier applied to the row’s simultaneous watts. Use the equipment manufacturer’s guidance where available." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Surge s" description="Expected duration of the start-up surge. The longest active duration is used when screening inverter overload capability." /></th><th className="px-4 py-3 text-right"><LoadHeaderHelp label="Daily kWh" description="Daily energy for this row: watts × quantity × operating hours × daily-use percentage ÷ 1,000." /></th><th className="px-2 py-3 text-right"><LoadHeaderHelp label="Surge W" description="Row start-up power: watts × quantity × simultaneous-use percentage × surge factor. Active rows are summed for the inverter basis." /></th><th className="px-5 py-3 text-right sm:px-7"><span className="sr-only">Remove load</span></th></tr></thead>
                  <tbody>{loads.map((row, index) => {
                    const isFirstRow = index === 0;
                    const firstRowExplanationOpen = firstRowHovered || firstRowExplanationPinned;
                    const safeWatts = Math.max(0, row.watts);
                    const safeQuantity = Math.max(0, row.quantity);
                    const safeDayHours = Math.max(0, row.dayHours);
                    const safeNightHours = Math.max(0, row.nightHours);
                    const safeUtilisation = Math.min(100, Math.max(0, row.utilisation));
                    const safeSimultaneous = Math.min(100, Math.max(0, row.simultaneous));
                    const safeSurgeFactor = [1.2, 2, 3].includes(row.surgeFactor) ? row.surgeFactor : 1.2;
                    const safeSurgeDurationSec = Math.max(0, row.surgeDurationSec || 0);
                    const rowEnergy = safeWatts * safeQuantity * (safeDayHours + safeNightHours) * (safeUtilisation / 100) / 1000;
                    const rowDayEnergy = safeWatts * safeQuantity * safeDayHours * (safeUtilisation / 100) / 1000;
                    const rowNightEnergy = safeWatts * safeQuantity * safeNightHours * (safeUtilisation / 100) / 1000;
                    const rowSurgeWatts = safeDayHours > 0 || safeNightHours > 0 ? safeWatts * safeQuantity * (safeSimultaneous / 100) * safeSurgeFactor : 0;
                    return <Fragment key={row.id}>
                      <tr
                        className={`border-b border-[#E0E9E4] transition-colors ${isFirstRow ? "bg-[#F5FAEC]/80 hover:bg-[#EEF7D8] focus-within:bg-[#EEF7D8]" : ""}`}
                        onMouseEnter={isFirstRow ? () => setFirstRowHovered(true) : undefined}
                        onMouseLeave={isFirstRow ? () => setFirstRowHovered(false) : undefined}
                        onFocusCapture={isFirstRow ? () => setFirstRowHovered(true) : undefined}
                        onBlurCapture={isFirstRow ? (event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFirstRowHovered(false); } : undefined}
                      ><td className={`sticky left-0 z-10 w-[252px] px-5 py-2 shadow-[7px_0_10px_rgba(8,44,103,0.05)] sm:px-7 ${isFirstRow ? "bg-[#F5FAEC]" : "bg-[#fffefd]"}`}><div className="flex items-center gap-2"><Select value={loadPresetId(row)} onValueChange={(value) => applyLoadPreset(row.id, value)}><SelectTrigger aria-label={`Select appliance type for ${row.item}`} aria-describedby={isFirstRow ? "first-load-formula" : undefined} title={applianceProfileGuidance[row.item] ?? "Choose an appliance profile or enter a custom load."} className="h-10 min-w-[190px] rounded-none border-0 border-b border-[#C9D6D8] bg-transparent px-1 text-left text-sm font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{searchableApplianceCatalogue.map((preset) => <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>)}<SelectItem value="custom">Custom load</SelectItem></SelectContent></Select>{isFirstRow && <button type="button" onClick={() => setFirstRowExplanationPinned((open) => !open)} aria-label={`Explain ${row.item} calculation`} aria-expanded={firstRowExplanationOpen} aria-controls="first-load-formula" className="grid h-8 w-8 shrink-0 place-items-center border border-[#A9C8A5] bg-white text-[#3F7D0C] transition-colors hover:bg-[#E5F6BB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58A90E]"><Info className="h-4 w-4" /></button>}</div></td><td className="px-2"><InputCell value={row.watts} onChange={(value) => updateLoad(row.id, "watts", value)} ariaLabel={`${row.item} watts`} /></td><td className="px-2"><InputCell value={row.quantity} onChange={(value) => updateLoad(row.id, "quantity", value)} ariaLabel={`${row.item} quantity`} /></td><td className="px-2"><InputCell value={row.dayHours} onChange={(value) => updateLoad(row.id, "dayHours", value)} step={0.25} ariaLabel={`${row.item} daytime hours`} /></td><td className="px-2"><InputCell value={row.nightHours} onChange={(value) => updateLoad(row.id, "nightHours", value)} step={0.25} ariaLabel={`${row.item} nighttime hours`} /></td><td className="px-2"><InputCell value={row.utilisation} onChange={(value) => updateLoad(row.id, "utilisation", value)} ariaLabel={`${row.item} daily use percentage`} /></td><td className="px-2"><InputCell value={row.simultaneous} onChange={(value) => updateLoad(row.id, "simultaneous", value)} ariaLabel={`${row.item} simultaneous use percentage`} /></td><td className="px-2"><Select value={String(safeSurgeFactor)} onValueChange={(value) => updateLoad(row.id, "surgeFactor", Number(value))}><SelectTrigger aria-label={`${row.item} surge factor`} className="h-10 min-w-[78px] rounded-none border-0 border-b border-[#C9D6D8] bg-transparent px-1 text-right text-sm font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1.2">1.2×</SelectItem><SelectItem value="2">2.0×</SelectItem><SelectItem value="3">3.0×</SelectItem></SelectContent></Select></td><td className="px-2"><InputCell value={safeSurgeDurationSec} onChange={(value) => updateLoad(row.id, "surgeDurationSec", value)} min={0} step={0.5} ariaLabel={`${row.item} surge duration in seconds`} /></td><td className="px-4 text-right text-sm font-extrabold text-[#244F72]">{number(rowEnergy, 2)}</td><td className="px-2 text-right text-sm font-extrabold text-[#3F7D0C]">{number(rowSurgeWatts)}</td><td className="px-5 text-right sm:px-7"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => duplicateLoad(row.id)} className="p-2 text-[#54758A] hover:text-[#3F7D0C]" aria-label={`Duplicate ${row.item}`}><Plus className="h-4 w-4" /></button><button type="button" onClick={() => removeLoad(row.id)} disabled={loads.length <= 1} className="p-2 text-[#7790A1] hover:text-[#B54C32] disabled:opacity-30" aria-label={`Remove ${row.item}`}><Trash2 className="h-4 w-4" /></button></div></td></tr>
                      {isFirstRow && firstRowExplanationOpen && <tr id="first-load-formula" className="bg-[#E7F2DD]"><td colSpan={12} className="px-5 py-4 sm:px-7"><div className="grid gap-4 border-l-2 border-[#58A90E] pl-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center"><div><p className="eyebrow">Live formula / first load</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">How {row.item} contributes to daily energy and inverter surge</p><p className="mt-1 text-xs leading-5 text-[#527087]">Hover, focus, or use the information control to inspect the current arithmetic.</p></div><div className="border border-[#C5DDB8] bg-white/80 px-4 py-3"><p className="font-mono text-xs font-bold leading-6 text-[#244F72]">({number(safeWatts)} W × {number(safeQuantity)} × ({number(safeDayHours, 2)} h + {number(safeNightHours, 2)} h) × {number(safeUtilisation)}%) ÷ 1,000</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">= {number(rowEnergy, 2)} kWh / day <span className="ml-2 text-xs font-normal text-[#527087]">({number(rowDayEnergy, 2)} kWh day · {number(rowNightEnergy, 2)} kWh night)</span></p><p className="mt-2 font-mono text-xs font-bold leading-6 text-[#3F7D0C]">{number(safeWatts)} W × {number(safeQuantity)} × {number(safeSimultaneous)}% × {number(safeSurgeFactor, 1)}× = {number(rowSurgeWatts)} W for {number(safeSurgeDurationSec, 1)} s</p><p className="mt-2 text-[0.68rem] leading-5 text-[#58758A]">Daily energy is separate from inverter surge. The calculator uses the longest active surge duration to screen documented inverter overload ratings after applying inverter headroom.</p></div></div></td></tr>}
                    </Fragment>;
                  })}</tbody>
                  <tfoot><tr className="bg-[#082C67] text-white"><td colSpan={9} className="px-5 py-4 text-sm font-extrabold sm:px-7">Calculated daily AC energy demand / combined surge basis</td><td className="px-4 py-4 text-right font-display text-2xl">{number(totals.dailyEnergy, 2)} kWh</td><td className="px-2 py-4 text-right font-display text-2xl text-[#CBEF7B]">{number(totals.surgePeakWatts)} W</td><td /></tr></tfoot>
                </table>
              </div>
              <div className="hidden border-b border-[#D6E2DB] bg-[#F7FAF7] px-5 py-4 md:block sm:px-7"><div className="flex items-center justify-between gap-4"><div><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Horizontal schedule control</p><p className="mt-1 text-xs text-[#638093]">Drag the active slider to move the schedule while appliance names remain fixed.</p></div><span className="shrink-0 text-xs font-extrabold text-[#3F7D0C]">{number((scheduleScrollLeft / Math.max(scheduleScrollMax, 1)) * 100)}% across</span></div><input type="range" min="0" max="100" step="1" value={(scheduleScrollLeft / Math.max(scheduleScrollMax, 1)) * 100} onChange={(event) => setScheduleScrollFromSlider(Number(event.target.value))} aria-label="Move appliance load schedule horizontally" className="schedule-scroll-slider mt-3 h-3 w-full" /></div>
              <section aria-label="Daytime and nighttime energy breakdown" className="border-b border-[#D6E2DB] bg-[#FBFCF8] px-5 py-6 sm:px-7"><div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center"><div><p className="eyebrow">Energy route / day → night</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">When your energy is used</h4><p className="mt-2 text-xs leading-5 text-[#638093]">Daytime energy is a solar-direct demand. Nighttime energy is the battery-supported dependency used in the storage calculation.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs"><span className="font-extrabold text-[#0F6693]"><i className="mr-2 inline-block h-2.5 w-2.5 bg-[#0F6693]" />Day {number(totals.dayEnergy, 2)} kWh</span><span className="font-extrabold text-[#58A90E]"><i className="mr-2 inline-block h-2.5 w-2.5 bg-[#58A90E]" />Night {number(totals.nightEnergy, 2)} kWh</span></div></div><div className="h-[250px]" role="img" aria-label="Stacked chart comparing daytime and nighttime energy consumption by appliance"><ResponsiveContainer width="100%" height="100%"><BarChart data={dayNightEnergyBreakdown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="#DCE6E2" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="name" tick={{ fill: "#54758A", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#C9D6D8" }} interval={0} angle={-18} textAnchor="end" height={62} /><YAxis tick={{ fill: "#54758A", fontSize: 10 }} tickLine={false} axisLine={false} width={38} /><RechartsTooltip cursor={{ fill: "#EAF4DE" }} formatter={(value: number) => [`${number(value, 2)} kWh`, ""]} contentStyle={{ borderRadius: 0, border: "1px solid #B8D8A3", color: "#082C67", fontSize: 12 }} /><Bar dataKey="daytime" stackId="energy" fill="#0F6693" radius={[0, 0, 0, 0]} /><Bar dataKey="nighttime" stackId="energy" fill="#58A90E" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div></div></section>
              <div className="space-y-3 p-4 md:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-[#D6E2DB] pb-3 text-[0.63rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]"><span>Compact load editor</span><button type="button" onClick={() => setMobileFieldGuideOpen((open) => !open)} aria-expanded={mobileFieldGuideOpen} aria-controls="mobile-load-field-guide" className="inline-flex items-center gap-1.5 border border-[#B8D8A3] bg-[#F7FBF0] px-2.5 py-1.5 text-[0.58rem] font-extrabold tracking-[0.1em] text-[#3F7D0C]"><Info className="h-3 w-3" />{mobileFieldGuideOpen ? "Close field help" : "Field help"}</button></div>
                {mobileFieldGuideOpen && <section id="mobile-load-field-guide" className="border-l-2 border-[#58A90E] bg-[#F7FAF7] p-4 text-xs text-[#527087]"><p className="eyebrow">Tap guide / load fields</p><div className="mt-3 space-y-3">{mobileFieldDefinitions.map(([label, description]) => <div key={label}><p className="font-extrabold text-[#082C67]">{label}</p><p className="mt-0.5 leading-5">{description}</p></div>)}</div></section>}
                {loads.map((row, index) => {
                  const isFirstRow = index === 0;
                  const safeWatts = Math.max(0, row.watts);
                  const safeQuantity = Math.max(0, row.quantity);
                  const safeDayHours = Math.max(0, row.dayHours);
                  const safeNightHours = Math.max(0, row.nightHours);
                  const safeUtilisation = Math.min(100, Math.max(0, row.utilisation));
                  const safeSimultaneous = Math.min(100, Math.max(0, row.simultaneous));
                  const safeSurgeFactor = [1.2, 2, 3].includes(row.surgeFactor) ? row.surgeFactor : 1.2;
                  const safeSurgeDurationSec = Math.max(0, row.surgeDurationSec || 0);
                  const rowEnergy = safeWatts * safeQuantity * (safeDayHours + safeNightHours) * (safeUtilisation / 100) / 1000;
                  const rowDayEnergy = safeWatts * safeQuantity * safeDayHours * (safeUtilisation / 100) / 1000;
                  const rowNightEnergy = safeWatts * safeQuantity * safeNightHours * (safeUtilisation / 100) / 1000;
                  const rowSurgeWatts = safeDayHours > 0 || safeNightHours > 0 ? safeWatts * safeQuantity * (safeSimultaneous / 100) * safeSurgeFactor : 0;
                  const firstRowExplanationOpen = firstRowHovered || firstRowExplanationPinned;
                  return <article key={`mobile-${row.id}`} className={`border border-[#D6E2DB] p-4 ${isFirstRow ? "bg-[#F5FAEC]" : "bg-[#fffefd]"}`}>
                    <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.13em] text-[#54758A]">Load {String(index + 1).padStart(2, "0")}</p><Select value={loadPresetId(row)} onValueChange={(value) => applyLoadPreset(row.id, value)}><SelectTrigger aria-label={`Select appliance type for ${row.item}`} title={applianceProfileGuidance[row.item] ?? "Choose an appliance profile or enter a custom load."} className="mt-1 h-10 w-full rounded-none border-0 border-b border-[#C9D6D8] bg-transparent px-0 text-left text-sm font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{applianceCatalogue.map((preset) => <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>)}<SelectItem value="custom">Custom load</SelectItem></SelectContent></Select><p className="mt-2 text-[0.68rem] leading-4 text-[#638093]">{applianceProfileGuidance[row.item] ?? "Custom profile: enter confirmed rating, schedule, and start-up characteristics."}</p></div>{isFirstRow && <button type="button" onClick={() => setFirstRowExplanationPinned((open) => !open)} aria-label={`Explain ${row.item} calculation`} aria-expanded={firstRowExplanationOpen} className="mt-5 grid h-9 w-9 shrink-0 place-items-center border border-[#A9C8A5] bg-white text-[#3F7D0C]"><Info className="h-4 w-4" /></button>}<button type="button" onClick={() => removeLoad(row.id)} disabled={loads.length <= 1} className="mt-5 p-2 text-[#7790A1] disabled:opacity-30" aria-label={`Remove ${row.item}`}><Trash2 className="h-4 w-4" /></button></div>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4"><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Watts<input type="number" min="0" step="1" value={row.watts} onChange={(event) => updateLoad(row.id, "watts", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Quantity<input type="number" min="0" step="1" value={row.quantity} onChange={(event) => updateLoad(row.id, "quantity", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Daytime hours<input type="number" min="0" step="0.25" value={row.dayHours} onChange={(event) => updateLoad(row.id, "dayHours", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Nighttime hours<input type="number" min="0" step="0.25" value={row.nightHours} onChange={(event) => updateLoad(row.id, "nightHours", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Daily use %<input type="number" min="0" max="100" step="1" value={row.utilisation} onChange={(event) => updateLoad(row.id, "utilisation", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Simultaneous %<input type="number" min="0" max="100" step="1" value={row.simultaneous} onChange={(event) => updateLoad(row.id, "simultaneous", Number(event.target.value))} className="field-input mt-1 font-bold" /></label><div className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Surge factor<Select value={String(safeSurgeFactor)} onValueChange={(value) => updateLoad(row.id, "surgeFactor", Number(value))}><SelectTrigger aria-label={`${row.item} surge factor`} className="mt-1 h-10 w-full rounded-none border-0 border-b border-[#C9D6D8] bg-transparent px-0 text-left text-sm font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1.2">1.2×</SelectItem><SelectItem value="2">2.0×</SelectItem><SelectItem value="3">3.0×</SelectItem></SelectContent></Select></div><label className="text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Surge seconds<input type="number" min="0" step="0.5" value={safeSurgeDurationSec} onChange={(event) => updateLoad(row.id, "surgeDurationSec", Number(event.target.value))} className="field-input mt-1 font-bold" /></label></div>
                    <div className="mt-4 grid grid-cols-2 border-t border-[#D6E2DB] pt-4"><div><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Daily energy</p><p className="mt-1 text-lg font-extrabold text-[#244F72]">{number(rowEnergy, 2)} <span className="text-xs">kWh</span></p></div><div className="border-l border-[#D6E2DB] pl-4"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Surge basis</p><p className="mt-1 text-lg font-extrabold text-[#3F7D0C]">{number(rowSurgeWatts)} <span className="text-xs">W</span></p></div></div>
                    {isFirstRow && firstRowExplanationOpen && <div className="mt-4 border-l-2 border-[#58A90E] bg-white/80 p-3 text-xs leading-5 text-[#527087]"><p className="font-mono font-bold text-[#244F72]">({number(safeWatts)} W × {number(safeQuantity)} × ({number(safeDayHours, 2)} h + {number(safeNightHours, 2)} h) × {number(safeUtilisation)}%) ÷ 1,000</p><p className="mt-2 font-extrabold text-[#082C67]">= {number(rowEnergy, 2)} kWh/day <span className="font-normal text-[#527087]">({number(rowDayEnergy, 2)} day · {number(rowNightEnergy, 2)} night)</span></p><p className="mt-2 font-mono font-bold text-[#3F7D0C]">{number(rowSurgeWatts)} W for {number(safeSurgeDurationSec, 1)} s</p></div>}
                  </article>;
                })}
              </div>
              <section aria-label="Circuit register" className="border-t border-[#D6E2DB] bg-[#F7FAF7] px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Circuit register / direct labels</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Name, duplicate, and document each load circuit</h4><p className="mt-1 max-w-[610px] text-xs leading-5 text-[#638093]">Every row has a circuit action card. Custom loads can carry a site-specific appliance name, category, and note into the saved library and branded BoQ.</p></div><div className="flex divide-x divide-[#C9D6D8] border border-[#C9D6D8] bg-white text-center"><div className="px-4 py-2"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Active circuits</p><p className="mt-1 text-lg font-extrabold text-[#082C67]">{number(activeCircuitCount)}</p></div><div className="px-4 py-2"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Appliance units</p><p className="mt-1 text-lg font-extrabold text-[#3F7D0C]">{number(totalApplianceQuantity)}</p></div></div></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{loads.map((row, index) => { const isCustomLoad = !applianceCatalogue.some((preset) => preset.item === row.item); return <div key={`circuit-${row.id}`} className="border border-[#D6E2DB] bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Circuit {String(index + 1).padStart(2, "0")}</p><p className="mt-1 text-[0.68rem] leading-4 text-[#638093]">{isCustomLoad ? "Custom load: name, category, notes, and all sizing inputs are editable." : "Default profile: wattage and all sizing inputs remain editable."}</p></div><span className={`shrink-0 px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.1em] ${isCustomLoad ? "bg-[#E5F6BB] text-[#3F7D0C]" : "bg-[#EFF4F2] text-[#54758A]"}`}>{isCustomLoad ? "Custom" : "Profile"}</span></div>{isCustomLoad && <><label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Custom load name<input value={row.item} onChange={(event) => updateLoad(row.id, "item", event.target.value)} className="field-input mt-2 font-bold normal-case tracking-normal" placeholder="e.g. Security lighting" aria-label={`Custom appliance name for circuit ${index + 1}`} /></label><div className="mt-4"><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Library category</p><Select value={row.category || "Custom"} onValueChange={(value) => updateLoad(row.id, "category", value)}><SelectTrigger aria-label={`Library category for ${row.item || `custom load ${index + 1}`}`} className="mt-2 h-10 w-full rounded-none border-0 border-b border-[#C9D6D8] bg-transparent px-0 text-left text-sm font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{applianceCategories.filter((category) => category !== "All").map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div><label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Custom-load note<input value={row.notes ?? ""} onChange={(event) => updateLoad(row.id, "notes", event.target.value)} className="field-input mt-2 font-bold normal-case tracking-normal" placeholder="e.g. East perimeter floodlight circuit" aria-label={`Custom load note for ${row.item || `circuit ${index + 1}`}`} /></label></>}<label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Circuit label<input value={row.circuitName} onChange={(event) => updateLoad(row.id, "circuitName", event.target.value)} className="field-input mt-2 font-bold normal-case tracking-normal" placeholder="e.g. Lighting circuit" aria-label={`Circuit name for ${row.item || `load ${index + 1}`}`} /></label><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => duplicateLoad(row.id)} className="inline-flex items-center border border-[#B8C7D4] bg-white px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-[#244F72] transition-colors hover:border-[#58A90E] hover:bg-[#EDF7D2]"><Plus className="mr-1.5 h-3.5 w-3.5" />Duplicate row</button>{isCustomLoad && <button type="button" onClick={() => saveCustomLoadToLibrary(row)} className="inline-flex items-center border border-[#082C67] bg-[#082C67] px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0D3D83]"><Save className="mr-1.5 h-3.5 w-3.5" />Save to library</button>}</div></div>; })}</div>
              </section>
              {loadWarnings.length > 0 && <section aria-label="Input review notices" className="border-t border-[#E6D4B4] bg-[#FFF9EE] px-5 py-5 sm:px-7"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#A86E16]" /><div><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#865C1B]">Input review / non-blocking</p><p className="mt-1 text-xs leading-5 text-[#6C5A40]">The calculator still works, but review these entries before using the sizing result or sharing a BoQ.</p></div></div><ul className="mt-4 space-y-2 border-l-2 border-[#D5A85A] pl-4 text-xs leading-5 text-[#735F40]">{loadWarnings.map((warning) => <li key={warning.id}><span className="font-extrabold text-[#865C1B]">{warning.load}:</span> {warning.message}</li>)}</ul></section>}
              <section aria-label="Load calculation guide" className="border-t border-[#D6E2DB] bg-[#F7FAF7] px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Formula guide / 05A</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">What these load factors change</h4></div><p className="max-w-[320px] text-xs leading-5 text-[#638093]">Energy factors size the solar array and battery. Power and surge factors size the inverter and generator path.</p></div>
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  <article className="border-l-2 border-[#0F6693] bg-white p-4"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Daily use %</p><p className="mt-2 text-xs leading-5 text-[#527087]">The share of the scheduled day and night hours when this appliance actually runs. It reduces <strong className="text-[#244F72]">daily energy only</strong>.</p><p className="mt-3 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">kWh/day = W × Qty × (Day h + Night h) × Daily use% ÷ 1,000</p></article>
                  <article className="border-l-2 border-[#58A90E] bg-white p-4"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Simultaneous %</p><p className="mt-2 text-xs leading-5 text-[#527087]">The share of that appliance load expected to operate at the same moment as other loads. It does <strong className="text-[#244F72]">not change kWh</strong>; it sets the starting power check.</p><p className="mt-3 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">Simultaneous W = W × Qty × Simultaneous%</p></article>
                  <article className="border-l-2 border-[#C4923F] bg-white p-4"><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#865C1B]">Surge basis</p><p className="mt-2 text-xs leading-5 text-[#527087]">A start-up <strong className="text-[#244F72]">power</strong> check in watts, not watt-hours. Each active row multiplies its simultaneous watts by the selected surge factor; the column is then summed.</p><p className="mt-3 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">Row surge W = Simultaneous W × Surge factor<br />Inverter W = Σ row surge W × (1 + headroom%)</p></article>
                </div>
                <div className="mt-4 flex items-start gap-3 border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#58758A]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#58A90E]" />Daytime hours contribute to direct solar demand; nighttime hours create battery-supported energy. <strong className="font-extrabold text-[#244F72]">Surge s</strong> records the expected start-up window, and the calculator uses the longest active duration when screening inverter overload ratings.</div>
                <div className="mt-5 border-t border-[#D6E2DB] pt-5"><p className="eyebrow">Worked examples / default starting profiles</p><p className="mt-2 text-xs leading-5 text-[#638093]">These examples explain the supplied starting values. All values in the load schedule remain editable for the actual site.</p><div className="mt-4 grid gap-3 lg:grid-cols-3"><article className="border border-[#D6E2DB] bg-white p-4"><p className="text-xs font-extrabold text-[#082C67]">LED lighting</p><p className="mt-2 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">12 W × 12 × 7 h × 100% ÷ 1,000 = 1.01 kWh/day</p><p className="mt-2 text-xs leading-5 text-[#58758A]">For inverter surge: 12 W × 12 × 85% × 1.2 = <strong className="text-[#3F7D0C]">147 W</strong> for 1 s.</p></article><article className="border border-[#D6E2DB] bg-white p-4"><p className="text-xs font-extrabold text-[#082C67]">Refrigeration</p><p className="mt-2 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">180 W × 1 × 12 h × 65% ÷ 1,000 = 1.40 kWh/day</p><p className="mt-2 text-xs leading-5 text-[#58758A]">For compressor start-up: 180 W × 1 × 70% × 3.0 = <strong className="text-[#3F7D0C]">378 W</strong> for 5 s.</p></article><article className="border border-[#D6E2DB] bg-white p-4"><p className="text-xs font-extrabold text-[#082C67]">Water pump</p><p className="mt-2 font-mono text-[0.68rem] font-bold leading-5 text-[#244F72]">750 W × 1 × 1 h × 100% ÷ 1,000 = 0.75 kWh/day</p><p className="mt-2 text-xs leading-5 text-[#58758A]">For motor start-up: 750 W × 1 × 80% × 3.0 = <strong className="text-[#3F7D0C]">1,800 W</strong> for 3 s.</p></article></div></div>
              </section>
              <section aria-label="Indicative 24-hour system simulation" className="border-t border-[#D6E2DB] bg-[#F7FAF7] px-5 py-6 sm:px-7">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Operating profile / 05C</p><h4 className="mt-2 text-xl font-extrabold text-[#082C67]">Simulate an indicative 24-hour energy route</h4><p className="mt-2 max-w-[650px] text-xs leading-5 text-[#638093]">This deterministic planning model rebalances the current load, array, usable battery, peak-sun-hours, losses, and backup pathway through one representative 24-hour cycle.</p></div><span className="border border-[#B8D8A3] bg-[#E5F6BB] px-2.5 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Live field reading</span></div>
                <div className="relative mt-5 overflow-hidden bg-[#082C67] px-5 py-5 text-white sm:px-6">
                  <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 opacity-70" aria-hidden="true"><svg viewBox="0 0 180 180" className="h-full w-full" fill="none"><circle cx="90" cy="90" r="64" stroke="white" strokeOpacity=".14" /><path d="M90 18V162M18 90H162M39 39L141 141M141 39L39 141" stroke="#CBEF7B" strokeOpacity=".38" strokeDasharray="3 7" /><path d="M90 90L151 54M90 90L133 139M90 90L54 151" stroke="white" strokeOpacity=".28" /><circle cx="90" cy="90" r="7" fill="#CBEF7B" /></svg></div>
                  <div className="relative flex flex-wrap items-end justify-between gap-4"><div><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[#CBEF7B]">Field station 05C / conservative operating record</p><p className="mt-2 max-w-[500px] text-sm font-bold leading-5 text-white">Read the low-resource route before changing the design basis.</p></div><span className="border border-white/20 bg-white/5 px-2.5 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#C0D2DF]">{activeRainySeasonScenario ? `${activeRainySeasonScenario.probability} historical case` : "Annual route"}</span></div>
                  <div className="relative mt-5 grid gap-4 border-t border-white/15 pt-4 sm:grid-cols-3"><div className="border-l border-[#CBEF7B] pl-3"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Active resource</p><p className="mt-1 text-2xl font-extrabold text-[#CBEF7B]">{number(simulationPeakSunHours, 2)} <span className="text-xs">PSH</span></p><p className="mt-1 text-[0.65rem] text-[#C0D2DF]">{activeResourceScenario.label}</p></div><div className="border-l border-white/20 pl-3"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Solar route</p><p className="mt-1 text-2xl font-extrabold">{number(energySimulation.potentialSolarKwh, 2)} <span className="text-xs">kWh</span></p><p className="mt-1 text-[0.65rem] text-[#C0D2DF]">potential energy this day</p></div><div className="border-l border-white/20 pl-3"><p className="text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#B9CCDC]">Reserve minimum</p><p className="mt-1 text-2xl font-extrabold">{number(energySimulation.minimumBatterySocPercent, 0)}<span className="text-xs">% SOC</span></p><p className="mt-1 text-[0.65rem] text-[#C0D2DF]">under the active route</p></div></div>
                </div>
                <div className="mt-5 grid gap-4 border-y border-[#D6E2DB] bg-white/70 px-4 py-4 sm:grid-cols-3 sm:px-5">
                  <div className="min-w-0 text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]"><p>Simulation solar resource</p><Select value={solarResourceScenario} onValueChange={selectSolarResourceScenario} onOpenChange={(open) => { if (!open) setResourceScenarioSearch(""); }}><SelectTrigger aria-label="Simulation solar resource" className="mt-2 h-auto min-h-10 w-full rounded-none border-[#B8C7D4] bg-white px-3 py-2 text-left text-xs font-bold normal-case tracking-normal text-[#082C67] whitespace-normal [&_[data-slot=select-value]]:line-clamp-2"><SelectValue /></SelectTrigger><SelectContent align="start" className="z-[90] w-[min(92vw,34rem)] max-w-[calc(100vw-2rem)] rounded-none border-[#0F6693]/40 bg-[#FCFCF8] p-1 shadow-[0_18px_42px_rgba(8,44,103,0.2)]"><div className="sticky top-0 z-10 border-b border-[#D6E2DB] bg-[#FCFCF8] p-2" onPointerDown={(event) => event.stopPropagation()}><div className="flex items-center gap-2 border border-[#B8C7D4] bg-white px-2.5"><Search className="h-3.5 w-3.5 shrink-0 text-[#58A90E]" /><input value={resourceScenarioSearch} onChange={(event) => setResourceScenarioSearch(event.target.value)} onKeyDown={(event) => event.stopPropagation()} aria-label="Search solar resource scenarios" placeholder="Find a month, season, or P90 case" className="h-9 min-w-0 flex-1 bg-transparent text-xs font-semibold normal-case tracking-normal text-[#082C67] outline-none placeholder:text-[#7890A0]" /></div></div>{filteredResourceScenarioOptions.length > 0 ? filteredResourceScenarioOptions.map((option) => <SelectItem key={option.id} value={option.id} className="whitespace-normal py-2.5 pr-8 text-xs leading-5 text-[#082C67]">{option.label} · {number(option.psh, 2)} PSH</SelectItem>) : <p className="px-3 py-5 text-xs font-medium normal-case tracking-normal text-[#638093]">No solar-resource scenario matches this search.</p>}</SelectContent></Select><div className="mt-2 flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 flex-1 text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]" title={`${activeResourceScenario.label} · ${number(simulationPeakSunHours, 2)} PSH`}>Active: {activeResourceScenario.label} · {number(simulationPeakSunHours, 2)} PSH</p><button type="button" onClick={clearResourceScenarioPreference} className="shrink-0 border-b border-[#B8C7D4] pb-0.5 text-[0.58rem] font-extrabold uppercase tracking-[0.09em] text-[#54758A] transition-colors hover:border-[#58A90E] hover:text-[#3F7D0C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A90E]">Forget preference</button></div></div>
                  <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Battery age<input type="number" min="0" max="20" step="1" value={batteryAgeYears} onChange={(event) => setBatteryAgeYears(Number(event.target.value))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">0–20 years in service</span></label>
                  <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Annual battery capacity fade<input type="number" min="0" max="10" step="0.1" value={batteryAnnualDegradation} onChange={(event) => setBatteryAnnualDegradation(Number(event.target.value))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">Deterministic planning rate: 0–10% / year</span></label>
                  <p className="sm:col-span-3 border-l-2 border-[#58A90E] pl-3 text-xs leading-5 text-[#58758A]">The selected solar-resource scenario changes only the operating simulation. The active BoQ array size remains based on the editable annual peak-sun-hours design input. Battery age applies {number(safeBatteryAnnualDegradation, 1)}% capacity fade annually, leaving {number(batteryAgeRetention * 100, 1)}% of the initial usable reserve in year {number(safeBatteryAgeYears)}.</p>
                </div>
                {activeRainySeasonScenario && <div className="mt-4 border-l-2 border-[#C4923F] bg-[#FFFDF7] px-4 py-3 text-xs leading-5 text-[#745F35]"><span className="font-extrabold text-[#865C1B]">Active conservative case:</span> {activeRainySeasonScenario.probability} is a low daily-resource percentile from {number(activeRainySeasonScenario.observationCount)} NASA POWER observations in the {activeRainySeasonScenario.windowMode === "custom" ? "custom selected" : "automatically derived low-resource"} months ({activeRainySeasonScenario.periodLabel}) across {activeRainySeasonScenario.recordWindow}. It changes this operating simulation only and is not a rainfall or energy-yield forecast.</div>}
                <section aria-label="Saved solar resource presets" className="mt-5 border-y border-[#D6E2DB] bg-white/75 px-4 py-4 sm:px-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Resource register / browser local</p><h5 className="mt-2 text-base font-extrabold text-[#082C67]">Name this resource setting for later</h5><p className="mt-1 max-w-[620px] text-xs leading-5 text-[#638093]">A preset records this resource choice, its rainy-window method, and the current annual design input. Historical cases only activate where the saved coordinates still match.</p></div><span className="border border-[#B8D8A3] bg-[#EDF7D2] px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">{resourcePresets.length}/8 local</span></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Resource preset name</span><input value={resourcePresetName} onChange={(event) => setResourcePresetName(event.target.value)} maxLength={64} className="field-input h-10 font-bold" placeholder="Name this resource setting" /></label><Button type="button" onClick={saveCurrentResourcePreset} className="h-10 rounded-none bg-[#082C67] px-4 text-xs font-extrabold text-white hover:bg-[#0D3D83] active:scale-[.97]"><Save className="mr-2 h-4 w-4" />Save resource</Button></div><p className="mt-3 text-xs leading-5 text-[#58758A]">{resourcePresetNote}</p>{resourcePresets.length > 0 && <div className="mt-4 grid gap-2 border-t border-[#DCE6E2] pt-4 sm:grid-cols-2">{resourcePresets.map((preset) => <article key={preset.id} className="flex items-center justify-between gap-3 border-l-2 border-[#0F6693] bg-[#F7FAF7] px-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-extrabold text-[#082C67]">{preset.name}</p><p className="mt-1 text-[0.63rem] leading-4 text-[#638093]">{preset.preference.scenario?.label ?? (preset.preference.id === "annual" ? "Annual input" : "Historical resource")} · {number(preset.peakSunHours, 2)} PSH design input</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => applyResourcePreset(preset)} className="border border-[#B8C7D4] bg-white px-2.5 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.08em] text-[#244F72] transition-colors hover:border-[#58A90E] hover:bg-[#EDF7D2]">Apply</button><button type="button" onClick={() => removeResourcePreset(preset.id)} className="p-1.5 text-[#7790A1] transition-colors hover:text-[#B54C32]" aria-label={`Delete resource preset ${preset.name}`}><Trash2 className="h-3.5 w-3.5" /></button></div></article>)}</div>}</section>
                <section aria-label="P50 P80 P90 historical comparison" className="mt-5 overflow-hidden border border-[#CDE0D4]"><div className="flex flex-wrap items-end justify-between gap-3 bg-[#082C67] px-4 py-4 text-white sm:px-5"><div><p className="eyebrow !text-[#CBEF7B]">Conservative comparison / field route</p><h5 className="mt-2 text-base font-extrabold">Read P50, P80, and P90 side by side</h5></div>{probabilityScenarioComparison.length === 3 && <p className="text-xs text-[#C0D2DF]">{probabilityScenarioComparison[0].scenario.windowMode === "custom" ? "Custom selected months" : "Automatic low-resource window"}: {probabilityScenarioComparison[0].scenario.periodLabel}</p>}</div>{probabilityScenarioComparison.length === 3 ? <div className="grid divide-y divide-[#DCE6E2] sm:grid-cols-3 sm:divide-x sm:divide-y-0">{probabilityScenarioComparison.map(({ scenario, simulation }) => { const support = getSimulationSupportKwh(simulation, backupScenarioId); const selected = solarResourceScenario === scenario.id; return <article key={scenario.id} className={`p-4 ${selected ? "bg-[#F2F9E6]" : "bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">{scenario.probability} resource case</p><p className="mt-2 text-2xl font-extrabold text-[#082C67]">{number(scenario.psh, 2)} <span className="text-xs">PSH</span></p></div>{selected && <span className="border border-[#B8D8A3] bg-[#E5F6BB] px-2 py-1 text-[0.55rem] font-extrabold uppercase tracking-[0.1em] text-[#3F7D0C]">Active</span>}</div><dl className="mt-4 space-y-2 border-t border-[#DCE6E2] pt-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#638093]">Solar route</dt><dd className="font-extrabold text-[#244F72]">{number(simulation.potentialSolarKwh, 2)} kWh</dd></div><div className="flex justify-between gap-3"><dt className="text-[#638093]">Reserve minimum</dt><dd className="font-extrabold text-[#244F72]">{number(simulation.minimumBatterySocPercent, 0)}% SOC</dd></div><div className="flex justify-between gap-3"><dt className="text-[#638093]">{backupScenarioId === "solar-only" ? "Unserved" : "Support"}</dt><dd className={`font-extrabold ${support > 0 ? "text-[#865C1B]" : "text-[#3F7D0C]"}`}>{number(support, 2)} kWh</dd></div></dl><button type="button" onClick={() => selectSolarResourceScenario(scenario.id)} className={`mt-4 w-full border px-3 py-2 text-[0.6rem] font-extrabold uppercase tracking-[0.1em] transition-colors ${selected ? "border-[#58A90E] bg-[#E5F6BB] text-[#3F7D0C]" : "border-[#B8C7D4] bg-white text-[#244F72] hover:border-[#58A90E] hover:bg-[#EDF7D2]"}`}>{selected ? "Using this case" : `Use ${scenario.probability}`}</button></article>; })}</div> : <div className="bg-[#F7FAF7] px-4 py-5 text-xs leading-5 text-[#58758A]">Record rainy scenarios for the active coordinates to compare P50, P80, and P90 historical daily-resource cases side by side.</div>}<div className="border-t border-[#DCE6E2] bg-[#F7FAF7] px-4 py-3 text-[0.68rem] leading-5 text-[#58758A]">The comparison holds your load, storage, losses, and backup pathway constant. It changes only the historical resource case used by the representative operating simulation; it is not a weather or yield forecast.</div></section>
                <section aria-label="Battery replacement lifecycle forecast" className="mt-5 border-y border-[#D6E2DB] bg-white/75 px-4 py-5 sm:px-5">
                  <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Lifecycle reserve / annual battery replacement</p><h5 className="mt-2 text-base font-extrabold text-[#082C67]">Plan a transparent nominal replacement allowance</h5><p className="mt-1 max-w-[650px] text-xs leading-5 text-[#638093]">Enter an internal current allowance for the complete battery bank. The calculator escalates that amount annually and places an event only at the selected replacement interval; it does not imply a vendor quote, warranty term, or future market price.</p></div><span className="border border-[#B8D8A3] bg-[#EDF7D2] px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">BoQ-ready</span></div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Lifecycle currency<input value={lifecycleCurrency} maxLength={8} onChange={(event) => setLifecycleCurrency(event.target.value.toUpperCase())} className="field-input mt-2 h-10 w-full font-bold" placeholder="NGN" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">An explicit planning currency</span></label>
                    <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Current replacement allowance<input type="number" min="0" step="1000" value={batteryReplacementCost} onChange={(event) => setBatteryReplacementCost(Math.max(0, Number(event.target.value) || 0))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">Whole-bank nominal amount today</span></label>
                    <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Annual escalation<input type="number" min="0" max="30" step="0.1" value={batteryReplacementEscalation} onChange={(event) => setBatteryReplacementEscalation(Math.min(30, Math.max(0, Number(event.target.value) || 0)))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">Nominal forecast: 0–30% / year</span></label>
                    <label className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Replacement interval<input type="number" min="1" max="20" step="1" value={batteryReplacementIntervalYears} onChange={(event) => setBatteryReplacementIntervalYears(Math.min(20, Math.max(1, Math.round(Number(event.target.value) || 1))))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">Scheduled year cadence</span></label>
                  </div>
                  <div className="mt-4 grid gap-4 border-t border-[#DCE6E2] pt-4 sm:grid-cols-[1fr_auto]"><label className="max-w-[255px] text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Forecast horizon<input type="number" min="1" max="25" step="1" value={batteryReplacementForecastYears} onChange={(event) => setBatteryReplacementForecastYears(Math.min(25, Math.max(1, Math.round(Number(event.target.value) || 1))))} className="field-input mt-2 h-10 w-full font-bold" /><span className="mt-2 block text-[0.65rem] normal-case font-medium leading-4 tracking-normal text-[#638093]">1–25 years; shown in the BoQ</span></label><div className="border-l-2 border-[#0F6693] pl-4 text-xs leading-5 text-[#58758A]">{safeBatteryReplacementCost > 0 && firstScheduledBatteryReplacement ? <>First scheduled event: <strong className="text-[#082C67]">Year {number(firstScheduledBatteryReplacement.year)} · {money(safeLifecycleCurrency, firstScheduledBatteryReplacement.replacementEventCost)}</strong>. Cumulative scheduled event allowance to year {number(safeBatteryReplacementForecastYears)}: <strong className="text-[#082C67]">{money(safeLifecycleCurrency, lifecycleReplacementProvision)}</strong>.</> : <>Enter a current replacement allowance to generate annual nominal values and scheduled lifecycle events for the exported BoQ.</>}</div></div>
                  <div className="mt-4 overflow-x-auto border border-[#D6E2DB]"><table className="min-w-[620px] w-full text-left"><thead className="bg-[#EAF1ED] text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#466477]"><tr><th className="px-3 py-2.5">Year</th><th className="px-3 py-2.5 text-right">Full-bank nominal cost</th><th className="px-3 py-2.5 text-right">Scheduled event allowance</th><th className="px-3 py-2.5 text-right">Cumulative events</th></tr></thead><tbody>{batteryReplacementForecast.map((entry) => { const cumulative = batteryReplacementForecast.filter((item) => item.year <= entry.year).reduce((sum, item) => sum + item.replacementEventCost, 0); return <tr key={entry.year} className={`border-t border-[#DCE6E2] text-xs ${entry.isScheduledReplacement ? "bg-[#F7FBF0]" : "bg-white"}`}><th className="px-3 py-2.5 font-extrabold text-[#244F72]">{number(entry.year)}</th><td className="px-3 py-2.5 text-right font-semibold text-[#58758A]">{safeBatteryReplacementCost > 0 ? money(safeLifecycleCurrency, entry.futureCost) : "—"}</td><td className={`px-3 py-2.5 text-right font-extrabold ${entry.isScheduledReplacement ? "text-[#3F7D0C]" : "text-[#7B94A3]"}`}>{entry.isScheduledReplacement && safeBatteryReplacementCost > 0 ? money(safeLifecycleCurrency, entry.replacementEventCost) : "—"}</td><td className="px-3 py-2.5 text-right font-extrabold text-[#082C67]">{safeBatteryReplacementCost > 0 ? money(safeLifecycleCurrency, cumulative) : "—"}</td></tr>; })}</tbody></table></div>
                </section>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><article className="border-l-2 border-[#0F6693] bg-white p-4"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Potential solar</p><p className="mt-2 text-2xl font-extrabold text-[#082C67]">{number(energySimulation.potentialSolarKwh, 2)} <span className="text-xs">kWh</span></p><p className="mt-1 text-xs leading-5 text-[#58758A]">from current array and resource input</p></article><article className="border-l-2 border-[#58A90E] bg-white p-4"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Direct solar</p><p className="mt-2 text-2xl font-extrabold text-[#3F7D0C]">{number(energySimulation.directSolarKwh, 2)} <span className="text-xs">kWh</span></p><p className="mt-1 text-xs leading-5 text-[#58758A]">of the representative load served in daylight</p></article><article className="border-l-2 border-[#C4923F] bg-white p-4"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">Battery minimum</p><p className="mt-2 text-2xl font-extrabold text-[#082C67]">{number(energySimulation.minimumBatterySocPercent, 0)}<span className="text-xs">% SOC</span></p><p className="mt-1 text-xs leading-5 text-[#58758A]">{number(energySimulation.minimumBatterySocKwh, 2)} kWh of {number(energySimulation.usableBatteryKwh, 2)} kWh usable reserve</p></article><article className="border-l-2 border-[#865C1B] bg-white p-4"><p className="text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#54758A]">{backupScenarioId === "solar-only" ? "Unserved load" : `${backupScenario.shortLabel} support`}</p><p className="mt-2 text-2xl font-extrabold text-[#865C1B]">{number(backupScenarioId === "generator" ? energySimulation.generatorSupportKwh : backupScenarioId === "grid" ? energySimulation.gridSupportKwh : energySimulation.unservedKwh, 2)} <span className="text-xs">kWh</span></p><p className="mt-1 text-xs leading-5 text-[#58758A]">{backupScenarioId === "solar-only" ? "after solar and usable battery are exhausted" : "called only after solar and usable battery are exhausted"}</p></article></div>
                <div className="mt-6 h-[310px] border border-[#D6E2DB] bg-white p-3 sm:h-[350px] sm:p-5"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={energySimulation.hourly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}><CartesianGrid stroke="#DCE6E2" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="hour" interval={2} tick={{ fontSize: 10, fill: "#638093" }} tickLine={false} axisLine={{ stroke: "#C9D6D8" }} /><YAxis yAxisId="energy" tick={{ fontSize: 10, fill: "#638093" }} tickLine={false} axisLine={false} width={38} /><YAxis yAxisId="battery" orientation="right" tick={{ fontSize: 10, fill: "#638093" }} tickLine={false} axisLine={false} width={38} /><RechartsTooltip contentStyle={{ borderRadius: 0, borderColor: "#B8C7D4", boxShadow: "0 10px 30px rgba(8,44,103,.12)" }} formatter={(value: number, name: string) => [`${number(value, 2)} kWh`, name]} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} /><Bar yAxisId="energy" dataKey="load" name="Load" fill="#082C67" radius={[2, 2, 0, 0]} maxBarSize={18} /><Line yAxisId="energy" type="monotone" dataKey="solar" name="Solar production" stroke="#58A90E" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /><Line yAxisId="battery" type="monotone" dataKey="batterySoc" name="Battery SOC" stroke="#0F6693" strokeWidth={2} dot={false} strokeDasharray="5 4" /><Line yAxisId="energy" type="stepAfter" dataKey="backup" name={backupScenarioId === "solar-only" ? "Unserved load" : `${backupScenario.shortLabel} support`} stroke="#C4923F" strokeWidth={2} dot={false} /></ComposedChart></ResponsiveContainer></div>
                <div className="mt-5 grid gap-5 border-t border-[#D6E2DB] pt-5 lg:grid-cols-[.75fr_1.25fr]">
                  <div className="border-l-2 border-[#0F6693] pl-4"><p className="eyebrow">Long-term reserve / ageing trace</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">Usable reserve in year {number(safeBatteryAgeYears)}: {number(energySimulation.usableBatteryKwh, 2)} kWh</p><p className="mt-2 text-xs leading-5 text-[#58758A]">The curve applies the selected annual capacity fade to the current usable battery reserve. It does not forecast warranty, cycle-life, temperature, calendar ageing, or BMS limitations.</p></div>
                  <div className="h-[205px] border border-[#D6E2DB] bg-white p-3"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={batteryAgeingCurve} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}><CartesianGrid stroke="#DCE6E2" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="year" interval={4} tick={{ fontSize: 10, fill: "#638093" }} tickLine={false} axisLine={{ stroke: "#C9D6D8" }} /><YAxis tick={{ fontSize: 10, fill: "#638093" }} tickLine={false} axisLine={false} width={38} /><RechartsTooltip contentStyle={{ borderRadius: 0, borderColor: "#B8C7D4" }} formatter={(value: number) => [`${number(value, 2)} kWh`, "Usable reserve"]} /><Line type="monotone" dataKey="usableReserve" name="Usable reserve" stroke="#0F6693" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></div>
                </div>
                <div className="mt-5 grid gap-4 border-t border-[#D6E2DB] pt-5 lg:grid-cols-[1.2fr_.8fr]"><div className="border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#58758A]"><p className="font-extrabold uppercase tracking-[0.11em] text-[#3F7D0C]">How the simulated day is constructed</p><p className="mt-2">The model begins with the usable battery reserve at 100% state of charge. It spreads your recorded daytime and nighttime energy evenly across 06:00–18:00 and 18:00–06:00, then applies a daylight-only sine curve normalised to the current peak-sun-hours input. Solar first serves the load, excess charges the battery, and the battery serves the remaining load with the selected round-trip efficiency.</p></div><div className="border-l-2 border-[#C4923F] pl-4 text-xs leading-5 text-[#58758A]"><p className="font-extrabold uppercase tracking-[0.11em] text-[#865C1B]">Interpret the backup trace carefully</p><p className="mt-2">{backupScenarioId === "solar-only" ? "Solar-only mode records any unmet hourly energy after usable storage is depleted." : `${backupScenario.label} appears only when solar and the usable battery reserve cannot meet an hourly load.`} Solar curtailment in this representative day is {number(energySimulation.solarCurtailmentKwh, 2)} kWh. Weather variability, generator ramping, DC-bus dynamics, and battery BMS behaviour are outside this planning screen.</p></div></div>
              </section>
            </section>

            <section aria-label="Saved load scenarios" className="paper-card overflow-hidden"><div className="border-b border-[#D6E2DB] bg-[#F7FAF7] px-5 py-5 sm:px-7"><div className="flex flex-wrap items-end justify-between gap-4"><div className="flex items-start gap-3"><FolderOpen className="mt-0.5 h-5 w-5 text-[#58A90E]" /><div><p className="eyebrow">Scenario board / local planning</p><h3 className="mt-2 text-xl font-extrabold text-[#082C67]">Save and compare load setups</h3><p className="mt-1 max-w-[610px] text-xs leading-5 text-[#638093]">Save the live schedule and its key design settings in this browser. Select up to two saved versions for a direct output comparison.</p></div></div><span className="border border-[#B8D8A3] bg-[#EDF7D2] px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">{savedScenarios.length}/6 saved</span></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Scenario name</span><input value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} className="field-input h-11 font-bold" placeholder="Name this load scenario" /></label><Button type="button" onClick={saveCurrentScenario} className="h-11 rounded-none bg-[#082C67] px-5 text-xs font-extrabold text-white hover:bg-[#0D3D83] active:scale-[.97]"><Save className="mr-2 h-4 w-4" />Save current</Button></div><p className="mt-3 text-xs leading-5 text-[#58758A]">{scenarioNote}</p></div>{savedScenarios.length === 0 ? <div className="px-5 py-8 text-center sm:px-7"><p className="text-sm font-extrabold text-[#082C67]">No saved scenarios yet</p><p className="mx-auto mt-2 max-w-[440px] text-xs leading-5 text-[#638093]">Name and save the current configuration to preserve its loads, site assumptions, backup scenario, and sizing outputs for later comparison.</p></div> : <div className="px-5 py-5 sm:px-7"><div className="grid gap-3 lg:grid-cols-2">{savedScenarios.map((scenario) => { const selected = comparisonScenarioIds.includes(scenario.id); return <article key={scenario.id} className={`border p-4 ${selected ? "border-[#58A90E] bg-[#F7FBF0]" : "border-[#D6E2DB] bg-white"}`}><div className="flex items-start justify-between gap-3"><label className="flex min-w-0 cursor-pointer items-start gap-3"><input type="checkbox" checked={selected} onChange={() => toggleScenarioComparison(scenario.id)} className="mt-1 h-4 w-4 accent-[#58A90E]" /><span><span className="block truncate text-sm font-extrabold text-[#082C67]">{scenario.name}</span><span className="mt-1 block text-[0.66rem] text-[#638093]">{new Date(scenario.savedAt).toLocaleDateString()} · {scenario.outputs.dailyEnergy.toFixed(2)} kWh/day · {backupScenarios[scenario.backupScenarioId].shortLabel}</span></span></label><button type="button" onClick={() => removeScenario(scenario.id)} className="p-1 text-[#7790A1] transition-colors hover:text-[#B54C32]" aria-label={`Delete ${scenario.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => restoreScenario(scenario)} className="border border-[#B8C7D4] bg-white px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-[#244F72] transition-colors hover:border-[#58A90E] hover:bg-[#EDF7D2]">Restore</button><span className={`px-3 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] ${selected ? "bg-[#E5F6BB] text-[#3F7D0C]" : "bg-[#F2F6F3] text-[#638093]"}`}>{selected ? "In comparison" : "Select to compare"}</span></div></article>; })}</div>{selectedComparisonScenarios.length > 0 && <section aria-label="Saved scenario comparison" className="mt-6 overflow-hidden border border-[#CDE0D4]"><div className="flex flex-wrap items-end justify-between gap-3 bg-[#082C67] px-5 py-4 text-white"><div><p className="eyebrow !text-[#CBEF7B]">Scenario comparison / field reading</p><h4 className="mt-2 text-base font-extrabold">Compare the decision-relevant outputs</h4></div><p className="text-xs text-[#C0D2DF]">{selectedComparisonScenarios.length === 1 ? "Select one more saved scenario to compare side by side." : "Two saved scenarios selected."}</p></div><div className="overflow-x-auto"><table className="min-w-[640px] w-full text-left"><thead className="bg-[#EAF1ED] text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#466477]"><tr><th className="px-5 py-3">Metric</th>{selectedComparisonScenarios.map((scenario) => <th key={scenario.id} className="px-5 py-3 text-right">{scenario.name}</th>)}</tr></thead><tbody>{comparisonMetrics.map(([label, unit, getValue]) => <tr key={label} className="border-t border-[#DCE6E2]"><th className="px-5 py-3 text-xs font-extrabold text-[#244F72]">{label}<span className="ml-2 text-[0.62rem] font-normal text-[#638093]">{unit}</span></th>{selectedComparisonScenarios.map((scenario) => <td key={scenario.id} className="px-5 py-3 text-right text-sm font-extrabold text-[#082C67]">{getValue(scenario)}</td>)}</tr>)}</tbody></table></div><div className="border-t border-[#DCE6E2] bg-[#F7FAF7] px-5 py-4 text-xs leading-5 text-[#58758A]">Each saved scenario is a timestamped local snapshot. Compare the outputs, then restore the preferred setup to continue editing or export its BoQ.</div></section>}</div>}</section>
            <section className="paper-card p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b border-[#D6E2DB] pb-5"><RotateCw className="h-5 w-5 text-[#58A90E]" /><div><p className="eyebrow">Performance stack</p><h3 className="mt-2 text-xl font-extrabold text-[#082C67]">Losses, efficiencies, and design reserve</h3></div></div>
              <div className="mt-6 border-b border-[#D6E2DB] pb-6">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Resilience route</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Night-load backup scenario</h4></div><p className="max-w-[300px] text-xs leading-5 text-[#638093]">Choose the source expected to take over after the battery window. The autonomy input remains editable after selection.</p></div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">{(Object.keys(backupScenarios) as BackupScenarioId[]).map((scenarioId) => { const scenario = backupScenarios[scenarioId]; const selected = scenarioId === backupScenarioId; return <button key={scenarioId} type="button" onClick={() => selectBackupScenario(scenarioId)} aria-pressed={selected} className={`border p-4 text-left transition-colors ${selected ? "border-[#58A90E] bg-[#EDF7D2] text-[#082C67]" : "border-[#C9D6D8] bg-white text-[#527087] hover:border-[#58A90E]"}`}><span className="block text-xs font-extrabold">{scenario.label}</span><span className="mt-1 block text-[0.68rem] leading-4">Starts at {number(scenario.defaultAutonomy, 2)} autonomy day(s)</span></button>; })}</div>
                <p className="mt-4 text-xs leading-5 text-[#5A768A]"><span className="font-extrabold text-[#244F72]">Selected basis:</span> {backupScenario.description}</p>
                <div className="mt-5 border-t border-[#D6E2DB] pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Telecom resilience / N+1</p><h5 className="mt-2 text-sm font-extrabold text-[#082C67]">Tenant, equipment, and rectifier reserve</h5><p className="mt-1 max-w-[580px] text-xs leading-5 text-[#638093]">Tenant count multiplies only the selected telecom radio-equipment planning loads. Equipment N+1 adds one reserve unit to each eligible telecom profile. Rectifier-module N+1 is separate: it adds a standby module to the rectifier BoQ screen without increasing normal operating energy.</p></div><label className="inline-flex shrink-0 cursor-pointer items-center gap-3 border border-[#B8C7D4] bg-white px-3 py-2 text-xs font-extrabold text-[#244F72]"><input type="checkbox" checked={telecomNPlusOne} onChange={(event) => setTelecomNPlusOne(event.target.checked)} className="h-4 w-4 accent-[#58A90E]" />Apply equipment N+1</label></div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Radio tenants<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">scales telecom radio equipment only</span><input type="number" min="1" max="12" step="1" value={tenantCount} onChange={(event) => setTenantCount(Math.max(1, Math.min(12, Math.round(Number(event.target.value) || 1))))} className="field-input mt-2 font-bold" /></label><div><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">DC-bus voltage</p><Select value={dcBusVoltage} onValueChange={setDcBusVoltage}><SelectTrigger aria-label="Telecom DC-bus voltage" className="mt-2 h-11 w-full rounded-none border-0 border-b border-[#B8C7D4] bg-transparent px-0 font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="−48 V DC">−48 V DC</SelectItem><SelectItem value="−24 V DC">−24 V DC</SelectItem><SelectItem value="+24 V DC">+24 V DC</SelectItem></SelectContent></Select><p className="mt-1 text-xs leading-5 text-[#7B94A3]">Recorded in the tower BoQ; confirm the live site DC architecture.</p></div></div>
                  <div className="mt-5 grid gap-5 border-t border-[#D6E2DB] pt-5 sm:grid-cols-[1fr_auto]"><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Rectifier module rating<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">DC output watts per module</span><input type="number" min="100" step="100" value={rectifierModuleWatts} onChange={(event) => setRectifierModuleWatts(Math.max(100, Number(event.target.value) || 100))} className="field-input mt-2 font-bold" /></label><label className="mt-6 inline-flex h-11 cursor-pointer items-center gap-3 border border-[#B8C7D4] bg-white px-3 text-xs font-extrabold text-[#244F72]"><input type="checkbox" checked={rectifierModuleNPlusOne} onChange={(event) => setRectifierModuleNPlusOne(event.target.checked)} className="h-4 w-4 accent-[#58A90E]" />Add rectifier N+1</label><div className="sm:col-span-2 border-l-2 border-[#58A90E] pl-3 text-xs leading-5 text-[#58758A]">Rectifier screen: <span className="font-extrabold text-[#244F72]">{number(rectifierModuleDemandWatts)} W ÷ {number(rectifierModuleWatts)} W = {number(rectifierOperatingModules)} operating module(s)</span>{rectifierModuleNPlusOne && rectifierOperatingModules > 0 ? ` + 1 standby module = ${number(rectifierRecommendedModules)} modules in the BoQ.` : "."}</div></div>
                  <p className="mt-4 border-l-2 border-[#58A90E] pl-3 text-xs leading-5 text-[#58758A]">Eligible active equipment-N+1 profiles: <span className="font-extrabold text-[#244F72]">{number(telecomRedundancyRows.length)}</span>. {telecomNPlusOne ? `Sizing includes ${number(redundancyReserveCount)} additional reserve equipment unit(s).` : "Equipment N+1 is not included in the current energy and surge basis."}</p>
                </div>
                {backupScenarioId === "generator" && <div className="mt-5 grid gap-5 border-t border-[#D6E2DB] pt-5 sm:grid-cols-2"><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Generator power factor<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">fraction; used for kW-to-kVA conversion</span><input type="number" min="0.1" max="1" step="0.01" value={generatorPowerFactor} onChange={(event) => setGeneratorPowerFactor(Number(event.target.value))} className="field-input mt-2 font-bold" /></label><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Generator loading target<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">% of nameplate used for recommendation</span><input type="number" min="1" max="100" step="1" value={generatorLoadingTarget} onChange={(event) => setGeneratorLoadingTarget(Number(event.target.value))} className="field-input mt-2 font-bold" /></label><div className="sm:col-span-2 border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#58758A]">Indicative generator recommendation: <span className="font-extrabold text-[#244F72]">{number(generatorKva, 2)} kVA</span> for the calculated {number(totals.inverterKw, 2)} kW peak-plus-headroom basis. Final generator selection must consider motor starting, waveform, altitude, derating, and changeover design.</div></div>}
                {backupScenarioId === "grid" && <div className="mt-5 grid gap-5 border-t border-[#D6E2DB] pt-5 sm:grid-cols-3"><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Local grid tariff<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">per kWh; included in BoQ context</span><input type="number" min="0" step="0.01" value={gridTariff} onChange={(event) => setGridTariff(Number(event.target.value))} className="field-input mt-2 font-bold" /></label><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Tariff currency<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">e.g. NGN, GHS, XOF</span><input value={gridCurrency} onChange={(event) => setGridCurrency(event.target.value.toUpperCase())} className="field-input mt-2 font-bold" /></label><label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Average daily outage<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">hours; sets grid autonomy basis</span><input type="number" min="0" max="24" step="0.25" value={gridOutageHours} onChange={(event) => { const nextHours = Number(event.target.value); setGridOutageHours(nextHours); setAutonomyDays(Math.max(0, nextHours) / 24); }} className="field-input mt-2 font-bold" /></label><div className="sm:col-span-3 border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#58758A]">Grid-supported battery basis: <span className="font-extrabold text-[#244F72]">{number(gridOutageHours, 2)} outage h/day = {number(gridAutonomyDays, 2)} autonomy day(s)</span>, covering about {number(dailyOutageEnergyEquivalent, 2)} kWh of daily-load exposure. Estimated daily grid energy value: {gridCurrency || "Local currency"} {number(dailyGridEnergyValue, 2)}.</div></div>}
              </div>
              <div className="mt-6 border-t border-[#D6E2DB] pt-6"><div><p className="eyebrow">Equipment preference</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Preferred inverter and battery brands</h4><p className="mt-1 text-xs leading-5 text-[#638093]">These preferences are recorded in the BoQ for Xtorra review; final compatibility and availability remain subject to engineering confirmation.</p></div><div className="mt-4 grid gap-5 sm:grid-cols-2"><div><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Inverter preference</p><Select value={inverterBrand} onValueChange={setInverterBrand}><SelectTrigger aria-label="Preferred inverter brand" className="mt-2 h-11 w-full rounded-none border-0 border-b border-[#B8C7D4] bg-transparent px-0 font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{inverterBrandOptions.map((brand) => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}</SelectContent></Select></div><div><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Lithium battery preference</p><Select value={batteryBrand} onValueChange={setBatteryBrand}><SelectTrigger aria-label="Preferred lithium battery brand" className="mt-2 h-11 w-full rounded-none border-0 border-b border-[#B8C7D4] bg-transparent px-0 font-bold text-[#082C67] shadow-none"><SelectValue /></SelectTrigger><SelectContent>{batteryBrandOptions.map((brand) => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}</SelectContent></Select></div></div></div>
              <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {factorFields.map(([label, value, setter, note]) => <label key={label} className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">{label}<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">{note}</span><input type="number" min="0" max="100" step="0.5" value={value} onChange={(event) => setter(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>)}
                <label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Battery depth of discharge<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">% usable</span><input type="number" min="1" max="100" step="1" value={depthOfDischarge} onChange={(event) => setDepthOfDischarge(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Autonomy override<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">battery days; scenario starting point is editable</span><input type="number" min="0" step="0.25" value={autonomyDays} onChange={(event) => setAutonomyDays(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">PV design margin<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">% array reserve</span><input type="number" min="0" step="1" value={arrayMargin} onChange={(event) => setArrayMargin(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Inverter headroom<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">% peak / surge reserve</span><input type="number" min="0" step="1" value={inverterHeadroom} onChange={(event) => setInverterHeadroom(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                <label className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#345E7D]">Module rating<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">Wp per selected module</span><input type="number" min="1" step="5" value={moduleWattage} onChange={(event) => setModuleWattage(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="relative overflow-hidden bg-[#082C67] p-6 text-white sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#CBEF7B]/18" />
              <div className="pointer-events-none absolute -right-1 top-6 h-40 w-40 rounded-full border border-white/10" />
              <div className="relative"><div className="flex items-center gap-3"><SunMedium className="h-5 w-5 text-[#CBEF7B]" /><p className="eyebrow !text-[#CBEF7B]">Measured output / 05B</p></div><h3 className="mt-4 font-display text-4xl leading-[0.96] tracking-[-0.04em]">System sizing basis</h3><p className="mt-4 text-sm leading-6 text-[#C0D2DF]">{customerName ? `${customerName} · ` : ""}{projectLocation || location || "Unlabelled site"} · {latitude.toFixed(4)}, {longitude.toFixed(4)}</p><p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#CBEF7B]">{backupScenario.shortLabel} · {number(autonomyDays, 2)} day(s) autonomy</p></div>
              <div className="relative mt-8 space-y-5">
                <div className="border-b border-white/15 pb-5"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#B9CCDC]">Solar array capacity</p><p className="mt-2 font-display text-5xl tracking-[-0.05em] text-[#CBEF7B]">{number(totals.arrayWp / 1000, 2)} <span className="text-2xl">kWp</span></p><p className="mt-2 text-sm text-[#C0D2DF]">{number(totals.arrayWp)} Wp before module rounding</p></div>
                <div className="grid gap-5 border-b border-white/15 pb-5 sm:grid-cols-2 xl:grid-cols-1"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#B9CCDC]">Inverter capacity</p><p className="mt-2 font-display text-4xl tracking-[-0.045em]">{number(totals.inverterKw, 2)} <span className="text-xl">kW</span></p><p className="mt-2 text-xs leading-5 text-[#C0D2DF]">{number(totals.surgePeakWatts)} W combined surge + {number(inverterHeadroom)}% headroom</p><p className="mt-1 text-xs leading-5 text-[#CBEF7B]">Hold {number(requiredInverterWatts)} W for {number(totals.governingSurgeDurationSec, 1)} s</p></div><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#B9CCDC]">Lithium battery capacity</p><p className="mt-2 font-display text-4xl tracking-[-0.045em]">{number(totals.batteryKwh, 2)} <span className="text-xl">kWh</span></p></div></div>
                <div className="grid grid-cols-2 gap-4 border-b border-white/15 pb-5"><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#B9CCDC]">Daytime solar demand</p><p className="mt-2 text-xl font-extrabold">{number(totals.dayEnergy, 2)} kWh</p></div><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#B9CCDC]">Night battery dependency</p><p className="mt-2 text-xl font-extrabold text-[#CBEF7B]">{number(totals.nightEnergy, 2)} kWh</p></div></div>
                <div className="grid grid-cols-2 gap-4"><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#B9CCDC]">Total daily AC energy</p><p className="mt-2 text-xl font-extrabold">{number(totals.dailyEnergy, 2)} kWh</p></div><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#B9CCDC]">Day / night peak</p><p className="mt-2 text-xl font-extrabold">{number(totals.dayPeak / 1000, 2)} / {number(totals.nightPeak / 1000, 2)} kW</p></div></div>
              </div>
            </section>

            <section className="paper-card p-6 sm:p-7">
              <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-[#58A90E]" /><div><p className="eyebrow">Bill of quantity basis</p><h3 className="mt-2 text-xl font-extrabold text-[#082C67]">Core equipment schedule</h3></div></div>
              <dl className="mt-6 divide-y divide-[#DCE6E2] border-y border-[#DCE6E2]">
                {[
                  ["PV modules", totals.moduleCount > 0 ? `${number(totals.moduleCount)} × ${number(moduleWattage)} Wp` : "Add valid inputs"],
                  ["PV array", `${number(totals.arrayWp)} Wp / ${number(totals.arrayWp / 1000, 2)} kWp`],
                  ["Inverter surge basis", `${number(totals.surgePeakWatts)} W summed from selected load surge factors`],
                  ["Surge duration", `${number(totals.governingSurgeDurationSec, 1)} s governing duration from active load schedule`],
                  ["Hybrid inverter", `${number(totals.inverterKw, 2)} kW minimum / ${number(requiredInverterWatts)} W for ${number(totals.governingSurgeDurationSec, 1)} s`],
                  ["Preferred inverter", inverterBrand],
                  ["Compatible shortlist", compatibleModels.length > 0 ? compatibleModels.map((item) => item.model.model).join(" · ") : "No documented selected-brand model passes the active screen"],
                  ["Lithium battery bank", `${number(totals.batteryKwh, 2)} kWh nominal from ${number(totals.nightEnergy, 2)} kWh night dependency × ${number(autonomyDays, 2)} autonomy day(s) · ${backupScenario.shortLabel}`],
                  ["Telecom N+1 reserve", telecomNPlusOne ? `${number(redundancyReserveCount)} extra unit(s) across ${number(telecomRedundancyRows.length)} eligible profile(s)` : "Not selected"],
                  ["Preferred battery", batteryBrand],
                  ["Generator backup", backupScenarioId === "generator" ? `${number(generatorKva, 2)} kVA indicative at ${number(safeGeneratorPowerFactor, 2)} PF / ${number(safeGeneratorLoading * 100)}% target load` : "Not selected"],
                  ["Grid support", backupScenarioId === "grid" ? `${gridCurrency || "Local currency"} ${number(gridTariff, 2)}/kWh · ${number(gridOutageHours, 2)} h/day outage · ${number(gridAutonomyDays, 2)} autonomy day(s)` : "Not selected"],
                  ["PV performance retained", `${number(totals.retainedPvFactor * 100, 1)}% after selected losses and efficiencies`],
                  ["Balance of system", "Design-specific: structure, combiner, protection, isolators, cables, earthing, monitoring"],
                ].map(([label, value]) => <div key={label} className="grid grid-cols-[0.42fr_0.58fr] gap-3 py-4"><dt className="text-xs font-extrabold text-[#244F72]">{label}</dt><dd className="text-right text-xs leading-5 text-[#5B778B]">{value}</dd></div>)}
              </dl>
              <section className="mt-6 border border-[#CDE0D4] bg-[#F6FAF3] p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Documented model screen</p><h4 className="mt-2 text-base font-extrabold text-[#082C67]">Preferred-brand inverter compatibility</h4></div><span className="shrink-0 border border-[#B8D8A3] bg-[#E5F6BB] px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#3F7D0C]">Indicative</span></div>
                <p className="mt-3 text-xs leading-5 text-[#58758A]">Screened against {number(totals.inverterKw, 2)} kW continuous requirement and {number(requiredInverterWatts)} W for {number(totals.governingSurgeDurationSec, 1)} s. Product variant, phase, derating, availability, wiring, and protection remain for Xtorra engineering review.</p>
                {modelRecommendations.length > 0 ? <div className="mt-4 space-y-3">{modelRecommendations.map(({ model, continuousPass, overloadPass, supportedTier }) => <div key={model.model} className={`border-l-2 p-3 ${continuousPass && overloadPass ? "border-[#58A90E] bg-white" : "border-[#C4923F] bg-[#FFFDF7]"}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-extrabold text-[#082C67]">{model.model}</p><p className="mt-1 text-xs leading-5 text-[#5B778B]">{number(model.continuousKw, 1)} kW continuous · {model.phaseNote}</p></div><span className={`px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.1em] ${continuousPass && overloadPass ? "bg-[#E5F6BB] text-[#3F7D0C]" : "bg-[#FFF0D0] text-[#865C1B]"}`}>{continuousPass && overloadPass ? "Screen pass" : "Review required"}</span></div><p className="mt-2 text-xs leading-5 text-[#58758A]">{overloadPass && supportedTier ? `Documented overload: ${number(supportedTier.watts)} W for ${number(supportedTier.durationSec, 1)} s.` : "No documented overload tier in this shortlist meets the calculated duration-aware requirement."}</p><a href={model.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-extrabold text-[#244F72] underline decoration-[#58A90E] underline-offset-4">View official specification</a></div>)}</div> : <div className="mt-4 border-l-2 border-[#A9BFC9] bg-white px-4 py-3 text-xs leading-5 text-[#58758A]">Select Deye, Sunsynk, Victron Energy, Huawei, Growatt, or Felicity Solar to view documented-model screens. Other or unspecified brands require Xtorra technical review.</div>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#CDE0D4] pt-4"><p className="max-w-[280px] text-xs leading-5 text-[#58758A]">Compare all {comparisonCandidates.length} currently passing documented candidate{comparisonCandidates.length === 1 ? "" : "s"} across the available reference brands.</p><Button type="button" onClick={downloadInverterComparisonReport} disabled={comparisonCandidates.length === 0} className="h-10 rounded-none bg-[#082C67] px-4 text-xs font-extrabold text-white hover:bg-[#0D3D83] disabled:opacity-40"><Download className="mr-2 h-3.5 w-3.5" />Compare candidates as PDF</Button></div>
              </section>
              <div className="mt-6 border border-[#CDE0D4] bg-[#F7FAF7] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Print load summary</p><p className="mt-1 text-xs leading-5 text-[#58758A]">Choose the page orientation before opening the print dialog.</p></div><div className="flex items-center border border-[#B8C7D4] bg-white p-1" role="group" aria-label="Print page orientation"><button type="button" onClick={() => setPrintOrientation("portrait")} aria-pressed={printOrientation === "portrait"} className={`px-3 py-2 text-xs font-extrabold transition-colors ${printOrientation === "portrait" ? "bg-[#082C67] text-white" : "text-[#527087] hover:bg-[#EDF7D2]"}`}>Portrait</button><button type="button" onClick={() => setPrintOrientation("landscape")} aria-pressed={printOrientation === "landscape"} className={`px-3 py-2 text-xs font-extrabold transition-colors ${printOrientation === "landscape" ? "bg-[#082C67] text-white" : "text-[#527087] hover:bg-[#EDF7D2]"}`}>Landscape</button></div></div><Button type="button" onClick={printLoadSummary} className="mt-4 h-11 w-full rounded-none bg-[#F2F7ED] text-xs font-extrabold text-[#082C67] hover:bg-[#E5F6BB] active:scale-[.97]"><Printer className="mr-2 h-4 w-4 text-[#3F7D0C]" />Print load summary · {printOrientation}</Button></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3"><a href="/utility-scale" className="flex h-11 items-center justify-center gap-2 border border-[#0F6693] bg-[#F7FAF7] text-xs font-extrabold text-[#082C67] hover:bg-[#E5F6BB]"><Factory className="h-4 w-4 text-[#3F7D0C]" />Utility-scale tool</a><Button type="button" onClick={downloadBoqReport} className="h-11 rounded-none bg-[#082C67] text-xs font-extrabold text-white hover:bg-[#0D3D83] active:scale-[.97]"><Download className="mr-2 h-4 w-4" />Download branded BoQ PDF</Button><Button type="button" variant="outline" onClick={handoffBoqToSales} className="h-11 rounded-none border-[#B8C7D4] bg-white text-xs font-extrabold text-[#082C67] hover:bg-[#EDF7D2] active:scale-[.97]"><Send className="mr-2 h-4 w-4 text-[#58A90E]" />Send BoQ to Xtorra sales</Button></div>
              <div className="mt-6 border-l-2 border-[#58A90E] pl-4 text-xs leading-5 text-[#58758A]">This screen does not select final product models or protection devices. A qualified engineer must validate equipment ratings, overload duration, string design, battery BMS limits, wiring, earthing, surge protection, phase configuration, and code compliance.</div>
            </section>
          </aside>
        </div>
      </div>
    </section>
    <section className={`print-load-summary ${printOrientation === "landscape" ? "print-load-summary-landscape" : ""}`} aria-hidden="true">
      <header className="print-summary-header"><img src={reportLogoUrl} alt="Xtorra Renewables" /><div><p>Load profile / planning summary</p><h1>{customerName || "Xtorra Renewable Energy Load Profile"}</h1><span>{projectLocation || location} · {latitude.toFixed(4)}, {longitude.toFixed(4)}</span></div></header>
      <div className="print-summary-metrics"><div><span>Total daily energy</span><strong>{number(totals.dailyEnergy, 2)} kWh</strong></div><div><span>Daytime solar demand</span><strong>{number(totals.dayEnergy, 2)} kWh</strong></div><div><span>Night battery dependency</span><strong>{number(totals.nightEnergy, 2)} kWh</strong></div><div><span>Inverter basis</span><strong>{number(totals.inverterKw, 2)} kW</strong></div><div><span>Active circuits</span><strong>{number(activeCircuitCount)}</strong></div><div><span>Equipment units</span><strong>{number(totalEquipmentQuantity)}</strong></div></div>
      <div className="print-summary-grid"><div><h2>Daily energy by appliance</h2><div className="print-chart-wrap"><PieChart width={300} height={230}><Pie data={loadEnergyBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={3} stroke="none">{loadEnergyBreakdown.map((item) => <Cell key={`print-cell-${item.id}`} fill={item.color} />)}</Pie></PieChart><div className="print-chart-total"><strong>{number(totals.dailyEnergy, 2)}</strong><span>kWh/day</span></div></div><ul className="print-summary-legend">{loadEnergyBreakdown.map((item) => <li key={`print-legend-${item.id}`}><i style={{ backgroundColor: item.color }} />{item.name}<strong>{number(item.value, 2)} kWh</strong></li>)}</ul></div><div><h2>Appliance load schedule</h2><table className="print-load-table"><thead><tr><th>Appliance</th><th>Watts</th><th>Qty</th><th>Day h</th><th>Night h</th><th>Daily kWh</th></tr></thead><tbody>{loads.map((row) => { const energy = Math.max(0, row.watts) * Math.max(0, row.quantity) * (Math.max(0, row.dayHours) + Math.max(0, row.nightHours)) * (Math.min(100, Math.max(0, row.utilisation)) / 100) / 1000; return <tr key={`print-row-${row.id}`}><td>{row.item}</td><td>{number(row.watts)}</td><td>{number(row.quantity)}</td><td>{number(row.dayHours, 2)}</td><td>{number(row.nightHours, 2)}</td><td>{number(energy, 2)}</td></tr>; })}</tbody></table></div></div>
      <div className="print-circuit-register"><strong>Circuit register</strong><span>{loads.map((row) => `${row.circuitName || "Unlabelled circuit"}: ${row.item || "Unlabelled load"} × ${number(row.quantity)}`).join(" · ")}</span></div>
      <footer>Prepared by Xtorra Renewables · sales@xtorra.com · +234 701 638 2231 · www.xtorra.com<br />Indicative planning summary only. Final electrical design and equipment selection require qualified engineering review.</footer>
    </section>
    </>
  );
}
