"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Info, Shield } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function Calculator() {
  const t = useTranslations("Calculator");

  const [gramIndex, setGramIndex] = useState(6); // 100g default
  const [months, setMonths] = useState(36);
  const [tier, setTier] = useState<"ugyfel" | "vasarloi" | "premium">("premium");
  const [strategy, setStrategy] = useState<"payout" | "compound">("compound");
  const [investmentType, setInvestmentType] = useState<"monthly" | "lumpsum">("lumpsum");

  // Live Gold Price State
  const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(172); // Base fallback requested
  const [isLivePrice, setIsLivePrice] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [customTgiPrice, setCustomTgiPrice] = useState<string>("");

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        // We use a dummy professional endpoint that will fallback to catch
        // If the user replaces this with a valid key for metalpriceapi/etc, it will work.
        const res = await fetch("https://api.metals.dev/v1/latest?currency=EUR&unit=g"); 
        if (!res.ok) throw new Error("API not available or missing key");
        
        const data = await res.json();
        if (data && data.price) {
          setCurrentGoldPrice(data.price);
          setIsLivePrice(true);
          const now = new Date();
          setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        console.warn("Live Gold API unavailable, defaulting to 172 EUR/g fallback.");
        setCurrentGoldPrice(172);
        setIsLivePrice(false);
      }
    };
    
    fetchGoldPrice();
  }, []);

  // Assumptions
  const AVG_YEARLY_GROWTH = 0.065; // ~6.5% average (5-8% range)

  // Hardcoded Gold Price Map (EUR)
  const goldPriceMap: Record<number, number> = {
    1: 171.52,
    2: 319.05,
    5: 752.69,
    10: 1490.38,
    20: 2965.76,
    50: 7332.29,
    100: 14634.85,
    250: 36434.97,
    500: 71822.47,
    1000: 143956.35
  };

  const adminMultiplier = customTgiPrice && !isNaN(Number(customTgiPrice)) 
    ? Number(customTgiPrice) 
    : 1;

  const gramSteps = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000];
  const selectedGrams = gramSteps[gramIndex];

  const effective1gPrice = goldPriceMap[1] * adminMultiplier;
  const packagePricePerGram = goldPriceMap[selectedGrams] * adminMultiplier / selectedGrams;

  const isLumpSum = investmentType === "lumpsum";
  const baseGoldEuro = goldPriceMap[selectedGrams] * adminMultiplier; // Maps exact physical step cost
  const tierRates = { ugyfel: 0.02, vasarloi: 0.02, premium: 0.04 };
  const tierFees = { ugyfel: 0, vasarloi: 0, premium: 0.25 };
  
  const tierRate = tierRates[tier];
  const feeRate = tierFees[tier];

  // In premium, the user pays the base gold + 25% fee. 
  // For basic/buyer, the user pays just base gold.
  const inputEuro = baseGoldEuro * (1 + feeRate); 

  const totalInvestedEur = isLumpSum ? inputEuro : inputEuro * months;
  const simulationMonths = tier === "premium" ? Math.max(months, 72) : months;
  const years = simulationMonths / 12;
  
  // TGI Model: Premium Fee (calculated on the base gold value)
  let premiumFeePaid = 0;
  if (tier === "premium") {
    premiumFeePaid = isLumpSum ? baseGoldEuro * feeRate : Math.min(months, 36) * baseGoldEuro * feeRate;
  }
  
  // Double Refund (Loyalty Refund) in months 37-72 (Only for Premium Tier)
  const refundPhaseMonths = Math.min(Math.max(months - 36, 0), 36);
  // Total refundable amount = 200% of Premium Fee
  const totalRefund = tier === "premium" ? refundPhaseMonths * (premiumFeePaid / 36) * 2 : 0;
  
  // Vásárlói Loyalty Bonus (+36% at the end of month 36)
  const loyaltyBonusEur = tier === "vasarloi" && months >= 36 ? totalInvestedEur * 0.36 : 0;
  
  // Base strategy return boundaries
  const discountMonths = tier === "premium" ? Math.min(months, 36) : months;
  const goldAppreciationMultiplier = Math.pow(1 + AVG_YEARLY_GROWTH, years);

  // PREMIUM SPECIFIC VARS
  let premiumVirtualWalletEur = 0;
  let premiumAccumulationPotEur = 0;
  let premiumTotalGramsPurchased = 0;
  let premiumNextPurchaseProgress = 0;
  let premiumGoldAssetInitial = 0;
  
  let finalValueEur = 0;
  let finalGrams = 0;
  let futureValueWithoutBonusEur = 0; // For Gold Growth diff
  let netInvestedEur = 0;
  let phase1YieldTotalEur = 0;
  let phase2RefundTotalEur = 0;

  if (tier === "premium") {
    // 1. Initial State
    const baseGrams = selectedGrams * (isLumpSum ? 1 : months);
    premiumGoldAssetInitial = baseGoldEuro * (isLumpSum ? 1 : months);
    netInvestedEur = premiumGoldAssetInitial;

    const costPerGram = effective1gPrice * 1.25; // 1g + 25% surcharge for auto-purchases
    
    let currentBaseGrams = 0;
    let accumulatedBonusGrams = 0;
    let cashWallet = 0;
    let goldAccumulationPotEuro = 0;
    let runningFeePaid = 0;

    // Iterative Simulation
    for (let m = 1; m <= simulationMonths; m++) {
      // Add monthly contributions
      if (m <= months) {
        if (isLumpSum) {
          if (m === 1) {
            currentBaseGrams += selectedGrams;
            runningFeePaid += baseGoldEuro * feeRate;
          }
        } else {
          currentBaseGrams += selectedGrams;
          if (m <= 36) {
            runningFeePaid += baseGoldEuro * feeRate;
          }
        }
      }

      // Calculate yield based on current total physical weight
      const totalWeightThisMonth = currentBaseGrams + accumulatedBonusGrams;
      const currentWeightValueEur = totalWeightThisMonth * effective1gPrice; 

      let monthlyYieldEur = 0;

      if (m <= 36) {
        // Phase 1: 4% yield on total weight's current value
        monthlyYieldEur = currentWeightValueEur * tierRate;
        phase1YieldTotalEur += monthlyYieldEur;
      } else if (m >= 37 && m <= 72) {
        // Phase 2: Double Premium Fee Refund distributed over 36 months
        const totalRefundTarget = runningFeePaid * 2;
        monthlyYieldEur = totalRefundTarget / 36;
        phase2RefundTotalEur += monthlyYieldEur;
      }

      // TGI Split Logic (2/3 Cash, 1/3 Gold)
      const cashSplit = monthlyYieldEur * (2/3);
      const goldSplit = monthlyYieldEur * (1/3);

      cashWallet += cashSplit;
      goldAccumulationPotEuro += goldSplit;

      // Auto-Purchase logic
      const purchasableGrams = Math.floor(goldAccumulationPotEuro / costPerGram);
      if (purchasableGrams > 0) {
        accumulatedBonusGrams += purchasableGrams;
        goldAccumulationPotEuro -= purchasableGrams * costPerGram;
      }
    }

    // Set Final Synthetic Outputs
    premiumVirtualWalletEur = cashWallet;
    premiumTotalGramsPurchased = accumulatedBonusGrams;
    premiumAccumulationPotEur = goldAccumulationPotEuro;
    premiumNextPurchaseProgress = Math.min((premiumAccumulationPotEur / costPerGram) * 100, 100);

    finalGrams = baseGrams + premiumTotalGramsPurchased;
    const appreciatedGoldPrice = effective1gPrice * goldAppreciationMultiplier;
    
    // Future Value without bonus is simply the appreciated base gold, plus cash wallet (but we don't display this alone)
    futureValueWithoutBonusEur = (baseGrams * appreciatedGoldPrice);
    
    // Final TGI Portfolio Value = Gold value + Cash Wallet + leftover pot
    finalValueEur = (finalGrams * appreciatedGoldPrice) + premiumVirtualWalletEur + premiumAccumulationPotEur;
  } else {
    // UGYFEL & VASARLOI LOGIC
    netInvestedEur = totalInvestedEur; // Fees are 0 here, inputEuro == baseGoldEuro

    let strategyReturnEur = 0;
    if (isLumpSum) {
      strategyReturnEur = totalInvestedEur + (totalInvestedEur * (tierRate * months));
    } else {
      if (strategy === "compound") {
        strategyReturnEur = totalInvestedEur * Math.pow(1 + tierRate, discountMonths);
      } else {
        strategyReturnEur = totalInvestedEur + (totalInvestedEur * tierRate * discountMonths);
      }
    }
    
    const totalWithAppreciation = strategyReturnEur * goldAppreciationMultiplier;
    futureValueWithoutBonusEur = totalWithAppreciation;
    
    finalValueEur = totalWithAppreciation + loyaltyBonusEur; 
    finalGrams = finalValueEur / effective1gPrice;
  }

  // --- Dynamic ROI Chart Data (TGI Model) ---
  const chartData = [
    { name: "Indulás", value: Math.round(totalInvestedEur) },
    { name: "1. Fázis Vége", value: Math.round(totalInvestedEur + phase1YieldTotalEur) },
  ];
  
  if (months > 36 && tier === "premium") {
    chartData.push({ name: "2. Fázis Vége", value: Math.round(totalInvestedEur + phase1YieldTotalEur + phase2RefundTotalEur) });
  }

  const phase1Months = Math.min(simulationMonths, 36) || 1;
  const avgMonthlyCashPhase1 = (phase1YieldTotalEur * (2/3)) / phase1Months;
  const avgMonthlyGoldPhase1 = (phase1YieldTotalEur * (1/3)) / (effective1gPrice * 1.25) / phase1Months;

  const phase2Months = 36; // Phase 2 always spans months 37-72
  const avgMonthlyCashPhase2 = (phase2RefundTotalEur * (2/3)) / phase2Months;
  const avgMonthlyGoldPhase2 = (phase2RefundTotalEur * (1/3)) / (effective1gPrice * 1.25) / phase2Months;

  return (
    <section id="calculator" className="py-24 bg-charcoal relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-premiumWhite mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-metallicGold mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-sm">
          
          {/* Controls */}
          <div className="flex flex-col justify-center space-y-8 lg:space-y-10">
            
            {/* Type, Strategy & Tier Toggles */}
            <div className="flex flex-col gap-6">

              {/* Investment Type Tab */}
              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block uppercase tracking-wider">{t("investmentTypeTitle") || "Investment Type"}</label>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 relative z-20 overflow-hidden">
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-metallicGold/20 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none border m-1 border-metallicGold/30 ${investmentType === "monthly" ? "left-0" : "left-1/2"}`} />
                  <button
                    onClick={() => {
                      setInvestmentType("monthly");
                      if (gramIndex > 5) setGramIndex(3); // Drop to 10g
                    }}
                    className={`relative w-1/2 py-2.5 text-sm sm:text-base font-medium transition-colors z-10 ${investmentType === "monthly" ? "text-metallicGold" : "text-white/60 hover:text-white"}`}
                  >
                    {t("investmentMonthly") || "Havi megtakarítás"}
                  </button>
                  <button
                    onClick={() => {
                      setInvestmentType("lumpsum");
                      if (gramIndex < 5) setGramIndex(6); // Bump to 100g
                    }}
                    className={`relative w-1/2 py-2.5 text-sm sm:text-base font-medium transition-colors z-10 ${investmentType === "lumpsum" ? "text-metallicGold" : "text-white/60 hover:text-white"}`}
                  >
                    {t("investmentLumpSum") || "Egyszeri befektetés"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block uppercase tracking-wider">{t("tierTitle")}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setTier("ugyfel")}
                    className={`relative flex-1 py-3 px-2 rounded-xl border transition-all text-xs sm:text-sm group ${tier === "ugyfel" ? "bg-metallicGold/10 border-metallicGold text-metallicGold font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span>{t("tierUgyfel")} <span className="opacity-80 font-normal ml-0.5">(72%)</span></span>
                        <Info className="w-3.5 h-3.5 opacity-50 text-current" />
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] w-60 p-3 bg-black/95 backdrop-blur-md border border-metallicGold/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none text-left">
                      <p className="text-xs text-premiumWhite/90 leading-relaxed font-normal normal-case tracking-normal">
                        {t("tierUgyfelDesc")}
                      </p>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-3 h-3 bg-black/95 border-r border-b border-metallicGold/30 rotate-45" />
                    </div>
                  </button>
                  <button
                    onClick={() => setTier("vasarloi")}
                    className={`relative flex-1 py-3 px-2 rounded-xl border transition-all text-xs sm:text-sm group ${tier === "vasarloi" ? "bg-metallicGold/10 border-metallicGold text-metallicGold font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span>{t("tierVasarloi")} <span className="opacity-80 font-normal ml-0.5">(108%)</span></span>
                        <Info className="w-3.5 h-3.5 opacity-50 text-current" />
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] w-64 p-3 bg-black/95 backdrop-blur-md border border-metallicGold/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none text-left">
                      <p className="text-xs text-premiumWhite/90 leading-relaxed font-normal normal-case tracking-normal">
                        {t("tierVasarloiDesc")}
                      </p>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-3 h-3 bg-black/95 border-r border-b border-metallicGold/30 rotate-45" />
                    </div>
                  </button>
                  <button
                    onClick={() => setTier("premium")}
                    className={`relative flex-1 py-3 px-2 rounded-xl border transition-all text-xs sm:text-sm group ${tier === "premium" ? "bg-metallicGold/10 border-metallicGold text-metallicGold font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span>{t("tierPremium")} <span className="opacity-80 font-normal ml-0.5">(144%)</span></span>
                        <Info className="w-3.5 h-3.5 opacity-50 text-current" />
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] w-64 p-3 bg-black/95 backdrop-blur-md border border-metallicGold/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none text-left">
                      <p className="text-xs text-premiumWhite/90 leading-relaxed font-normal normal-case tracking-normal">
                        {t("tierPremiumDesc")}
                      </p>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-3 h-3 bg-black/95 border-r border-b border-metallicGold/30 rotate-45" />
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block uppercase tracking-wider">{t("strategyTitle")}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStrategy("payout")}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all text-sm sm:text-base ${strategy === "payout" ? "bg-metallicGold/10 border-metallicGold text-metallicGold font-semibold" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    {t("strategyPayout")}
                  </button>
                  <button
                    onClick={() => setStrategy("compound")}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all text-sm sm:text-base ${strategy === "compound" ? "bg-metallicGold/10 border-metallicGold text-green-400 font-semibold border-green-400/50" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"}`}
                  >
                    {t("strategyCompound")}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="text-lg font-medium text-premiumWhite">
                  {t("selectedGoldGrams") || "Választott arany mennyiség (gramm)"}
                </label>
                <div className="flex flex-col items-end">
                  <span className="text-xl sm:text-2xl font-bold text-metallicGold">{selectedGrams}g{isLumpSum ? "" : " / mo"}</span>
                  <span className="text-xs sm:text-sm font-medium text-white/60 mt-0.5">
                    {t("actualInvestmentValue") || "Aktuális befektetési érték"}: ~€{Math.round(inputEuro).toLocaleString()}
                  </span>
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max={gramSteps.length - 1} 
                step="1"
                value={gramIndex}
                onChange={(e) => setGramIndex(Number(e.target.value))}
                className="w-full h-2 mt-2 bg-charcoal rounded-lg appearance-none cursor-pointer accent-metallicGold focus:outline-none"
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-white/40 mt-3 px-1">
                {gramSteps.map((g, i) => (
                  <span key={g} className={`text-center flex-1 ${i === gramIndex ? "text-metallicGold font-bold text-xs" : (i % 2 !== 0 ? "hidden sm:inline-block text-white/30" : "inline-block")}`}>{g}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <label className="text-lg font-medium text-premiumWhite">{t("timeframe")}</label>
                <span className="text-xl font-bold text-metallicGold">{months} {months === 1 ? t("month") : t("months")}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="120" 
                step="1"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2 bg-charcoal rounded-lg appearance-none cursor-pointer accent-metallicGold focus:outline-none"
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>1 {t("month")}</span>
                <span>120 {t("months")}</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Controls (Mobile & Desktop) */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10 w-full relative z-20">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "border-white/20 text-white/80 hover:bg-white/5"}`}
            >
              Vissza
            </button>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${currentStep === i ? "bg-metallicGold w-4" : "bg-white/20"}`} />
              ))}
            </div>
            <button 
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${currentStep === 3 ? "opacity-0 pointer-events-none" : "bg-metallicGold text-charcoal hover:bg-metallicGold/90"}`}
            >
              Tovább
            </button>
          </div>

          {/* Results Display */}
          <div className="bg-charcoal rounded-2xl p-6 sm:p-8 border border-metallicGold/20 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            {/* Gloss reflection */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-metallicGold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
              <h3 className="text-2xl font-playfair font-semibold text-premiumWhite">
                {currentStep === 0 && "1. Vásárlás beállítása"}
                {currentStep === 1 && "2. Arany Hozam (1. Fázis)"}
                {currentStep === 2 && "3. Prémium Visszatérítés (2. Fázis)"}
                {currentStep === 3 && t("expectedReturnTitle")}
              </h3>
              <div className="flex flex-col gap-2 items-end">
                {strategy === "compound" && currentStep === 3 && (
                  <span className="text-[10px] sm:text-xs font-inter font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 uppercase tracking-wide inline-flex w-fit">
                    {t("exponentialGrowth")}
                  </span>
                )}
                <div className="flex flex-col items-end gap-1 mt-1">
                  <span className={`text-[10px] sm:text-xs font-inter font-medium px-3 py-1.5 rounded-full border inline-flex items-center w-fit ${isLivePrice && adminMultiplier === 1 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-white/50 border-white/10"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${(isLivePrice || adminMultiplier !== 1) ? "bg-amber-400 animate-pulse" : "bg-white/40"}`}></span>
                    {adminMultiplier !== 1 ? `Egyedi Szorzó: ${(adminMultiplier * 100).toFixed(0)}%` : (t("tgiLivePrice", { price: effective1gPrice.toFixed(1) }) || `TGI Eladási árfolyam: ${effective1gPrice.toFixed(1)} €/g (+3%)`)} {lastUpdated && adminMultiplier === 1 ? `(Frissítve: ${lastUpdated})` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              
              {/* STEP 1: SETUP */}
              {currentStep === 0 && (
                <>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-white/60">Választott Mennyiség</span>
                    <span className="text-lg font-semibold text-white">{isLumpSum ? selectedGrams : selectedGrams * months}g</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-white/60">Arany Értéke (Bázis)</span>
                    <span className="text-lg font-semibold text-white">€{Math.round(baseGoldEuro * (isLumpSum ? 1 : months)).toLocaleString()}</span>
                  </div>
                  {tier === "premium" && (
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div className="flex flex-col">
                        <span className="text-amber-500/80 flex items-center gap-1.5 cursor-help group relative">
                          {t("setupAsset")} (+25%)
                          <Shield className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-amber-500/80">+ €{Math.round(premiumFeePaid).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white/80 font-medium">Bruttó Befektetés</span>
                    <span className="text-2xl font-bold text-metallicGold">€{Math.round(totalInvestedEur).toLocaleString()}</span>
                  </div>
                </>
              )}

              {/* STEP 2: PHASE 1 YIELD */}
              {currentStep === 1 && (
                <>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-white/60">Bázis tőke (Ami termel)</span>
                    <span className="text-lg font-semibold text-white">€{Math.round(netInvestedEur).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-white/60">Bruttó Hozam (1-36. hó)</span>
                    <span className="text-lg font-semibold text-green-400">+ €{Math.round(phase1YieldTotalEur).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col bg-white/5 rounded-xl p-4 gap-3 border border-white/10 mt-4">
                    <span className="text-xs text-white/40 uppercase tracking-wider mb-1">TGI Felosztás (2/3 - 1/3)</span>
                    <div className="flex justify-between items-center text-sm md:text-base border-b border-white/5 pb-2">
                       <span className="text-white/80">Havi kifizetés:</span>
                       <span className="font-semibold text-green-400">
                         {avgMonthlyCashPhase1.toFixed(2)} € <span className="text-white/40 font-normal mx-1">+</span> <span className="text-metallicGold">{avgMonthlyGoldPhase1.toFixed(2)} g arany</span>
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-white/60 text-xs text-right w-full">(*Az adott fázis havi átlaga)</span>
                     </div>
                  </div>
                </>
              )}

              {/* STEP 3: PHASE 2 REFUND */}
              {currentStep === 2 && (
                <>
                  {tier === "premium" ? (
                    <>
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-white/60">200% Prémium Visszatérítés</span>
                        <span className="text-lg font-semibold text-green-400">+ €{Math.round(phase2RefundTotalEur).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col bg-white/5 rounded-xl p-4 gap-3 border border-white/10 mt-4">
                         <span className="text-xs text-white/40 uppercase tracking-wider mb-1">TGI Felosztás (2/3 - 1/3)</span>
                         <div className="flex justify-between items-center text-sm md:text-base border-b border-white/5 pb-2">
                           <span className="text-white/80">Havi kifizetés:</span>
                           <span className="font-semibold text-green-400">
                             {avgMonthlyCashPhase2.toFixed(2)} € <span className="text-white/40 font-normal mx-1">+</span> <span className="text-metallicGold">{avgMonthlyGoldPhase2.toFixed(2)} g arany</span>
                           </span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-white/60 text-xs text-right w-full">(*Az adott fázis havi átlaga)</span>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                      <Shield className="w-8 h-8 text-white/20" />
                      <p className="text-white/50 text-sm">A 2. Fázis (Prémium visszatérítés) csak 36 hónap feletti futamidő és Prémium csomag esetén aktív.</p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 4: FINAL SUMMARY */}
              {currentStep === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-green-500/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mb-2">Összes Készpénz (€)</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-400">€{Math.round(premiumVirtualWalletEur).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-metallicGold/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mb-2">Összes Bónusz Arany (g)</span>
                      <span className="text-xl sm:text-2xl font-bold text-metallicGold">+{premiumTotalGramsPurchased.toLocaleString(undefined, {maximumFractionDigits: 2})} g</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mt-2">
                    <span className="text-metallicGold/80 flex items-center gap-1.5 text-xs sm:text-sm">
                      Fennmaradó Aranyvásárlási Pot (Töredék)
                    </span>
                    <span className="text-sm sm:text-md font-semibold text-metallicGold">€{Math.round(premiumAccumulationPotEur).toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 mt-2">
                    <span className="block text-sm text-white/60 mb-2 uppercase tracking-wider">{t("finalValue")}</span>
                    
                    <div className="flex gap-4 items-center mb-3 justify-center">
                      <span className="text-xs sm:text-sm font-medium text-white/60">Bázis: {isLumpSum ? selectedGrams : selectedGrams * months}g</span>
                      <span className="text-xs sm:text-sm font-bold text-green-400">+ Bónusz: {(tier === "premium" ? premiumTotalGramsPurchased : (finalGrams - (isLumpSum ? selectedGrams : selectedGrams * months))).toLocaleString(undefined, {maximumFractionDigits: 1})}g</span>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-2 bg-white/5 rounded-xl p-6 border border-metallicGold/20 mb-4 shadow-inner">
                      <span className="text-4xl md:text-5xl font-bold text-metallicGold tracking-tight shadow-sm break-all">
                        {Math.round(finalGrams).toLocaleString()} {t("goldGrams")}
                      </span>
                      <span className="text-lg sm:text-xl text-white/80 font-medium">
                        ( ~€{Math.round(finalValueEur).toLocaleString()} )
                      </span>
                    </div>

                    {/* Chart Container */}
                    <div className="h-48 w-full mt-6 mb-4 bg-black/20 rounded-xl p-4 border border-white/5">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis hide domain={['dataMin - 1000', 'dataMax + 2000']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#D4AF3740', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#D4AF37' }}
                            formatter={(value: any) => [`€${Number(value).toLocaleString()}`, 'Portfólió Értéke']}
                          />
                          <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-white/30 text-center leading-relaxed">
                      *A kalkuláció során évi 6.5% átlagos aranyár-növekedéssel számoltunk. Erre rakódnak rá a TGI hűségbónuszok és hozamok. Alacsony kockázatú indikátor, nem minősül pénzügyi tanácsadásnak. A díjak és bázisok a választott hónapok számára extrapolálva jelennek meg.
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Admin Override Field (Always Visible) */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity duration-300 focus-within:opacity-100 w-full sm:w-auto z-20">
              <label className="text-[10px] text-white/50 mb-1.5">{t("adminOverrideLabel") || "Admin: Szorzó felülbírálása (pl. 1.05 = +5%)"}</label>
              <input 
                type="number" 
                placeholder="1.0"
                step="0.01"
                min="0"
                value={customTgiPrice}
                onChange={(e) => setCustomTgiPrice(e.target.value)}
                className="w-32 bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-metallicGold/50 text-right transition-colors"
              />
              {adminMultiplier !== 1 && (
                <span className="text-[9px] text-amber-400/80 mt-1 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Szorzó aktív: {adminMultiplier}x
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Dynamic Comparison Table */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-sm overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-playfair font-semibold text-premiumWhite mb-8 text-center">{t("tableTitle")}</h3>
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/20 text-white/50 text-xs lg:text-sm tracking-wider uppercase">
                  <th className="py-4 px-4">{t("tableModelName")}</th>
                  <th className="py-4 px-4">{t("tableMonthlyDisc")}</th>
                  <th className="py-4 px-4">{t("tableBonus")}</th>
                  <th className="py-4 px-4">{t("tableTotalDisc")}</th>
                  <th className="py-4 px-4">{t("tableDuration")}</th>
                  <th className="py-4 px-4">{t("tableStopOption")}</th>
                </tr>
              </thead>
              <tbody className="text-white/80 text-sm lg:text-base">
                <tr className={`border-b border-white/10 transition-colors ${tier === "ugyfel" ? "bg-metallicGold/10" : "hover:bg-white/5"}`}>
                  <td className="py-4 px-4 font-semibold text-white">{t("tierUgyfel")}</td>
                  <td className="py-4 px-4">2%</td>
                  <td className="py-4 px-4 text-white/40">0%</td>
                  <td className="py-4 px-4 font-medium">72%</td>
                  <td className="py-4 px-4">36 {t("months")}</td>
                  <td className="py-4 px-4"><span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">{t("tableStopYes")}</span></td>
                </tr>
                <tr className={`border-b border-white/10 transition-colors ${tier === "vasarloi" ? "bg-metallicGold/10" : "hover:bg-white/5"}`}>
                  <td className="py-4 px-4 font-semibold text-white">{t("tierVasarloi")}</td>
                  <td className="py-4 px-4">2%</td>
                  <td className="py-4 px-4 font-medium text-metallicGold">36% <span className="text-xs opacity-80 block">{t("loyaltyDiscount")}</span></td>
                  <td className="py-4 px-4 font-medium">108%</td>
                  <td className="py-4 px-4">36 {t("months")}</td>
                  <td className="py-4 px-4"><span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold">{t("tableStopNo")}</span></td>
                </tr>
                <tr className={`transition-colors ${tier === "premium" ? "bg-metallicGold/10" : "hover:bg-white/5"}`}>
                  <td className="py-4 px-4 font-semibold text-white">{t("tierPremium")}</td>
                  <td className="py-4 px-4">4%</td>
                  <td className="py-4 px-4 font-medium text-green-400">200% <span className="text-xs opacity-80 block">{t("premiumFeeReturn")}</span></td>
                  <td className="py-4 px-4 font-medium">144%</td>
                  <td className="py-4 px-4">36 + 36 {t("months")}</td>
                  <td className="py-4 px-4"><span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">{t("tableStopYes")}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
