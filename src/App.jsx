import React, { useState, useMemo } from "react";
import "./styles.css";

const formatMoney = (n) =>
  n?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }) ?? "$0";

export default function App() {
  const [profile, setProfile] = useState("balanced");

  const [inputs, setInputs] = useState({
    // Revenue history (3 yrs ago -> last year)
    revYear3Ago: 1800000,
    revYear2Ago: 2200000,
    revLastYear: 2500000,

    // Revenue mix
    serviceMixPct: 40,
    installMixPct: 35,
    maintenancePct: 25, // recurring contracts

    // Operating costs as % of revenue
    techLaborPct: 30,
    materialsPct: 18,
    overheadPct: 15,
    marketingPct: 8,
    fleetPct: 6,
    otherCostPct: 7,

    // Owner adjustments
    ownerAddbackPct: 4,

    // Team & assets
    techs: 8,
    trucks: 6,
    assetFloor: 650000,
    debt: 250000,

    // Valuation settings
    multiple: 5,
    growthRate: 5, // % annual growth for forward view
  });

  const onChange = (field) => (e) => {
    const value = Number(e.target.value);
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const applyProfile = (newProfile) => {
    setProfile(newProfile);
    if (newProfile === "serviceHeavy") {
      setInputs((prev) => ({
        ...prev,
        serviceMixPct: 55,
        installMixPct: 20,
        maintenancePct: 25,
        techLaborPct: 32,
        materialsPct: 16,
        overheadPct: 15,
        marketingPct: 7,
        fleetPct: 6,
        otherCostPct: 7,
        ownerAddbackPct: 5,
        multiple: 5.5,
      }));
    } else if (newProfile === "installHeavy") {
      setInputs((prev) => ({
        ...prev,
        serviceMixPct: 20,
        installMixPct: 60,
        maintenancePct: 20,
        techLaborPct: 26,
        materialsPct: 26,
        overheadPct: 14,
        marketingPct: 8,
        fleetPct: 6,
        otherCostPct: 6,
        ownerAddbackPct: 3,
        multiple: 4.3,
      }));
    } else if (newProfile === "contractRich") {
      setInputs((prev) => ({
        ...prev,
        serviceMixPct: 35,
        installMixPct: 15,
        maintenancePct: 50,
        techLaborPct: 28,
        materialsPct: 14,
        overheadPct: 16,
        marketingPct: 7,
        fleetPct: 6,
        otherCostPct: 6,
        ownerAddbackPct: 4,
        multiple: 6,
      }));
    } else {
      // balanced
      setInputs((prev) => ({
        ...prev,
        serviceMixPct: 40,
        installMixPct: 35,
        maintenancePct: 25,
        techLaborPct: 30,
        materialsPct: 18,
        overheadPct: 15,
        marketingPct: 8,
        fleetPct: 6,
        otherCostPct: 7,
        ownerAddbackPct: 4,
        multiple: 5,
      }));
    }
  };

  const results = useMemo(() => {
    const {
      revYear3Ago,
      revYear2Ago,
      revLastYear,
      techLaborPct,
      materialsPct,
      overheadPct,
      marketingPct,
      fleetPct,
      otherCostPct,
      ownerAddbackPct,
      techs,
      trucks,
      assetFloor,
      debt,
      multiple,
      growthRate,
    } = inputs;

    const revenueTTM = revLastYear || 0;

    const totalCostPct =
      techLaborPct +
      materialsPct +
      overheadPct +
      marketingPct +
      fleetPct +
      otherCostPct;

    const ebitdaMarginReported = 100 - totalCostPct;
    const ebitdaReported = revenueTTM * (ebitdaMarginReported / 100);

    const ownerAddbacks = revenueTTM * (ownerAddbackPct / 100);
    const ebitdaAdjusted = ebitdaReported + ownerAddbacks;
    const adjMargin =
      revenueTTM > 0 ? (ebitdaAdjusted / revenueTTM) * 100 : 0;

    const enterpriseValue = ebitdaAdjusted * multiple;

    // simple forward view based on growth rate, same cost structure
    const forwardRevenue = revenueTTM * (1 + growthRate / 100);
    const forwardEBITDAReported =
      forwardRevenue * (ebitdaMarginReported / 100);
    const forwardAddbacks = forwardRevenue * (ownerAddbackPct / 100);
    const forwardEBITDA = forwardEBITDAReported + forwardAddbacks;
    const forwardEV = forwardEBITDA * multiple;

    const equityValue = enterpriseValue - (debt || 0);
    const valuePerTech = techs > 0 ? equityValue / techs : 0;
    const valuePerTruck = trucks > 0 ? equityValue / trucks : 0;

    // approximate 3-year revenue CAGR (3 yrs ago -> last year, 2 intervals)
    let cagr = 0;
    if (revYear3Ago > 0 && revLastYear > 0) {
      const ratio = revLastYear / revYear3Ago;
      cagr = Math.pow(ratio, 1 / 2) - 1;
    }

    return {
      revenueTTM,
      totalCostPct,
      ebitdaMarginReported,
      ebitdaReported,
      ownerAddbacks,
      ebitdaAdjusted,
      adjMargin,
      enterpriseValue,
      forwardRevenue,
      forwardEBITDA,
      forwardEV,
      equityValue,
      valuePerTech,
      valuePerTruck,
      cagr,
    };
  }, [inputs]);

  return (
    <div className="page">
      <header className="header">
        <h1>HVAC Business Valuation Model</h1>
        <p>
          A purpose-built HVAC valuation tool. No names, emails, or personal
          data — just numbers. Adjust revenue mix, operating costs, and owner
          add-backs, then see how EBITDA and value move.
        </p>
      </header>

      <main className="content-grid">
        {/* LEFT: Inputs */}
        <section className="panel">
          <h2 className="panel-title">1. Quick Profile</h2>
          <p className="panel-sub">
            Choose the mix that best fits your business. You can still adjust
            sliders after.
          </p>

          <div className="select-wrap">
            <span className="select-label">Business profile</span>
            <div className="select-shell">
              <select
                className="select"
                value={profile}
                onChange={(e) => applyProfile(e.target.value)}
              >
                <option value="balanced">Balanced (service + install)</option>
                <option value="serviceHeavy">Service-heavy / Repair</option>
                <option value="installHeavy">
                  Install-heavy / New construction
                </option>
                <option value="contractRich">
                  Contract-rich / High maintenance agreements
                </option>
              </select>
              <span className="select-arrow">▾</span>
            </div>
          </div>

          <h2 className="panel-title">2. Revenue & Mix</h2>

          {/* 3-year revenue: 3 compact sliders in one row */}
          <MultiYearRevenueRow
            values={{
              revYear3Ago: inputs.revYear3Ago,
              revYear2Ago: inputs.revYear2Ago,
              revLastYear: inputs.revLastYear,
            }}
            onChange={(field, value) =>
              setInputs((prev) => ({ ...prev, [field]: value }))
            }
          />

          {/* Revenue mix: 3 compact sliders in one row */}
          <div className="field">
            <div className="field-label-row">
              <label className="field-label">Revenue mix %</label>
            </div>
            <div className="triple-row">
              <CompactSliderField
                label="Service / Repair"
                valueLabel={`${inputs.serviceMixPct.toFixed(0)}%`}
                min={0}
                max={100}
                step={1}
                value={inputs.serviceMixPct}
                onChange={onChange("serviceMixPct")}
              />
              <CompactSliderField
                label="Install / Replacement"
                valueLabel={`${inputs.installMixPct.toFixed(0)}%`}
                min={0}
                max={100}
                step={1}
                value={inputs.installMixPct}
                onChange={onChange("installMixPct")}
              />
              <CompactSliderField
                label="Maintenance / Contract"
                valueLabel={`${inputs.maintenancePct.toFixed(0)}%`}
                min={0}
                max={100}
                step={1}
                value={inputs.maintenancePct}
                onChange={onChange("maintenancePct")}
              />
            </div>
            <div className="field-hint">
              Service and contracts are usually stickier; new construction
              revenue can be more cyclical.
            </div>
          </div>

          <h2 className="panel-title">3. Margins & Operating Costs</h2>

          {/* Operating costs: paired compact sliders */}
          <div className="dual-row">
            <CompactSliderField
              label="Technician Labor % of Revenue"
              valueLabel={`${inputs.techLaborPct.toFixed(0)}%`}
              min={0}
              max={60}
              step={1}
              value={inputs.techLaborPct}
              onChange={onChange("techLaborPct")}
            />
            <CompactSliderField
              label="Materials & Equipment %"
              valueLabel={`${inputs.materialsPct.toFixed(0)}%`}
              min={0}
              max={60}
              step={1}
              value={inputs.materialsPct}
              onChange={onChange("materialsPct")}
            />
          </div>

          <div className="dual-row">
            <CompactSliderField
              label="Overhead & Admin %"
              valueLabel={`${inputs.overheadPct.toFixed(0)}%`}
              min={0}
              max={40}
              step={1}
              value={inputs.overheadPct}
              onChange={onChange("overheadPct")}
            />
            <CompactSliderField
              label="Marketing & Lead-gen %"
              valueLabel={`${inputs.marketingPct.toFixed(1)}%`}
              min={0}
              max={30}
              step={0.5}
              value={inputs.marketingPct}
              onChange={onChange("marketingPct")}
            />
          </div>

          <div className="dual-row">
            <CompactSliderField
              label="Fleet & Vehicles %"
              valueLabel={`${inputs.fleetPct.toFixed(1)}%`}
              min={0}
              max={20}
              step={0.5}
              value={inputs.fleetPct}
              onChange={onChange("fleetPct")}
            />
            <CompactSliderField
              label="Other Operating Costs %"
              valueLabel={`${inputs.otherCostPct.toFixed(1)}%`}
              min={0}
              max={30}
              step={0.5}
              value={inputs.otherCostPct}
              onChange={onChange("otherCostPct")}
            />
          </div>

          <SliderField
            label="Owner Adjustments / Add-backs %"
            min={0}
            max={25}
            step={0.5}
            value={inputs.ownerAddbackPct}
            onChange={onChange("ownerAddbackPct")}
            display={`${inputs.ownerAddbackPct.toFixed(1)}%`}
            hint="Owner salary, personal expenses, one-time costs, etc., as % of revenue."
          />

          <div className="field-hint">
            Based on these costs, your implied EBITDA margin (before add-backs)
            is{" "}
            <strong>{results.ebitdaMarginReported.toFixed(1)}% of revenue</strong>.
          </div>

          <h2 className="panel-title">4. Team & Assets</h2>

          <div className="dual-row">
            <CompactSliderField
              label="# Technicians"
              valueLabel={inputs.techs.toFixed(0)}
              min={0}
              max={250}
              step={1}
              value={inputs.techs}
              onChange={onChange("techs")}
            />
            <CompactSliderField
              label="# Service Trucks"
              valueLabel={inputs.trucks.toFixed(0)}
              min={0}
              max={200}
              step={1}
              value={inputs.trucks}
              onChange={onChange("trucks")}
            />
          </div>

          <div className="dual-row">
            <CompactSliderField
              label="Asset Floor (Fleet + Inventory + Other Tangible)"
              valueLabel={formatMoney(inputs.assetFloor)}
              min={0}
              max={10000000}
              step={25000}
              value={inputs.assetFloor}
              onChange={onChange("assetFloor")}
            />
            <CompactSliderField
              label="Total Debt"
              valueLabel={formatMoney(inputs.debt)}
              min={0}
              max={20000000}
              step={25000}
              value={inputs.debt}
              onChange={onChange("debt")}
            />
          </div>

          <h2 className="panel-title">5. Valuation Settings</h2>

          <div className="dual-row">
            <CompactSliderField
              label="EBITDA Multiple"
              valueLabel={`${inputs.multiple.toFixed(1)}x`}
              min={3}
              max={8}
              step={0.1}
              value={inputs.multiple}
              onChange={onChange("multiple")}
            />
            <CompactSliderField
              label="Expected Annual Growth Rate"
              valueLabel={`${inputs.growthRate.toFixed(1)}%`}
              min={-10}
              max={25}
              step={0.5}
              value={inputs.growthRate}
              onChange={onChange("growthRate")}
            />
          </div>
        </section>

        {/* RIGHT: Results */}
        <section className="panel panel-summary">
          <h2 className="panel-title">Valuation Summary (EBITDA Multiple)</h2>
          <p className="panel-sub">
            Based on last year&apos;s revenue, your cost structure, owner
            add-backs, and the EBITDA multiple you selected.
          </p>

          <div className="summary-block">
            <SummaryRow
              label="Revenue 3 years ago"
              value={formatMoney(inputs.revYear3Ago)}
            />
            <SummaryRow
              label="Revenue 2 years ago"
              value={formatMoney(inputs.revYear2Ago)}
            />
            <SummaryRow
              label="Last year (TTM base)"
              value={formatMoney(results.revenueTTM)}
            />
            <SummaryRow
              label="3-year Revenue CAGR (approx.)"
              value={`${(results.cagr * 100).toFixed(1)}%`}
            />
          </div>

          <div className="summary-block">
            <SummaryRow
              label="Total Operating Costs"
              value={`${results.totalCostPct.toFixed(1)}% of revenue`}
            />
            <SummaryRow
              label="Reported EBITDA Margin"
              value={`${results.ebitdaMarginReported.toFixed(1)}%`}
            />
            <SummaryRow
              label="Owner Add-backs"
              value={formatMoney(results.ownerAddbacks)}
            />
            <SummaryRow
              label="Adjusted EBITDA Margin"
              value={`${results.adjMargin.toFixed(1)}%`}
            />
            <SummaryRow
              label="Adjusted EBITDA"
              value={formatMoney(results.ebitdaAdjusted)}
            />
          </div>

          <div className="summary-block">
            <SummaryRow
              label="EBITDA Multiple"
              value={`${inputs.multiple.toFixed(1)}x`}
            />
            <SummaryRow
              label="Enterprise Value (EV)"
              value={formatMoney(results.enterpriseValue)}
              sub="Adjusted EBITDA × Multiple"
              highlight
            />
            <SummaryRow
              label="Asset Floor"
              value={formatMoney(inputs.assetFloor)}
            />
            <SummaryRow label="Total Debt" value={formatMoney(inputs.debt)} />
            <SummaryRow
              label="Estimated Equity Value"
              value={formatMoney(results.equityValue)}
            />
          </div>

          <div className="summary-block">
            <SummaryRow
              label="Forward Revenue (1 year)"
              value={formatMoney(results.forwardRevenue)}
              sub={`${inputs.growthRate.toFixed(1)}% growth assumption`}
            />
            <SummaryRow
              label="Forward Adjusted EBITDA"
              value={formatMoney(results.forwardEBITDA)}
            />
            <SummaryRow
              label="Forward EV (same multiple)"
              value={formatMoney(results.forwardEV)}
            />
          </div>

          <div className="summary-block">
            <SummaryRow
              label="Equity Value per Technician"
              value={formatMoney(results.valuePerTech)}
            />
            <SummaryRow
              label="Equity Value per Service Truck"
              value={formatMoney(results.valuePerTruck)}
            />
          </div>

          <div className="download-card">
            <h3>Download the Full HVAC Valuation Spreadsheet</h3>
            <p>
              The Excel version includes detailed schedules, 5-year projections,
              and more HVAC-specific tweaks you can customize or share with
              advisors.
            </p>
            <a className="button" href="/hvac_valuation_model.xlsx" download>
              Download HVAC Valuation Model (Excel)
            </a>
          </div>

          <p className="privacy-note">
            This page runs entirely in your browser. None of these numbers are
            stored, logged, or sent to a server.
          </p>
        </section>
      </main>
    </div>
  );
}

/* ---------- Reusable UI components ---------- */

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  display,
  hint,
}) {
  return (
    <div className="field">
      <div className="field-label-row">
        <label className="field-label">{label}</label>
        <span className="field-value">{display}</span>
      </div>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

function SummaryRow({ label, value, sub, highlight }) {
  return (
    <div className="summary-row">
      <div>
        <div className="summary-label">{label}</div>
        {sub && <div className="summary-sub">{sub}</div>}
      </div>
      <div className={highlight ? "summary-value highlight" : "summary-value"}>
        {value}
      </div>
    </div>
  );
}

/* ---------- Multi-year revenue row ---------- */

function MultiYearRevenueRow({ values, onChange }) {
  return (
    <div className="field">
      <div className="field-label-row">
        <label className="field-label">Revenue (last 3 fiscal years)</label>
      </div>
      <div className="triple-row">
        <MiniYearSlider
          label="3 yrs ago"
          value={values.revYear3Ago}
          onChange={(v) => onChange("revYear3Ago", v)}
        />
        <MiniYearSlider
          label="2 yrs ago"
          value={values.revYear2Ago}
          onChange={(v) => onChange("revYear2Ago", v)}
        />
        <MiniYearSlider
          label="Last year"
          value={values.revLastYear}
          onChange={(v) => onChange("revLastYear", v)}
        />
      </div>
      <div className="field-hint">
        Drag each slider to approximate revenue for that year. Max assumed
        around $50M.
      </div>
    </div>
  );
}

function MiniYearSlider({ label, value, onChange }) {
  return (
    <div className="mini-field">
      <div className="mini-label">{label}</div>
      <div className="mini-value">{formatMoney(value)}</div>
      <input
        type="range"
        className="slider mini-slider"
        min={0}
        max={50000000}
        step={50000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ---------- Generic compact slider (for % / counts, etc.) ---------- */

function CompactSliderField({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}) {
  return (
    <div className="mini-field">
      <div className="mini-label">{label}</div>
      <div className="mini-value">{valueLabel}</div>
      <input
        type="range"
        className="slider mini-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
