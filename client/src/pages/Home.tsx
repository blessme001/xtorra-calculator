/* Solar Cartography page: directional field-guide layout with Navy authority, Solar Lime actions, and radial energy motifs. */
/* Solar Cartography page: editorial field-guide composition with navy authority, solar-lime signals, and practical energy-routing interactions. */
import UtilityScale from "@/pages/UtilityScale";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  BatteryCharging,
  Calculator,
  ChevronRight,
  CircleCheck,
  Compass,
  Download,
  Mail,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
  SunMedium,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SolarDesignCalculator, { type BoqSalesContext } from "@/components/SolarDesignCalculator";

const logoUrl = "/manus-storage/xtorra-logo_6cfa4db6.png";
const solarMarkUrl = "/manus-storage/xtorra-solar-mark_7711b50c.png";

const solutions = [
  {
    index: "01",
    title: "Solar systems",
    shortTitle: "Solar",
    icon: SunMedium,
    image: "/manus-storage/xtorra-solar-installation-detail_3fc42592.jpg",
    description: "From early feasibility through commissioning, we help shape solar projects around the way your operation actually uses power.",
    points: ["Site-aware planning", "Clear project staging", "Operational handover"],
  },
  {
    index: "02",
    title: "Energy storage",
    shortTitle: "Storage",
    icon: BatteryCharging,
    image: "/manus-storage/xtorra-battery-infrastructure_36d09409.jpg",
    description: "Store energy with purpose: to smooth demand, support resilience, and give your energy strategy more flexibility.",
    points: ["Flexible capacity thinking", "Resilience-minded design", "Integration-ready systems"],
  },
  {
    index: "03",
    title: "Hybrid energy",
    shortTitle: "Hybrid",
    icon: Wind,
    image: "/manus-storage/xtorra-wind-solar-landscape_3c705ede.jpg",
    description: "Bring generation, storage, and operational insight together in a coordinated path toward cleaner energy.",
    points: ["Practical technology mix", "Focused performance view", "Scalable next phases"],
  },
];

const steps = [
  ["01", "Read the energy landscape", "We start with the constraints, opportunities, and everyday realities that make your site unique."],
  ["02", "Build the right route", "We turn findings into a clear, considered path that supports decisions and delivery."],
  ["03", "Move with confidence", "Your project takes shape through focused milestones, shared visibility, and practical next steps."],
];

const caseStudies = [
  {
    label: "Capability 01 / Site generation",
    title: "Commercial rooftop solar",
    image: "/manus-storage/xtorra-case-rooftop-solar_548c5764.jpg",
    prompt: "Turn available roof area into cleaner on-site power through a considered route from feasibility to operational handover.",
  },
  {
    label: "Capability 02 / Integrated systems",
    title: "Integrated clean-energy site",
    image: "/manus-storage/xtorra-case-microgrid_24859ebc.jpg",
    prompt: "Bring generation, storage, and site demand into one coordinated energy path with clearer operational control.",
  },
  {
    label: "Capability 03 / Resilient storage",
    title: "Energy storage deployment",
    image: "/manus-storage/xtorra-case-storage_eb6ebcab.jpg",
    prompt: "Add flexibility where energy timing and continuity matter, with storage sized around the role it needs to play.",
  },
];

const westAfricaMarkets = [
  { id: "benin", country: "Benin", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-BJ", rate: 78.61, benchmark: "Africa regional fallback" },
  { id: "burkina-faso", country: "Burkina Faso", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-BF", rate: 117.36, benchmark: "Country benchmark" },
  { id: "cabo-verde", country: "Cabo Verde", currency: "CVE", currencyName: "Cabo Verde escudo", locale: "pt-CV", rate: 31.05, benchmark: "Country benchmark" },
  { id: "cote-divoire", country: "Côte d’Ivoire", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-CI", rate: 74.12, benchmark: "Country benchmark" },
  { id: "gambia", country: "The Gambia", currency: "GMD", currencyName: "Gambian dalasi", locale: "en-GM", rate: 10.46, benchmark: "Africa regional fallback" },
  { id: "ghana", country: "Ghana", currency: "GHS", currencyName: "Ghanaian cedi", locale: "en-GH", rate: 1.63, benchmark: "Country benchmark" },
  { id: "guinea", country: "Guinea", currency: "GNF", currencyName: "Guinean franc", locale: "fr-GN", rate: 1228.88, benchmark: "Africa regional fallback" },
  { id: "guinea-bissau", country: "Guinea-Bissau", currency: "XOF", currencyName: "West African CFA franc", locale: "pt-GW", rate: 78.61, benchmark: "Africa regional fallback" },
  { id: "liberia", country: "Liberia", currency: "LRD", currencyName: "Liberian dollar", locale: "en-LR", rate: 25.39, benchmark: "Africa regional fallback" },
  { id: "mali", country: "Mali", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-ML", rate: 125.24, benchmark: "Country benchmark" },
  { id: "mauritania", country: "Mauritania", currency: "MRU", currencyName: "Mauritanian ouguiya", locale: "fr-MR", rate: 5.61, benchmark: "Africa regional fallback" },
  { id: "niger", country: "Niger", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-NE", rate: 78.61, benchmark: "Africa regional fallback" },
  { id: "nigeria", country: "Nigeria", currency: "NGN", currencyName: "Nigerian naira", locale: "en-NG", rate: 48.53, benchmark: "Country benchmark" },
  { id: "senegal", country: "Senegal", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-SN", rate: 102.76, benchmark: "Country benchmark" },
  { id: "sierra-leone", country: "Sierra Leone", currency: "SLE", currencyName: "Sierra Leonean leone", locale: "en-SL", rate: 5.71, benchmark: "Country benchmark" },
  { id: "togo", country: "Togo", currency: "XOF", currencyName: "West African CFA franc", locale: "fr-TG", rate: 111.75, benchmark: "Country benchmark" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return compact ? (
    <img src={solarMarkUrl} alt="Xtorra sun mark" className="h-10 w-10 object-contain" />
  ) : (
    <div className="relative h-[68px] w-[220px] overflow-hidden sm:h-[76px] sm:w-[250px]" aria-label="Xtorra Renewables Limited">
      <img src={logoUrl} alt="Xtorra Renewables Limited" className="absolute left-0 top-[-35px] block h-auto w-full max-w-none sm:top-[-40px]" />
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"calculator" | "utility">("calculator");
  const [activeSolution, setActiveSolution] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [marketId, setMarketId] = useState("nigeria");
  const [monthlyUse, setMonthlyUse] = useState(12000);
  const [energyRate, setEnergyRate] = useState(48.53);
  const [solarCoverage, setSolarCoverage] = useState(65);
  const [systemCost, setSystemCost] = useState(0);
  const [projectionYears, setProjectionYears] = useState<5 | 10 | 20>(5);
  const [boqSalesContext, setBoqSalesContext] = useState<BoqSalesContext | null>(null);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const solution = solutions[activeSolution];
  const SolutionIcon = solution.icon;
  const market = westAfricaMarkets.find((item) => item.id === marketId) ?? westAfricaMarkets[12];
  const hasWholeCurrency = ["XOF", "GNF"].includes(market.currency);
  const safeMonthlyUse = Math.max(0, monthlyUse || 0);
  const safeRate = Math.max(0, energyRate || 0);
  const safeCoverage = Math.min(100, Math.max(0, solarCoverage || 0));
  const safeCost = Math.max(0, systemCost || 0);
  const annualUse = safeMonthlyUse * 12;
  const annualBill = annualUse * safeRate;
  const annualSavings = annualBill * (safeCoverage / 100);
  const coveredUse = annualUse * (safeCoverage / 100);
  const paybackYears = annualSavings > 0 ? safeCost / annualSavings : 0;
  const formatNumber = (value: number) => new Intl.NumberFormat(market.locale, { maximumFractionDigits: 0 }).format(value);
  const formatCurrency = (value: number) => new Intl.NumberFormat(market.locale, { style: "currency", currency: market.currency, maximumFractionDigits: hasWholeCurrency ? 0 : 2 }).format(value);

  useEffect(() => {
    const updateScrollPosition = () => setShowGoToTop(window.scrollY > 560);
    updateScrollPosition();
    window.addEventListener("scroll", updateScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollPosition);
  }, []);

  const returnToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const selectMarket = (nextMarketId: string) => {
    const nextMarket = westAfricaMarkets.find((item) => item.id === nextMarketId);
    if (!nextMarket) return;
    setMarketId(nextMarketId);
    setEnergyRate(nextMarket.rate);
    setSystemCost(0);
  };

  const projectedGridCost = annualBill * projectionYears;
  const projectedSavings = annualSavings * projectionYears;
  const projectedSolarGridCost = Math.max(0, annualBill - annualSavings) * projectionYears;
  const comparisonData = [
    { label: "Current grid", grid: projectedGridCost, solar: 0 },
    { label: "With solar", grid: projectedSolarGridCost, solar: projectedSavings },
  ];

  const calculationContext = [
    `Market: ${market.country} — ${market.currencyName} (${market.currency})`,
    `Monthly electricity use: ${formatNumber(safeMonthlyUse)} kWh`,
    `Electricity rate: ${formatCurrency(safeRate)} per kWh`,
    `Annual electricity use: ${formatNumber(annualUse)} kWh`,
    `Estimated annual grid cost: ${formatCurrency(annualBill)}`,
    `Solar coverage selected: ${safeCoverage}%`,
    `Potential annual cost offset: ${formatCurrency(annualSavings)}`,
    `Potential clean-energy coverage: ${formatNumber(coveredUse)} kWh annually`,
    `Estimated system cost: ${safeCost > 0 ? formatCurrency(safeCost) : "Not entered"}`,
    `Simple payback view: ${annualSavings > 0 && safeCost > 0 ? `${paybackYears.toFixed(1)} years` : "Not calculated"}`,
    `Starting-rate basis: ${market.benchmark}`,
  ];

  const shareSummary = [
    "My Xtorra solar savings planning estimate",
    `${market.country} · ${market.currency}`,
    `Potential annual cost offset: ${formatCurrency(annualSavings)}`,
    `Potential ${projectionYears}-year cost offset: ${formatCurrency(projectedSavings)}`,
    `Solar coverage selected: ${safeCoverage}%`,
    "This is an illustrative planning estimate. Confirm final assumptions with Xtorra.",
  ].join("\n");

  const shareByEmail = () => {
    const subject = encodeURIComponent(`My Xtorra solar savings estimate — ${market.country}`);
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(shareSummary)}`;
  };

  const shareByWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareSummary)}`, "_blank", "noopener,noreferrer");
  };

  const downloadEstimateReport = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    doc.setFillColor(8, 44, 103);
    doc.rect(0, 0, pageWidth, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Xtorra Renewables", 16, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Solar savings planning estimate", 16, 27);
    doc.text(`Prepared ${new Date().toLocaleDateString(market.locale)}`, 16, 34);
    y = 56;
    doc.setTextColor(8, 44, 103);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Your ${market.country} estimate`, 16, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(67, 98, 125);
    doc.text("This downloadable summary carries the same live inputs and results displayed in the calculator.", 16, y, { maxWidth: pageWidth - 32 });
    y += 16;
    doc.setFillColor(238, 246, 220);
    doc.roundedRect(16, y, pageWidth - 32, 34, 2, 2, "F");
    doc.setTextColor(63, 125, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("POTENTIAL ANNUAL COST OFFSET", 22, y + 10);
    doc.setTextColor(8, 44, 103);
    doc.setFontSize(20);
    doc.text(formatCurrency(annualSavings), 22, y + 24);
    doc.setFontSize(9);
    doc.setTextColor(63, 125, 12);
    doc.text(`${formatNumber(coveredUse)} kWh of annual use represented`, pageWidth - 22, y + 23, { align: "right" });
    y += 48;
    doc.setTextColor(8, 44, 103);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Calculation context", 16, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    calculationContext.forEach((item) => {
      doc.setTextColor(61, 91, 117);
      doc.text(`- ${item}`, 18, y, { maxWidth: pageWidth - 36 });
      y += 7;
    });
    y += 5;
    doc.setFillColor(8, 44, 103);
    doc.rect(16, y, pageWidth - 32, 0.5, "F");
    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(8, 44, 103);
    doc.text("Important planning note", 16, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(78, 108, 131);
    doc.text(
      `The ${market.country} starting tariff is a ${market.benchmark.toLowerCase()} converted to local currency for planning use and can be edited in the calculator. This report is not a technical design, tariff quotation, financing offer, or investment recommendation. Confirm final assumptions with Xtorra before making a decision.`,
      16,
      y,
      { maxWidth: pageWidth - 32, lineHeightFactor: 1.35 },
    );
    const footerY = doc.internal.pageSize.getHeight() - 32;
    doc.setFillColor(7, 31, 75);
    doc.rect(0, footerY, pageWidth, 32, "F");
    try {
      const reportLogo = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = logoUrl;
      });
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, footerY + 7, 48, 17, 1.5, 1.5, "F");
      doc.addImage(reportLogo, "PNG", 16, footerY + 8.25, 44, 14.5);
    } catch {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Xtorra Renewables", 16, footerY + 18);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("XTORRA RENEWABLES", 70, footerY + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.text("sales@xtorra.com  |  info@xtorra.com  |  technical@xtorra.com", 70, footerY + 15);
    doc.text("info@chybonsolarenergy.com  |  +234 701 638 2231  |  www.xtorra.com", 70, footerY + 20);
    doc.text("52 Odozi Street, Ojodu Berger, Lagos, Nigeria", 70, footerY + 25);
    doc.save(`xtorra-solar-savings-${market.id}.pdf`);
    toast.success("Your solar savings PDF is downloading.");
  };

  const closeMenu = () => setMenuOpen(false);
  const handoffBoqToSales = (context: BoqSalesContext) => {
    setBoqSalesContext(context);
    window.setTimeout(() => document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    toast.success("Your BoQ context is ready in the sales enquiry.");
  };
  const handleBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const organisation = String(form.get("organisation") || "");
    const focus = String(form.get("focus") || "");
    const interest = String(form.get("interest") || "");
    const notes = String(form.get("notes") || "");
    const subject = encodeURIComponent(`${boqSalesContext ? "Xtorra BoQ sales enquiry" : "Xtorra project conversation"} — ${organisation || name || "new enquiry"}`);
    const boqBlock = boqSalesContext ? `\n\n${boqSalesContext.summary}` : "";
    const body = encodeURIComponent(`Name: ${name}\nOrganisation: ${organisation}\nEnergy focus: ${focus}\nSpecific renewable energy interest: ${interest}${boqBlock}\n\nSolar savings calculation context:\n${calculationContext.join("\n")}\n\nProject note:\n${notes}`);
    window.location.href = `mailto:sales@xtorra.com?subject=${subject}&body=${body}`;
    toast.success("Your enquiry email has been prepared.");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F8F3] text-[#082C67]">
      <header className="relative z-30 border-b border-[#D7E0E5] bg-[#FCFCF8]/95 backdrop-blur-xl">
        <div className="pointer-events-none absolute bottom-0 left-0 hidden h-px w-[28vw] bg-gradient-to-r from-transparent via-[#0F6693]/45 to-[#58A90E] min-[1500px]:block" aria-hidden="true" />
        <div className="container flex h-[78px] items-center justify-between gap-4">
          <a href="#top" aria-label="Xtorra Renewables home" className="shrink-0" onClick={closeMenu}>
            <Logo />
          </a>
          <div className="hidden items-center gap-2 border-l border-[#C7D4DB] pl-4 text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-[#54758A] xl:flex"><span className="sunburst-mark !h-3 !w-3" /><span>Origin / N06°31′</span><span className="h-px w-8 bg-gradient-to-r from-[#0F6693]/45 to-[#58A90E]" /><span className="text-[#244F72]">Field guide</span></div>
          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#calculator" className="nav-link">Savings tool</a>
            <a href="#system-design" className="nav-link">Design tool</a>
            <a href="#case-studies" className="nav-link">Case studies</a>
            <a href="#method" className="nav-link">How we work</a>
            <a href="#impact" className="nav-link">Why Xtorra</a>
          </nav>
          <a href="#enquire" className="hidden items-center gap-2 text-sm font-extrabold text-[#082C67] lg:flex">
            Start a conversation <ArrowUpRight className="h-4 w-4 text-[#58A90E]" />
          </a>
          <button className="grid h-11 w-11 place-items-center border border-[#C7D4DB] text-[#082C67] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="container absolute left-0 top-full w-full border-b border-[#D7E0E5] bg-[#FCFCF8] py-6 shadow-xl lg:hidden">
            <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
              {[['Solutions', '#solutions'], ['Savings tool', '#calculator'], ['Design tool', '#system-design'], ['Case studies', '#case-studies'], ['How we work', '#method'], ['Why Xtorra', '#impact'], ['Start a conversation', '#enquire']].map(([label, href]) => (
                <a key={label} href={href} onClick={closeMenu} className="flex items-center justify-between font-bold text-[#082C67]">{label}<ArrowUpRight className="h-4 w-4 text-[#58A90E]" /></a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden border-b border-[#D7E0E5]">
          <div className="absolute inset-y-0 right-0 w-full bg-[#E7EEF1] lg:w-[53%]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-[450px] w-[450px] rounded-full border border-[#0F6693]/15 sm:right-8 sm:h-[580px] sm:w-[580px]" />
          <div className="pointer-events-none absolute -right-2 top-8 h-[370px] w-[370px] rounded-full border border-[#58A90E]/20 sm:right-28 sm:h-[460px] sm:w-[460px]" />
          <div className="pointer-events-none absolute -left-24 top-8 h-[620px] w-[820px] opacity-70" aria-hidden="true">
            <svg viewBox="0 0 820 620" className="h-full w-full" fill="none">
              <path d="M-30 468C145 344 265 354 420 230C525 146 614 96 848 74" stroke="#0F6693" strokeOpacity=".22" strokeWidth="1.2" />
              <path d="M-10 510C160 386 308 402 472 270C596 170 686 126 830 112" stroke="#58A90E" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="4 8" />
              <path d="M236 40A272 272 0 0 1 564 245" stroke="#082C67" strokeOpacity=".15" strokeWidth="1" />
              <path d="M236 40L312 214M236 40L420 160M236 40L500 96" stroke="#58A90E" strokeOpacity=".4" strokeWidth="1" />
              <circle cx="472" cy="270" r="5" fill="#58A90E" />
              <circle cx="472" cy="270" r="12" stroke="#58A90E" strokeOpacity=".45" />
            </svg>
          </div>
          <div className="pointer-events-none absolute left-6 top-6 hidden items-center gap-2 border border-[#082C67]/20 bg-[#FCFCF8]/75 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] backdrop-blur md:flex" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-[#58A90E]" />N06°31′ / E003°23′ · FIELD ROUTE</div>
          <div className="container relative grid min-h-[690px] items-stretch lg:grid-cols-[0.98fr_1.02fr]">
            <div className="relative z-10 flex flex-col justify-between py-14 sm:py-20 lg:py-24 lg:pr-12">
              <div>
                <div className="rise-in flex items-center gap-3">
                  <span className="h-px w-9 bg-[#58A90E]" />
                  <p className="eyebrow">Xtorra Renewables / Field notes 01</p>
                </div>
                <div className="rise-in mt-6 flex max-w-[580px] items-center gap-3 border-y border-[#B8CBD3] py-3 text-[0.59rem] font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">
                  <span className="flex items-center gap-2 text-[#082C67]"><span className="grid h-5 w-5 place-items-center rounded-full border border-[#58A90E] bg-[#F8F8F3] text-[0.52rem] text-[#3F7D0C]">01</span>Origin</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[#0F6693]/45 via-[#58A90E] to-[#0F6693]/20" />
                  <span>Demand → route → evidence</span>
                </div>
                <h1 className="rise-in-delay mt-8 max-w-[700px] font-display text-[3.8rem] leading-[0.9] tracking-[-0.05em] text-[#082C67] sm:text-[5.4rem] lg:text-[6.2rem]">
                  Power your next <em className="text-[#58A90E]">move.</em>
                </h1>
                <p className="rise-in-delay-2 mt-7 max-w-[510px] text-base leading-8 text-[#42627D] sm:text-lg">
                  Xtorra helps organisations turn energy ambition into clear, dependable clean-power action—one practical decision at a time.
                </p>
                <div className="rise-in-delay-2 mt-9 flex flex-wrap gap-3">
                  <Button asChild className="h-12 rounded-none bg-[#082C67] px-6 text-sm font-extrabold text-white hover:bg-[#0D3D83] active:scale-[.97]">
                    <a href="#enquire">Open a project field station <ArrowDownRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-none border-[#AFC3CD] bg-white/40 px-6 text-sm font-extrabold text-[#082C67] hover:bg-white active:scale-[.97]">
                    <a href="#solutions">Inspect the energy field <ChevronRight className="ml-1 h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
              <div className="mt-16 flex max-w-[510px] items-center gap-5 border-t border-[#BACBD3] pt-6 text-xs leading-5 text-[#527087] sm:mt-20">
                <Compass className="h-7 w-7 shrink-0 text-[#58A90E]" />
                <p>Begin with the right coordinates: energy demand, site realities, and a direction your team can stand behind.</p>
              </div>
            </div>
            <div className="relative min-h-[390px] overflow-hidden lg:my-10 lg:min-h-0">
              <img src="/manus-storage/xtorra-hero-clean-energy-campus_aa6f1d07.jpg" alt="Solar panels and wind turbines at a clean energy site" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082C67]/35 via-transparent to-white/5" />
              <div className="pointer-events-none absolute inset-0 opacity-85" aria-hidden="true"><svg viewBox="0 0 740 700" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M0 590C170 480 300 490 448 358C554 264 652 178 760 138" stroke="white" strokeOpacity=".38" strokeWidth="1" /><path d="M0 626C188 512 340 524 486 396" stroke="#A9D829" strokeOpacity=".85" strokeWidth="1.3" strokeDasharray="5 10" /><path d="M630 82a116 116 0 0 1 78 104" stroke="white" strokeOpacity=".5" strokeWidth="1" /><path d="M630 82l26 66m-26-66 60 32m-60-32 78 2" stroke="#A9D829" strokeOpacity=".85" strokeWidth="1" /></svg></div>
              <div className="absolute left-6 top-6 border border-white/35 bg-[#082C67]/65 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur sm:left-8 sm:top-8">FIELD EVIDENCE / 01</div>
              <div className="absolute bottom-6 left-6 max-w-[230px] border-l-2 border-[#A9D829] bg-[#082C67]/88 px-4 py-4 text-white backdrop-blur sm:bottom-8 sm:left-8">
                <p className="eyebrow !text-[#CBEF7B]">The energy field</p>
                <p className="mt-2 text-sm leading-5 text-white/85">A route to cleaner power can be practical, phased, and made for your site.</p>
              </div>
              <div className="absolute bottom-6 right-6 hidden border border-white/30 bg-white/10 px-3 py-2 text-[0.56rem] font-extrabold uppercase tracking-[0.15em] text-white/90 backdrop-blur sm:bottom-8 sm:right-8 md:block">Station 01 · Azimuth 118°</div>
              <div className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-white/10 backdrop-blur sm:right-8 sm:top-8">
                <img src={solarMarkUrl} alt="" className="h-9 w-9 object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="relative overflow-hidden bg-[#F8F8F3] py-20 sm:py-28">
          <div className="pointer-events-none absolute right-0 top-20 h-px w-[25vw] energy-line opacity-65" />
          <div className="pointer-events-none absolute right-16 top-16 h-24 border-l border-[#0F6693]/15" />
          <div className="container">
            <div className="grid gap-8 border-b border-[#D1DDE2] pb-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <p className="eyebrow">02 / Capabilities</p>
                <h2 className="mt-5 max-w-[510px] font-display text-5xl leading-[0.95] tracking-[-0.045em] text-[#082C67] sm:text-6xl">Energy systems that meet the real world.</h2>
              </div>
              <p className="max-w-[520px] text-base leading-8 text-[#527087]">Every energy story starts in a different place. Explore the paths we bring together to help make cleaner power more useful, resilient, and actionable.</p>
            </div>

            <div className="grid pt-10 lg:grid-cols-[0.42fr_0.58fr]">
              <div className="border-b border-[#D1DDE2] lg:border-b-0 lg:border-r lg:pr-8">
                {solutions.map((item, index) => {
                  const Icon = item.icon;
                  const active = index === activeSolution;
                  return (
                    <button key={item.title} onClick={() => setActiveSolution(index)} className={`group flex w-full items-center gap-4 border-b border-[#D1DDE2] py-5 text-left transition-colors ${active ? 'text-[#082C67]' : 'text-[#7790A1] hover:text-[#082C67]'}`}>
                      <span className={`grid h-10 w-10 place-items-center rounded-full border ${active ? 'border-[#58A90E] bg-[#58A90E] text-white' : 'border-[#C5D3DA] text-[#5F7E91]'}`}><Icon className="h-4 w-4" /></span>
                      <span className="flex-1"><span className="block text-[0.65rem] font-extrabold tracking-[0.16em] opacity-70">{item.index}</span><span className="mt-1 block text-lg font-extrabold">{item.title}</span></span>
                      <ChevronRight className={`h-5 w-5 transition-transform ${active ? 'translate-x-0 text-[#58A90E]' : '-translate-x-1'}`} />
                    </button>
                  );
                })}
              </div>

              <article className="service-card pt-8 lg:pl-12 lg:pt-0">
                <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
                  <div>
                    <div className="flex items-center gap-3"><SolutionIcon className="h-5 w-5 text-[#58A90E]" /><p className="eyebrow">{solution.index} / {solution.shortTitle}</p></div>
                    <h3 className="mt-5 font-display text-4xl leading-none tracking-[-0.035em]">{solution.title}</h3>
                    <p className="mt-5 text-sm leading-7 text-[#527087]">{solution.description}</p>
                    <ul className="mt-7 space-y-3">
                      {solution.points.map((point) => <li key={point} className="flex items-center gap-3 text-sm font-bold text-[#244F72]"><CircleCheck className="h-4 w-4 shrink-0 text-[#58A90E]" />{point}</li>)}
                    </ul>
                    <a href="#enquire" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[#082C67] hover:text-[#58A90E]">Talk through this route <ArrowUpRight className="h-4 w-4" /></a>
                  </div>
                  <div className="service-visual relative aspect-[4/5] overflow-hidden bg-[#DDE8E9]">
                    <img src={solution.image} alt={solution.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true"><svg viewBox="0 0 400 500" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M0 424C86 360 178 386 262 272C314 202 348 138 416 102" stroke="white" strokeOpacity=".5" /><path d="M0 452C106 380 216 404 302 296" stroke="#A9D829" strokeOpacity=".85" strokeDasharray="4 8" /><path d="M324 44a78 78 0 0 1 56 69" stroke="white" strokeOpacity=".55" /><circle cx="302" cy="296" r="5" fill="#A9D829" /></svg></div>
                    <span className="absolute right-4 top-4 border border-white/40 bg-[#082C67]/70 px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-white backdrop-blur">Site record</span>
                    <span className="absolute bottom-4 left-4 border-l-2 border-[#A9D829] bg-[#082C67]/85 px-3 py-2 text-[0.63rem] font-extrabold uppercase tracking-[0.13em] text-white">In focus / {solution.shortTitle}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="method" className="relative overflow-hidden bg-[#082C67] py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute -left-40 bottom-0 h-[560px] w-[560px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -left-10 bottom-10 h-[400px] w-[400px] rounded-full border border-[#A9D829]/20" />
          <div className="container relative">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="eyebrow !text-[#CBEF7B]">03 / The delivery path</p>
                <h2 className="mt-5 max-w-[490px] font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl">Clear coordinates. Better energy decisions.</h2>
              </div>
              <p className="max-w-[510px] text-base leading-8 text-[#B8CCDE]">We believe renewable-energy projects deserve a working rhythm that makes decisions feel informed rather than overwhelming.</p>
            </div>
            <div className="mt-14 grid gap-0 border-y border-white/15 md:grid-cols-3">
              {steps.map(([number, title, description], index) => (
                <div key={number} className={`relative py-9 ${index ? 'md:border-l md:border-white/15 md:pl-9' : 'md:pr-9'} ${index !== steps.length - 1 ? 'border-b border-white/15 md:border-b-0' : ''}`}>
                  <span className="font-display text-5xl text-[#A9D829]">{number}</span>
                  <h3 className="mt-8 text-xl font-extrabold">{title}</h3>
                  <p className="mt-4 max-w-[280px] text-sm leading-7 text-[#B8CCDE]">{description}</p>
                  {index < steps.length - 1 && <span className="absolute right-0 top-10 hidden h-px w-8 translate-x-4 bg-[#A9D829] md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="calculator" className="relative overflow-hidden bg-[#E9F0E9] py-20 sm:py-28">
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-[470px] w-[470px] rounded-full border border-[#58A90E]/20" />
          <div className="pointer-events-none absolute -bottom-8 right-8 h-[350px] w-[350px] rounded-full border border-[#082C67]/10" />
          <div className="pointer-events-none absolute left-6 top-8 hidden border border-[#0F6693]/20 bg-[#F8F8F3]/80 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] backdrop-blur lg:block">DATUM 04 · SAVINGS FIELD / WEST AFRICA</div>
          <div className="pointer-events-none absolute right-8 top-24 hidden h-40 w-[42vw] lg:block" aria-hidden="true"><svg viewBox="0 0 520 160" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-8 136C100 82 176 118 260 69C347 18 411 32 540 8" stroke="#0F6693" strokeOpacity=".17" /><path d="M-8 148C115 100 205 130 294 80" stroke="#58A90E" strokeOpacity=".45" strokeDasharray="4 9" /><circle cx="294" cy="80" r="4" fill="#58A90E" /></svg></div>
          <div className="container relative">
            <div className="grid gap-8 border-b border-[#B8CEC1] pb-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-[#58A90E]" /><p className="eyebrow">04 / Savings tool</p></div>
                <h2 className="mt-5 max-w-[570px] font-display text-5xl leading-[0.95] tracking-[-0.045em] text-[#082C67] sm:text-6xl">A first view of what solar could save.</h2>
              </div>
              <p className="max-w-[540px] text-base leading-8 text-[#527087]">Adjust the coordinates below to explore a simple annual energy-and-cost estimate. It is an early planning tool, not a technical design or a commercial proposal.</p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
              <div className="paper-card p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-[#D5E0D8] pb-5">
                  <div><p className="eyebrow">Field instrument / 04A</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">Set your starting point</p></div>
                  <span className="rounded-full bg-[#E5F6BB] px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#3F7D0C]">Illustrative</span>
                </div>
                <div className="mt-6 grid gap-7 sm:grid-cols-2">
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D] sm:col-span-2">Market and local currency<select value={marketId} onChange={(event) => selectMarket(event.target.value)} className="field-input mt-2 rounded-none font-bold"><option value="nigeria">Nigeria — Nigerian naira (NGN)</option>{westAfricaMarkets.filter((item) => item.id !== "nigeria").map((item) => <option key={item.id} value={item.id}>{item.country} — {item.currencyName} ({item.currency})</option>)}</select><span className="mt-2 block normal-case tracking-normal text-[#6E8A9B]">Switching market resets the electricity-rate starting point and clears the site-cost field for a new local estimate.</span></label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">Monthly electricity use<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">kWh per month</span><input type="number" min="0" step="100" value={monthlyUse} onChange={(event) => setMonthlyUse(Number(event.target.value))} className="field-input mt-2 font-bold" /></label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">Electricity rate<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">{market.currency} per kWh</span><div className="mt-2 flex items-center border-b border-[#B8C7D4] focus-within:border-[#58A90E]"><span className="w-12 py-3 text-sm font-bold">{market.currency}</span><input type="number" min="0" step="0.01" value={energyRate} onChange={(event) => setEnergyRate(Number(event.target.value))} className="w-full bg-transparent py-3 text-sm font-bold outline-none" /></div></label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">Solar coverage<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">estimated share of demand</span><div className="mt-4 flex items-center gap-4"><input type="range" min="0" max="100" value={solarCoverage} onChange={(event) => setSolarCoverage(Number(event.target.value))} className="h-1.5 flex-1 accent-[#58A90E]" /><span className="w-10 text-right text-base font-extrabold text-[#082C67]">{safeCoverage}%</span></div></label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">Estimated system cost<span className="mt-1 block normal-case tracking-normal text-[#7B94A3]">{market.currency}; enter a site-specific figure</span><div className="mt-2 flex items-center border-b border-[#B8C7D4] focus-within:border-[#58A90E]"><span className="w-12 py-3 text-sm font-bold">{market.currency}</span><input type="number" min="0" step="500" value={systemCost || ""} onChange={(event) => setSystemCost(Number(event.target.value))} className="w-full bg-transparent py-3 text-sm font-bold outline-none" placeholder="Add a proposed or budget cost" /></div></label>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[#082C67] p-7 text-white sm:p-10">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#CBEF7B]/20" />
                <div className="pointer-events-none absolute -right-5 -top-5 h-52 w-52 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute left-0 top-14 h-px w-20 bg-[#CBEF7B]/70" />
                <div className="pointer-events-none absolute right-7 top-8 border border-white/20 bg-[#082C67]/50 px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-[#CBEF7B]">MEASURED OUTPUT</div>
                <div className="relative">
                  <p className="eyebrow !text-[#CBEF7B]">Your estimated annual picture</p>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div className="border-b border-white/15 pb-7 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-7">
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#B9CCDC]">Potential annual savings</p>
                      <p className="mt-3 max-w-full whitespace-nowrap font-display text-[clamp(1.65rem,2.85vw,2.5rem)] leading-[1.04] tracking-[-0.045em] text-white tabular-nums">{formatCurrency(annualSavings)}</p>
                      <p className="mt-3 text-sm leading-6 text-[#B9CCDC]">based on your estimated solar offset and current electricity rate.</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#B9CCDC]">Potential clean-energy coverage</p>
                      <p className="mt-3 font-display text-3xl tracking-[-0.035em] text-white sm:text-4xl">{formatNumber(coveredUse)}</p>
                      <p className="mt-3 text-sm leading-6 text-[#B9CCDC]">kWh of annual use represented by your selected coverage.</p>
                    </div>
                  </div>
                  <div className="mt-8 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-2">
                    <p className="text-sm text-[#D8E5EE]"><span className="font-extrabold text-white">Estimated annual bill:</span> {formatCurrency(annualBill)}</p>
                    <p className="text-sm text-[#D8E5EE]"><span className="font-extrabold text-white">Simple payback view:</span> {annualSavings > 0 ? `${paybackYears.toFixed(1)} years` : "Add energy-use inputs"}</p>
                  </div>
                  <div className="mt-8 border-t border-white/15 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#D8E5EE]">{projectionYears}-year cost comparison</p>
                      <div className="flex items-center border border-white/20 p-0.5 text-[0.66rem] font-extrabold text-[#D8E5EE]" aria-label="Savings projection period">
                        {([5, 10, 20] as const).map((years) => <button key={years} onClick={() => setProjectionYears(years)} className={`px-2.5 py-1.5 transition-colors ${projectionYears === years ? 'bg-[#A9D829] text-[#082C67]' : 'hover:bg-white/10'}`} aria-pressed={projectionYears === years}>{years}Y</button>)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{formatCurrency(projectedSavings)} <span className="font-normal text-[#B9CCDC]">potential cost offset across {projectionYears} years</span></p>
                    <div className="mt-3 flex items-center gap-4 text-[0.68rem] font-bold text-[#D8E5EE]"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#5E91CF]" />Remaining grid cost</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#A9D829]" />Solar cost offset</span></div>
                    <div className="mt-3 h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="32%">
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#D8E5EE", fontSize: 11, fontWeight: 700 }} />
                          <YAxis hide />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.08)" }} contentStyle={{ background: "#F8F8F3", border: "none", borderRadius: 0, color: "#082C67", boxShadow: "0 12px 30px rgba(0,0,0,0.22)" }} labelStyle={{ color: "#527087", fontWeight: 800 }} formatter={(value: number | string) => formatCurrency(Number(value))} />
                          <Bar dataKey="grid" name="Grid cost" stackId="cost" fill="#5E91CF" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="solar" name="Solar offset" stackId="cost" fill="#A9D829" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <p className="mt-7 max-w-[580px] text-xs leading-5 text-[#B9CCDC]">The {market.country} starting tariff is a {market.benchmark.toLowerCase()} converted to local currency for planning use and is editable. This calculator excludes site constraints, system losses, degradation, export payments, maintenance, tax treatment, incentives, finance costs, and future tariff changes. Discuss verified assumptions with Xtorra before making an energy or investment decision.</p>
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <a href="#enquire" className="inline-flex items-center gap-2 border-b border-[#CBEF7B] pb-1 text-sm font-extrabold text-[#CBEF7B] hover:text-white">Turn this estimate into a conversation <ArrowDownRight className="h-4 w-4" /></a>
                    <Button type="button" variant="outline" onClick={downloadEstimateReport} className="h-10 rounded-none border-white/30 bg-white/5 px-4 text-xs font-extrabold text-white hover:bg-white hover:text-[#082C67] active:scale-[.97]"><Download className="mr-2 h-3.5 w-3.5" />Download PDF report</Button>
                    <Button type="button" variant="outline" onClick={shareByEmail} className="h-10 rounded-none border-white/30 bg-white/5 px-4 text-xs font-extrabold text-white hover:bg-white hover:text-[#082C67] active:scale-[.97]"><Mail className="mr-2 h-3.5 w-3.5" />Share by email</Button>
                    <Button type="button" variant="outline" onClick={shareByWhatsApp} className="h-10 rounded-none border-white/30 bg-white/5 px-4 text-xs font-extrabold text-white hover:bg-white hover:text-[#082C67] active:scale-[.97]"><MessageCircle className="mr-2 h-3.5 w-3.5" />Share via WhatsApp</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 hidden h-20 overflow-hidden bg-[#F2F6F3] lg:block" aria-hidden="true"><svg viewBox="0 0 1440 80" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-16 42C150 20 255 66 430 38C586 12 730 66 900 36C1080 5 1234 56 1456 21" stroke="#0F6693" strokeOpacity=".22" /><path d="M-16 48C152 29 260 71 442 44C608 19 736 71 914 43C1088 17 1248 61 1456 29" stroke="#58A90E" strokeOpacity=".56" strokeDasharray="4 10" /><circle cx="914" cy="43" r="4" fill="#58A90E" /></svg><div className="absolute left-[58%] top-1/2 -translate-y-1/2 border border-[#0F6693]/20 bg-[#F8F8F3]/90 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] shadow-sm">Route transition / 04 → 05</div></div>
        {/* Tab Navigation */}
<section className="py-12 bg-white border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex gap-4 border-b border-gray-200 mb-8">
      <button
        onClick={() => setActiveTab("calculator")}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === "calculator"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Solar Calculator
      </button>
      <button
        onClick={() => setActiveTab("utility")}
        className={`px-6 py-3 font-semibold transition-colors ${
          activeTab === "utility"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Utility Scale
      </button>
    </div>

    {/* Tab Content */}
    {activeTab === "calculator" && <SolarDesignCalculator onBoqEnquiry={handoffBoqToSales} />}
    {activeTab === "utility" && <UtilityScale />}
  </div>
</section>

        <div className="relative z-10 hidden h-20 overflow-hidden bg-[#E7EFF1] lg:block" aria-hidden="true"><svg viewBox="0 0 1440 80" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-14 55C142 24 278 72 444 42C590 16 746 74 906 37C1072 1 1230 52 1454 18" stroke="#0F6693" strokeOpacity=".22" /><path d="M-14 62C154 36 288 80 458 50C608 24 756 82 922 46" stroke="#58A90E" strokeOpacity=".55" strokeDasharray="4 10" /><circle cx="922" cy="46" r="4" fill="#58A90E" /></svg><div className="absolute left-[61%] top-1/2 -translate-y-1/2 border border-[#0F6693]/20 bg-[#F8F8F3]/90 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] shadow-sm">Route transition / 05 → 06</div></div>

        <section id="impact" className="relative overflow-hidden bg-[#E7EFF1] py-20 sm:py-28">
          <div className="pointer-events-none absolute left-0 top-14 h-px w-[28vw] bg-gradient-to-r from-[#58A90E] via-[#0F6693]/45 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-10 hidden h-28 w-[46vw] lg:block" aria-hidden="true"><svg viewBox="0 0 580 112" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-12 92C118 40 214 98 340 49C430 14 498 40 596 8" stroke="#0F6693" strokeOpacity=".2" /><path d="M-12 101C122 57 228 105 356 60" stroke="#58A90E" strokeOpacity=".5" strokeDasharray="4 9" /><circle cx="356" cy="60" r="4" fill="#58A90E" /></svg></div>
          <div className="pointer-events-none absolute -right-14 bottom-0 h-64 w-64 rounded-full border border-[#0F6693]/15" />
          <div className="pointer-events-none absolute right-7 top-8 hidden border border-[#0F6693]/20 bg-[#F8F8F3]/75 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] backdrop-blur lg:block">FIELD NOTE 05 · LONG VIEW</div>
          <div className="container grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="relative min-h-[460px] overflow-hidden">
              <img src="/manus-storage/xtorra-wind-solar-landscape_3c705ede.jpg" alt="Wind turbines and solar panels integrated into open landscape" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082C67]/65 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0" aria-hidden="true"><svg viewBox="0 0 640 480" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-20 374C130 270 238 328 362 202C438 124 520 82 676 58" stroke="white" strokeOpacity=".46" /><path d="M-20 406C122 304 250 354 390 226" stroke="#A9D829" strokeOpacity=".8" strokeDasharray="5 10" /><circle cx="390" cy="226" r="5" fill="#A9D829" /><path d="M500 46a92 92 0 0 1 72 78" stroke="white" strokeOpacity=".55" /></svg></div>
              <div className="absolute left-6 top-6 border border-white/35 bg-[#082C67]/70 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur sm:left-8 sm:top-8">FIELD EVIDENCE / 05</div>
              <div className="absolute right-6 top-6 border border-white/30 bg-[#082C67]/65 px-2 py-1 text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-[#CBEF7B] backdrop-blur sm:right-8 sm:top-8">AZI 146° / SITE MATRIX</div>
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
                <div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-[#CBEF7B]" /><p className="eyebrow !text-[#CBEF7B]">Designed around what lasts</p></div>
                <p className="mt-3 max-w-[360px] text-base leading-7 text-white/90">The strongest energy strategy belongs to the place it serves—and remains useful as that place changes.</p>
              </div>
            </div>
            <div className="lg:pl-10">
              <p className="eyebrow">05 / The Xtorra perspective</p>
              <h2 className="mt-5 max-w-[570px] font-display text-5xl leading-[0.95] tracking-[-0.045em] text-[#082C67] sm:text-6xl">Less noise. More useful energy.</h2>
              <p className="mt-7 max-w-[580px] text-base leading-8 text-[#527087]">Clean power is not a single technology decision. It is a practical conversation between your operation, your future, and the resources available to you today.</p>
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {[
                  ["Grounded", "We start with the realities that affect your project—not a one-size-fits-all answer."],
                  ["Connected", "Generation, storage, and operational priorities should work as a coordinated whole."],
                  ["Considered", "Every next step is framed so your team can act with clarity and confidence."],
                  ["Forward-facing", "A strong route does the work now while keeping space for what comes next."],
                ].map(([title, copy]) => (
                  <div key={title} className="border-l-2 border-[#58A90E] pl-4"><h3 className="text-sm font-extrabold text-[#082C67]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#58758A]">{copy}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="case-studies" className="relative overflow-hidden bg-[#F8F8F3] py-20 sm:py-28">
          <div className="pointer-events-none absolute right-0 top-20 h-px w-[31vw] energy-line opacity-70" />
          <div className="pointer-events-none absolute -right-28 top-7 h-64 w-64 rounded-full border border-[#58A90E]/15" />
          <div className="pointer-events-none absolute left-8 top-10 hidden items-center gap-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#345E7D] lg:flex"><span className="h-px w-10 bg-[#58A90E]" />ROUTE RECORD / 06</div>
          <div className="container relative">
            <div className="grid gap-8 border-b border-[#D1DDE2] pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="eyebrow">05 / Case studies</p>
                <h2 className="mt-5 max-w-[540px] font-display text-5xl leading-[0.95] tracking-[-0.045em] text-[#082C67] sm:text-6xl">Energy projects, designed to perform.</h2>
              </div>
              <p className="max-w-[570px] text-base leading-8 text-[#527087]">Explore practical energy pathways that can be shaped around a site’s load profile, operating rhythm, and appetite for a cleaner, more resilient supply.</p>
            </div>
            <div className="mt-6 hidden items-center gap-3 text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-[#54758A] md:flex" aria-hidden="true"><span className="sunburst-mark" /><span className="h-px w-16 bg-[#58A90E]" /><span>Evidence route / 06A</span><span className="h-px flex-1 bg-[#0F6693]/20" /><span>N06° / E003°</span></div>
            <div className="mt-8 grid gap-6 md:grid-cols-[0.92fr_1.16fr_0.92fr]">
              {caseStudies.map((study, index) => (
                <article key={study.label} className={`group relative overflow-hidden bg-[#082C67] ${index === 1 ? 'md:mt-12' : ''}`}>
                  <div className="aspect-[4/5] overflow-hidden"><img src={study.image} alt="Renewable energy project profile visual" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#082C67] via-[#082C67]/25 to-transparent" />
                  <div className="absolute left-5 top-5 border border-white/25 bg-[#082C67]/70 px-2 py-1 text-[0.54rem] font-extrabold uppercase tracking-[0.12em] text-[#CBEF7B] backdrop-blur">N06° / E003° · DATUM {String(index + 1).padStart(2, "0")}</div>
                  <div className="absolute right-5 top-5 flex items-center gap-2 border border-white/25 bg-[#082C67]/70 px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur"><span className="sunburst-mark !shadow-[inset_0_0_0_3px_#082C67]" />Field route / {String(index + 1).padStart(2, "0")}</div>
                  <div className="pointer-events-none absolute left-5 top-16 h-14 w-14 border-l border-t border-white/45" aria-hidden="true" />
                  <div className="absolute left-5 top-[8.75rem] border-l-2 border-[#A9D829] bg-[#082C67]/70 px-2 py-1 text-[0.52rem] font-extrabold uppercase tracking-[0.12em] text-white/90 backdrop-blur">DATUM / {String(31 + index * 8).padStart(2, "0")}°N</div>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                    <p className="eyebrow !text-[#CBEF7B]">{study.label}</p>
                    <h3 className="mt-3 text-2xl font-extrabold leading-tight">{study.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">{study.prompt}</p>
                    <a href="#enquire" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#CBEF7B] hover:text-white">Discuss a similar project <ArrowUpRight className="h-4 w-4" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="enquire" className="relative overflow-hidden bg-[#F8F8F3] py-20 sm:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-[#D7F08C]/35" />
          <div className="pointer-events-none absolute -right-6 top-0 hidden h-56 w-56 lg:block" aria-hidden="true"><svg viewBox="0 0 240 240" className="h-full w-full" fill="none"><path d="M228 26A192 192 0 0 0 26 228" stroke="#0F6693" strokeOpacity=".23" /><path d="M228 26L148 78M228 26L104 130M228 26L61 180" stroke="#58A90E" strokeOpacity=".52" strokeDasharray="3 7" /><circle cx="228" cy="26" r="5" fill="#58A90E" /></svg></div>
          <div className="pointer-events-none absolute bottom-14 left-0 h-px w-[18vw] energy-line opacity-75" />
          <div className="pointer-events-none absolute bottom-5 left-[18vw] h-10 border-l border-[#0F6693]/20" />
          <div className="pointer-events-none absolute left-8 top-8 hidden border border-[#0F6693]/20 bg-white/70 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.15em] text-[#244F72] backdrop-blur lg:block">TERMINUS 07 · SALES ROUTE</div>
          <div className="pointer-events-none absolute right-24 top-20 hidden h-24 w-[35vw] lg:block" aria-hidden="true"><svg viewBox="0 0 440 110" className="h-full w-full" fill="none" preserveAspectRatio="none"><path d="M-10 90C94 40 181 84 274 37C333 7 380 28 452 12" stroke="#0F6693" strokeOpacity=".2" /><path d="M-10 98C105 54 190 94 294 45" stroke="#58A90E" strokeOpacity=".55" strokeDasharray="4 9" /><circle cx="294" cy="45" r="4" fill="#58A90E" /></svg></div>
          <div className="container relative grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-20">
            <div>
              <p className="eyebrow">07 / Start here</p>
              <h2 className="mt-5 max-w-[490px] font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl">Let’s map your energy opportunity.</h2>
              <p className="mt-7 max-w-[420px] text-base leading-8 text-[#527087]">Share a few coordinates. We’ll prepare a simple enquiry email you can send through your preferred channel.</p>
              <div className="mt-10 flex items-center gap-4 border-t border-[#D1DDE2] pt-6">
                <Zap className="h-7 w-7 text-[#58A90E]" />
                <p className="text-sm font-bold leading-6 text-[#244F72]">No generic pitch. Just a useful starting conversation about where clean power could work harder.</p>
              </div>
            </div>
            <form onSubmit={handleBrief} className="paper-card noise-surface relative overflow-hidden px-6 py-7 sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-b border-l border-[#58A90E]/35" aria-hidden="true" />
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#D6E2DB] pb-5"><div><p className="eyebrow">Field station / 07A</p><p className="mt-2 text-sm font-extrabold text-[#082C67]">Record your energy coordinates</p></div><span className="border border-[#0F6693]/20 bg-[#F8F8F3] px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[#345E7D]">Route terminus</span></div>
              {boqSalesContext && <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-l-2 border-[#58A90E] bg-[#EEF6E5] px-4 py-3 text-xs leading-5 text-[#42627D]"><p><span className="font-extrabold text-[#082C67]">BoQ context ready:</span> {boqSalesContext.customerName || "Customer"} · {boqSalesContext.projectLocation}. The live design basis and preferences will be included in the sales email.</p><button type="button" onClick={() => setBoqSalesContext(null)} className="font-extrabold text-[#244F72] hover:text-[#58A90E]">Clear</button></div>}
              <div className="grid gap-x-8 sm:grid-cols-2">
                <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D]">Your name<input required name="name" className="field-input mt-2" placeholder="How should we address you?" /></label>
                <label className="mt-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D] sm:mt-0">Organisation<input key={boqSalesContext?.customerName || "organisation"} name="organisation" defaultValue={boqSalesContext?.customerName || ""} className="field-input mt-2" placeholder="Your company or project" /></label>
                <label className="mt-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D] sm:col-span-2">Energy focus<select required name="focus" className="field-input mt-2 rounded-none"><option value="">Choose a starting point</option><option>Solar systems</option><option>Energy storage</option><option>Hybrid energy</option><option>Exploring the right route</option></select></label>
                <label className="mt-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D] sm:col-span-2">Specific renewable energy interest<select required name="interest" className="field-input mt-2 rounded-none"><option value="">Choose your area of interest</option><option>Commercial solar PV</option><option>Industrial or utility-scale solar</option><option>Battery energy storage</option><option>Hybrid solar and storage</option><option>Off-grid or remote power</option><option>Energy assessment and monitoring</option><option>Other / not sure yet</option></select></label>
                <label className="mt-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#345E7D] sm:col-span-2">What are you planning?<textarea name="notes" required rows={4} className="field-input mt-2 resize-none" placeholder="A few details about your site, energy priorities, or timeline." /></label>
              </div>
              <div className="mt-9 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-[290px] text-xs leading-5 text-[#678398]">Selecting this button opens a draft email addressed to Xtorra sales. Your active savings inputs are included, together with any BoQ context you prepared; you choose how and when to send it.</p>
                <Button type="submit" className="h-12 rounded-none bg-[#58A90E] px-6 font-extrabold text-white hover:bg-[#3F8D08] active:scale-[.97]">{boqSalesContext ? "Prepare BoQ sales email" : "Prepare enquiry email"} <Send className="ml-2 h-4 w-4" /></Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#071F4B] py-9 text-white">
        <div className="container flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="flex items-center gap-4"><Logo compact /><div><p className="text-sm font-extrabold">Xtorra Renewables</p><p className="mt-1 text-xs text-[#B4C8DA]">Energy, made practical.</p></div></div>
          <div className="flex items-center gap-5 text-xs font-bold text-[#B4C8DA]"><a href="#solutions" className="hover:text-[#CBEF7B]">Solutions</a><a href="#method" className="hover:text-[#CBEF7B]">Method</a><a href="#enquire" className="hover:text-[#CBEF7B]">Enquire</a></div>
        </div>
      </footer>
      <button type="button" onClick={returnToTop} aria-label="Go to top" title="Go to top" className={`fixed bottom-28 right-4 z-40 grid h-11 w-11 place-items-center border border-[#0F6693]/45 bg-[#FCFCF8]/95 text-[#082C67] shadow-[0_10px_24px_rgba(8,44,103,0.18)] backdrop-blur transition-all duration-200 hover:border-[#58A90E] hover:bg-[#EDF7D2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A90E] focus-visible:ring-offset-2 active:scale-[.97] sm:bottom-12 sm:right-6 ${showGoToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}><ArrowUp className="h-4 w-4 text-[#58A90E]" /><span className="sr-only">Go to top</span></button>
    </div>
  );
}
