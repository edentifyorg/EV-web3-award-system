import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AuthGate from './AuthGate';

type WalletHistoryItem = {
  type: 'award' | 'spend';
  uid?: string | null;
  walletAddress?: string | null;
  walletName?: string | null;
  amount: string;
  txHash?: string;
  timestamp?: string;
  awardType?: string;
};

type WalletResponse = {
  status: string;
  uid: string;
  walletAddress: string;
  treasuryAddress: string | null;
  tokenContractAddress: string;
  balance: string;
  totalAwarded: string;
  totalSpent: string;
  history: WalletHistoryItem[];
};

type ApiFeedback = {
  kind: 'success' | 'error' | 'idle';
  message: string;
};

interface AdminAppProps {
  onBack?: () => void;
}

export default function AdminApp({ onBack }: AdminAppProps) {
  return (
    <AuthGate title="NEVERFLAT Admin Console" onBack={onBack}>
      {({ baseUrl, adminToken, onLogout }) => (
        <AdminShell baseUrl={baseUrl} adminToken={adminToken} onLogout={onLogout} onBack={onBack} />
      )}
    </AuthGate>
  );
}

// â”€â”€ Inner shell (rendered once authenticated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AdminShellProps {
  baseUrl: string;
  adminToken: string;
  onLogout: () => void;
  onBack?: () => void;
}

function AdminShell({ baseUrl, adminToken, onLogout, onBack }: AdminShellProps) {
  const [uid, setUid] = useState('demo-user-001');
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [feedback, setFeedback] = useState<ApiFeedback>({ kind: 'idle', message: '' });

  useEffect(() => {
    if (!feedback.message) return;
    const timer = window.setTimeout(() => setFeedback(current =>
      current.message === feedback.message ? { ...current, message: '' } : current
    ), 7000);
    return () => window.clearTimeout(timer);
  }, [feedback.message]);

  const [awardSessionId, setAwardSessionId] = useState(`session-${Date.now()}`);
  const [awardProviderId, setAwardProviderId] = useState('nvf-demo');
  const [awardEvseId, setAwardEvseId] = useState('DE*ABC*E*001');
  const [awardEnergyKwh, setAwardEnergyKwh] = useState(12);
  const [awardDirection, setAwardDirection] = useState<'CHARGE' | 'DISCHARGE'>('DISCHARGE');

  const [spendAmount, setSpendAmount] = useState(5);
  const [spendSessionId, setSpendSessionId] = useState(`spend-${Date.now()}`);
  const [spendProviderId, setSpendProviderId] = useState('nvf-demo');

  const [activeTab, setActiveTab] = useState<'transactions' | 'rewardlogic' | 'monitoring'>('transactions');

  const maskedWallet = useMemo(() => {
    if (!walletData?.walletAddress) return 'No wallet loaded';
    const v = walletData.walletAddress;
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  }, [walletData]);

  async function apiRequest(path: string, options?: RequestInit) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers || {}) },
    });
  }

  async function loadWallet(options?: { suppressFeedback?: boolean }) {
    setLoadingWallet(true);
    if (!options?.suppressFeedback) setFeedback({ kind: 'idle', message: 'Loading wallet...' });
    try {
      const res = await apiRequest(`/wallet/${encodeURIComponent(uid)}`, { method: 'GET' });
      const data = await res.json();
      if (!res.ok) {
        setWalletData(null);
        setFeedback({ kind: 'error', message: data?.message || data?.error || 'Failed to load wallet' });
        return;
      }
      setWalletData(data as WalletResponse);
      if (!options?.suppressFeedback) setFeedback({ kind: 'success', message: 'Wallet loaded successfully.' });
    } catch (err) {
      setWalletData(null);
      setFeedback({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoadingWallet(false);
    }
  }

  async function submitAward(event: FormEvent) {
    event.preventDefault();
    setFeedback({ kind: 'idle', message: 'Submitting award...' });
    try {
      const startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const endTime = new Date().toISOString();
      const res = await apiRequest('/ingest/cdr', {
        method: 'POST',
        body: JSON.stringify({
          SessionID: awardSessionId,
          ProviderID: awardProviderId,
          cdr_token: { contract_id: uid },
          EVSEID: awardEvseId,
          StartTime: startTime,
          EndTime: endTime,
          Energy: awardEnergyKwh.toString(),
          EnergyDirection: awardDirection,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback({ kind: 'error', message: data?.message || data?.error || 'Award failed' }); return; }
      const eligible = Boolean(data?.eligible);
      const txHash = data?.txHash;
      if (!eligible) { setFeedback({ kind: 'error', message: data?.message || 'CDR accepted but not eligible for reward.' }); return; }
      if (!txHash) { setFeedback({ kind: 'error', message: 'Award eligible but tx hash missing. Check backend logs.' }); return; }
      setFeedback({ kind: 'success', message: `Award processed. Tx: ${txHash}` });
      setAwardSessionId(`session-${Date.now()}`);
      await loadWallet({ suppressFeedback: true });
    } catch (err) {
      setFeedback({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  async function submitSpend(event: FormEvent) {
    event.preventDefault();
    const currentBalance = Number(walletData?.balance || 0);
    if (currentBalance <= 0) { setFeedback({ kind: 'error', message: 'No balance to spend. Award tokens first.' }); return; }
    setFeedback({ kind: 'idle', message: 'Submitting spend...' });
    try {
      const res = await apiRequest('/spend', {
        method: 'POST',
        body: JSON.stringify({ uid, amount: spendAmount, sessionId: spendSessionId, providerId: spendProviderId, label: 'Admin test spend' }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback({ kind: 'error', message: data?.message || data?.error || 'Spend failed' }); return; }
      setFeedback({ kind: 'success', message: `Spend processed. Tx: ${data.txHash || 'pending'}` });
      setSpendSessionId(`spend-${Date.now()}`);
      await loadWallet({ suppressFeedback: true });
    } catch (err) {
      setFeedback({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <div className="wallet-shell">
      <aside className="left-rail">
        <div className="brand-lockup">
          <div className="brand-glyph"><img src="/logo-blue.svg" alt="NEVERFLAT logo" /></div>
          <div>
            <h1>Admin Console <img src="/car-icon.svg" className="brand-car" alt=""/></h1>
            <p>NEVERFLAT Platform Operations</p>
          </div>
        </div>

        <div className="rail-card">
          <span className="label">User UID</span>
          <input value={uid} onChange={(e) => setUid(e.target.value)} />
          <button onClick={() => loadWallet()} disabled={loadingWallet}>
            {loadingWallet ? 'Loading...' : 'Load Wallet'}
          </button>
        </div>

        <nav className="rail-tab-nav">
          <button className={`rail-tab${activeTab === 'transactions' ? ' rail-tab--active' : ''}`} onClick={() => setActiveTab('transactions')}>
            Test Transactions
          </button>
          <button className={`rail-tab${activeTab === 'rewardlogic' ? ' rail-tab--active' : ''}`} onClick={() => setActiveTab('rewardlogic')}>
            Reward Logic
          </button>
          <button className={`rail-tab${activeTab === 'monitoring' ? ' rail-tab--active' : ''}`} onClick={() => setActiveTab('monitoring')}>
            Operational Monitoring
          </button>
        </nav>

        <button className="btn-ghost" style={{ marginTop: '0.75rem' }} onClick={onLogout}>Sign Out</button>
        {onBack && <button className="back-btn back-btn--admin-sidebar" onClick={onBack}>Back</button>}
      </aside>

      {feedback.message && (
        <div
          className={`status-strip status-toast ${feedback.kind === 'success' ? 'status-strip--success' : feedback.kind === 'error' ? 'status-strip--error' : 'status-strip--neutral'}`}
          role="status"
        >
          {feedback.message}
        </div>
      )}

      <main className="main-view">
        {activeTab === 'rewardlogic' || activeTab === 'monitoring' ? (
          <AdminDashboard
            baseUrl={baseUrl}
            externalToken={adminToken}
            section={activeTab === 'monitoring' ? 'monitoring' : 'rules'}
          />
        ) : (
          <>
            <section className="hero-card">
              <div>
                <p className="label">Wallet Address</p>
                <h2>{maskedWallet}</h2>
                <p className="subtle">UID: {uid}</p>
              </div>
              <div className="totals-grid">
                <div><p className="label">Current Balance</p><p className="value">{walletData?.balance || '0.00'} SPARKZ</p></div>
                <div><p className="label">Total Awarded</p><p className="value">{walletData?.totalAwarded || '0.00'} SPARKZ</p></div>
                <div><p className="label">Total Spent</p><p className="value">{walletData?.totalSpent || '0.00'} SPARKZ</p></div>
              </div>
            </section>

            <section className="actions-grid">
              <form className="action-card" onSubmit={submitAward}>
                <h3>Simulate Award</h3>
                <p className="subtle">DISCHARGE is pre-selected and usually eligible.</p>
                <label>Session ID<input value={awardSessionId} onChange={(e) => setAwardSessionId(e.target.value)} required /></label>
                <label>Provider ID<input value={awardProviderId} onChange={(e) => setAwardProviderId(e.target.value)} required /></label>
                <label>EVSEID<input value={awardEvseId} onChange={(e) => setAwardEvseId(e.target.value)} required /></label>
                <label>
                  Energy kWh
                  <input type="number" min="0.1" step="0.1" value={awardEnergyKwh} onChange={(e) => setAwardEnergyKwh(Number(e.target.value))} required />
                </label>
                <label>
                  Direction
                  <select value={awardDirection} onChange={(e) => setAwardDirection(e.target.value as 'CHARGE' | 'DISCHARGE')}>
                    <option value="CHARGE">CHARGE</option>
                    <option value="DISCHARGE">DISCHARGE</option>
                  </select>
                </label>
                <button type="submit">Submit Award</button>
              </form>

              <form className="action-card" onSubmit={submitSpend}>
                <h3>Simulate Spend</h3>
                <p className="subtle">Deducts from wallet balance via managed flow.</p>
                <label>Session ID<input value={spendSessionId} onChange={(e) => setSpendSessionId(e.target.value)} required /></label>
                <label>Provider ID<input value={spendProviderId} onChange={(e) => setSpendProviderId(e.target.value)} required /></label>
                <label>
                  Amount (SPARKZ)
                  <input type="number" min="0.1" step="0.1" value={spendAmount} onChange={(e) => setSpendAmount(Number(e.target.value))} required />
                </label>
                <button type="submit">Submit Spend</button>
              </form>
            </section>

            <ActivityList history={walletData?.history || []} />
          </>
        )}
      </main>
    </div>
  );
}

// Shared activity list component
export function ActivityList({ history }: { history: WalletHistoryItem[] }) {
  return (
    <section className="activity-card">
      <h3 className="heading-with-icon">
        <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        Recent Activity
      </h3>
      <p className="subtle activity-helper">
        Your earned and spent SPARKZ will appear here after off-peak charging, V2G activity, or charging discounts.
      </p>
      {!history.length && <p className="subtle">No activity yet.</p>}
      {!!history.length && (
        <ul>
          {history.slice(0, 10).map((item, index) => {
            const rowContent = (
              <>
                <div>
                  <strong>{item.type.toUpperCase()}</strong>
                  {item.uid && <p className="activity-contract-id">Contract ID: {item.uid}</p>}
                  {item.walletAddress && (
                    <p className="activity-contract-id">
                      {item.walletName ? `${item.walletName} - ` : ''}{item.walletAddress}
                    </p>
                  )}
                  <p>{item.amount} SPARKZ{item.awardType ? ` - ${item.awardType}` : ''}</p>
                </div>
                <div className="subtle">
                  <p>{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Pending'}</p>
                  {item.txHash && <p>{item.txHash.slice(0, 10)}...</p>}
                </div>
              </>
            );
            return item.txHash ? (
              <a key={`${item.txHash}-${index}`} className="activity-row activity-row--link"
                href={`https://amoy.polygonscan.com/tx/${item.txHash}`} target="_blank" rel="noopener noreferrer">
                {rowContent}
              </a>
            ) : (
              <li key={`${item.timestamp || 'history'}-${index}`} className="activity-row">{rowContent}</li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
