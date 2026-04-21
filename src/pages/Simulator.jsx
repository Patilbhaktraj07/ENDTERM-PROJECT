import { useState, useMemo } from 'react';
import {
  Calculator, DollarSign, TrendingUp, Calendar,
  ArrowUpRight, Zap, PiggyBank,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { getStockList, simulateInvestment } from '../data/mockStocks';
import { formatCurrency, formatPercent } from '../utils/formatters';
import './Simulator.css';

export default function Simulator() {
  const stocks = useMemo(() => getStockList(), []);
  const [ticker, setTicker] = useState('AAPL');
  const [amount, setAmount] = useState(10000);
  const [yearsAgo, setYearsAgo] = useState(5);
  const [result, setResult] = useState(null);
  const [hasSimulated, setHasSimulated] = useState(false);

  function handleSimulate() {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - yearsAgo);
    const dateStr = startDate.toISOString().split('T')[0];
    const sim = simulateInvestment(ticker, amount, dateStr);
    setResult(sim);
    setHasSimulated(true);
  }

  const presets = [
    { label: '1Y', value: 1 },
    { label: '3Y', value: 3 },
    { label: '5Y', value: 5 },
    { label: '10Y', value: 10 },
  ];

  return (
    <div className="simulator">
      <div className="page-header">
        <h1 className="page-title">
          <Calculator size={28} style={{ color: 'var(--primary)', marginRight: 10, verticalAlign: 'middle' }} />
          Investment Simulator
        </h1>
        <p className="page-subtitle">See how your investment would have performed over time</p>
      </div>

      {/* Input Panel */}
      <div className="sim-input-panel card animate-fadeIn">
        <div className="sim-inputs">
          <div className="sim-field">
            <label className="sim-label">
              <DollarSign size={15} /> Stock
            </label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="sim-select"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-field">
            <label className="sim-label">
              <PiggyBank size={15} /> Investment Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="sim-input"
              min={1}
              step={100}
            />
          </div>

          <div className="sim-field">
            <label className="sim-label">
              <Calendar size={15} /> Time Period
            </label>
            <div className="sim-presets">
              {presets.map((p) => (
                <button
                  key={p.value}
                  className={`sim-preset ${yearsAgo === p.value ? 'active' : ''}`}
                  onClick={() => setYearsAgo(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary sim-run-btn" onClick={handleSimulate}>
            <Zap size={16} /> Simulate
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSimulated && result && (
        <div className="sim-results animate-fadeIn" style={{ marginTop: 24 }}>
          {/* Result Cards */}
          <div className="sim-result-cards">
            <div className="sim-result-card card">
              <div className="sim-rc-icon" style={{ background: '#5a67d818', color: '#5a67d8' }}>
                <DollarSign size={22} />
              </div>
              <div className="sim-rc-label">Invested</div>
              <div className="sim-rc-value">{formatCurrency(result.investedAmount)}</div>
              <div className="sim-rc-sub">{result.shares} shares @ {formatCurrency(result.startPrice)}</div>
            </div>

            <div className="sim-result-card card">
              <div className="sim-rc-icon" style={{ background: result.profit >= 0 ? '#10b98118' : '#ef444418', color: result.profit >= 0 ? '#10b981' : '#ef4444' }}>
                <TrendingUp size={22} />
              </div>
              <div className="sim-rc-label">Current Value</div>
              <div className="sim-rc-value">{formatCurrency(result.currentValue)}</div>
              <div className="sim-rc-sub">@ {formatCurrency(result.endPrice)} per share</div>
            </div>

            <div className="sim-result-card card highlight">
              <div className="sim-rc-icon" style={{ background: result.profit >= 0 ? '#10b98118' : '#ef444418', color: result.profit >= 0 ? '#10b981' : '#ef4444' }}>
                <ArrowUpRight size={22} />
              </div>
              <div className="sim-rc-label">
                {result.profit >= 0 ? 'Total Profit' : 'Total Loss'}
              </div>
              <div className="sim-rc-value" style={{ color: result.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {formatCurrency(Math.abs(result.profit))}
              </div>
              <div className="sim-rc-sub">
                <span className={`badge ${result.growthPercent >= 0 ? 'badge-green' : 'badge-red'}`}>
                  {formatPercent(result.growthPercent)}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="card animate-fadeIn" style={{ marginTop: 20, animationDelay: '200ms' }}>
            <div className="card-header">
              <h3>Investment Growth Over Time</h3>
              <span className="badge badge-primary">{ticker}</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={result.timeline}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={result.profit >= 0 ? 'var(--green)' : 'var(--red)'} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={result.profit >= 0 ? 'var(--green)' : 'var(--red)'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border-light)' }}
                    interval={Math.floor(result.timeline.length / 8)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrency(v, true)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                    formatter={(v) => [formatCurrency(v), 'Portfolio Value']}
                  />
                  <ReferenceLine
                    y={result.investedAmount}
                    stroke="var(--text-muted)"
                    strokeDasharray="5 5"
                    label={{
                      value: `Invested: ${formatCurrency(result.investedAmount)}`,
                      fill: 'var(--text-muted)',
                      fontSize: 11,
                      position: 'insideTopRight',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={result.profit >= 0 ? 'var(--green)' : 'var(--red)'}
                    strokeWidth={2}
                    fill="url(#simGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {!hasSimulated && (
        <div className="sim-placeholder card animate-fadeIn">
          <div className="sim-placeholder-content">
            <Calculator size={48} color="var(--text-muted)" />
            <h3>Run a Simulation</h3>
            <p>Select a stock, enter an amount, choose a time period, and click Simulate to see how your investment would have performed.</p>
          </div>
        </div>
      )}
    </div>
  );
}
