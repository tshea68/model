import React from "react";
import "./styles.css";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>HVAC Business Valuation Microsite</h1>
        <p>
          A valuation model purpose-built for the HVAC vertical.  
          This site does **not collect or store personal data.**  
          Prefer to run it offline? Just download the spreadsheet.
        </p>
      </header>

      <main className="content">
        <div className="card">
          <h2>HVAC Vertical Value Drivers</h2>
          <ul>
            <li>Service vs Install revenue mix</li>
            <li>Maintenance agreement retention</li>
            <li>Revenue per technician</li>
            <li>Fleet asset valuation floor</li>
            <li>Seasonality earnings normalization</li>
            <li>Blended Multiple + DCF + Asset valuation</li>
          </ul>

          <a className="button" href="/hvac_valuation_model.xlsx" download>
            Download HVAC Valuation Model (Excel)
          </a>
        </div>
      </main>

      <footer className="footer">
        <small>Hosted via Cloudflare — 100% anonymous, client-side, offline-first friendly.</small>
      </footer>
    </div>
  );
}
