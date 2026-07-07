import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { SparkzChargingCard } from './index';
import './demo.css';

function DemoApp() {
  const [pluggedIn, setPluggedIn] = useState(false);

  return (
    <main className="demo-shell">
      <div className="demo-controls" role="group" aria-label="Session state">
        <button type="button" aria-pressed={!pluggedIn} onClick={() => setPluggedIn(false)}>
          Unplugged
        </button>
        <button type="button" aria-pressed={pluggedIn} onClick={() => setPluggedIn(true)}>
          Plugged in
        </button>
      </div>
      <SparkzChargingCard
        apiBaseUrl="http://127.0.0.1:3005"
        contractId="000"
        sessionId={pluggedIn ? 'spend-001' : undefined}
        providerId={pluggedIn ? 'NF' : undefined}
        chargerId={pluggedIn ? 'charger-001' : undefined}
        sessionStatus={pluggedIn ? 'PLUGGED_IN' : 'UNPLUGGED'}
        hideAfterSpend={false}
        hideAfterSkip={false}
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
);
