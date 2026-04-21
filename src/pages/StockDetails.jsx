import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Building2, Calendar, User, TrendingUp,
  TrendingDown, DollarSign, BarChart3, Activity, ArrowUpRight,
  ArrowDownRight, Download,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { getStockProfile, getHistoricalData, getYearlyPerformance } from '../data/mockStocks';
import { formatCurrency, formatPercent, formatNumber, formatDateShort } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { useToast } from '../components/ui/Toast';
import useStockStore from '../store/useStockStore';
import { SkeletonCard, SkeletonMetric } from '../components/ui/LoadingSkeleton';
import './StockDetails.css';

const TIME_RANGES = [
  { key: '1Y', label: '1 Year', days: 252 },
  { key: '5Y', label: '5 Years', days: 252 * 5 },
  { key: '10Y', label: '10 Years', days: 252 * 10 },
  { key: 'MAX', label: 'Max', days: Infinity },
];

const CHART_TYPES = [
  { key: 'area', label: 'Line' },
  { key: 'candle', label: 'Candlestick' },
];

export default function StockDetails() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore();
  const { addToast } = useToast();
  const isWatched = watchlist.includes(ticker);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [timeRange, setTimeRange] = useState('1Y');
  const [chartType, setChartType] = useState('area');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProfile(getStockProfile(ticker));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [ticker]);

  const history = useMemo(() => getHistoricalData(ticker), [ticker]);
  const yearly = useMemo(() => getYearlyPerformance(ticker), [ticker]);

  const chartData = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.key === timeRange);
    const sliced = range.days === Infinity ? history : history.slice(-range.days);
    // Sample for performance (max ~200 points)
    const step = Math.max(1, Math.floor(sliced.length / 200));
    return sliced.filter((_, i) => i % step === 0 || i === sliced.length - 1).map((d) => ({
      ...d,
      label: formatDateShort(d.date),
    }));
  }, [history, timeRange]);

  // Candlestick data: use composed chart with bars
  const candleData = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.key === timeRange);
    const sliced = range.days === Infinity ? history : history.slice(-range.days);
    // Weekly aggregation for candlestick
    const weeks = [];
    for (let i = 0; i < sliced.length; i += 5) {
      const chunk = sliced.slice(i, i + 5);
      if (!chunk.length) continue;
      weeks.push({
        date: chunk[0].date,
        label: formatDateShort(chunk[0].date),
        open: chunk[0].open,
        close: chunk[chunk.length - 1].close,
        high: Math.max(...chunk.map((c) => c.high)),
        low: Math.min(...chunk.map((c) => c.low)),
        // For bar representation
        body: [Math.min(chunk[0].open, chunk[chunk.length - 1].close), Math.max(chunk[0].open, chunk[chunk.length - 1].close)],
        wick: [Math.min(...chunk.map((c) => c.low)), Math.max(...chunk.map((c) => c.high))],
        isUp: chunk[chunk.length - 1].close >= chunk[0].open,
      });
    }
    // Sample for performance
    const step = Math.max(1, Math.floor(weeks.length / 100));
    return weeks.filter((_, i) => i % step === 0);
  }, [history, timeRange]);

  if (loading) {
    return (
      <div className="stock-details">
        <div className="sd-back">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="grid-4"><SkeletonMetric /><SkeletonMetric /><SkeletonMetric /><SkeletonMetric /></div>
        <SkeletonCard height={400} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="stock-details">
        <div className="sd-not-found card" style={{ padding: 40, textAlign: 'center' }}>
          <h2>Stock not found</h2>
          <p>Ticker "{ticker}" doesn't exist in our database.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPositive = profile.changePercent >= 0;

  return (
    <div className="stock-details">
      {/* Top bar */}
      <div className="sd-topbar">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="sd-topbar-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportToCSV(history, `${ticker}_history.csv`)}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            className={`btn btn-sm ${isWatched ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              if (isWatched) { removeFromWatchlist(ticker); addToast(`${ticker} removed from watchlist`, 'info', 'Removed'); }
              else { addToWatchlist(ticker); addToast(`${ticker} added to watchlist`, 'success', 'Added'); }
            }}
          >
            <Star size={15} fill={isWatched ? 'white' : 'none'} />
            {isWatched ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>

      {/* Company Header */}
      <div className="sd-header card animate-fadeIn">
        <div className="sd-header-left">
          <div className="sd-ticker-badge">{profile.ticker}</div>
          <div className="sd-header-info">
            <h1 className="sd-company-name">{profile.name}</h1>
            <div className="sd-meta">
              <span><Building2 size={14} /> {profile.sector}</span>
              <span><User size={14} /> {profile.ceo}</span>
              <span><Calendar size={14} /> Founded {profile.founded}</span>
            </div>
          </div>
        </div>
        <div className="sd-header-right">
          <div className="sd-price">{formatCurrency(profile.currentPrice)}</div>
          <div className={`sd-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            {formatCurrency(Math.abs(profile.change))} ({formatPercent(profile.changePercent)})
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-4" style={{ marginTop: 20 }}>
        <div className="sd-metric-card card animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <DollarSign size={18} color="var(--primary)" />
          <div>
            <div className="sd-metric-label">Market Cap</div>
            <div className="sd-metric-value">{formatCurrency(profile.marketCap, true)}</div>
          </div>
        </div>
        <div className="sd-metric-card card animate-fadeIn" style={{ animationDelay: '150ms' }}>
          <BarChart3 size={18} color="var(--accent)" />
          <div>
            <div className="sd-metric-label">P/E Ratio</div>
            <div className="sd-metric-value">{profile.peRatio}</div>
          </div>
        </div>
        <div className="sd-metric-card card animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <Activity size={18} color="var(--orange)" />
          <div>
            <div className="sd-metric-label">Avg Volume</div>
            <div className="sd-metric-value">{formatNumber(profile.avgVolume, true)}</div>
          </div>
        </div>
        <div className="sd-metric-card card animate-fadeIn" style={{ animationDelay: '250ms' }}>
          <TrendingUp size={18} color="var(--green)" />
          <div>
            <div className="sd-metric-label">1Y Return</div>
            <div className="sd-metric-value" style={{ color: profile.yearReturn >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {formatPercent(profile.yearReturn)}
            </div>
          </div>
        </div>
      </div>

      {/* Extra Metrics Row */}
      <div className="sd-extra-metrics animate-fadeIn" style={{ animationDelay: '300ms' }}>
        <div className="sd-extra-item">
          <span className="sd-extra-label">52W High</span>
          <span className="sd-extra-value">{formatCurrency(profile.high52Week)}</span>
        </div>
        <div className="sd-extra-item">
          <span className="sd-extra-label">52W Low</span>
          <span className="sd-extra-value">{formatCurrency(profile.low52Week)}</span>
        </div>
        <div className="sd-extra-item">
          <span className="sd-extra-label">EPS</span>
          <span className="sd-extra-value">{formatCurrency(profile.eps)}</span>
        </div>
        <div className="sd-extra-item">
          <span className="sd-extra-label">Beta</span>
          <span className="sd-extra-value">{profile.beta}</span>
        </div>
        <div className="sd-extra-item">
          <span className="sd-extra-label">Dividend</span>
          <span className="sd-extra-value">{profile.dividendYield ? `${profile.dividendYield}%` : '—'}</span>
        </div>
      </div>

      {/* Price Chart */}
      <div className="card animate-fadeIn" style={{ marginTop: 20, animationDelay: '350ms' }}>
        <div className="card-header">
          <h3>Price History</h3>
          <div className="sd-chart-controls">
            <div className="tab-pills">
              {CHART_TYPES.map((t) => (
                <button
                  key={t.key}
                  className={`tab-pill ${chartType === t.key ? 'active' : ''}`}
                  onClick={() => setChartType(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="tab-pills" style={{ marginLeft: 8 }}>
              {TIME_RANGES.map((r) => (
                <button
                  key={r.key}
                  className={`tab-pill ${timeRange === r.key ? 'active' : ''}`}
                  onClick={() => setTimeRange(r.key)}
                >
                  {r.key}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card-body">
          {chartType === 'area' ? (
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? 'var(--green)' : 'var(--red)'} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={isPositive ? 'var(--green)' : 'var(--red)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--border-light)' }} interval={Math.floor(chartData.length / 8)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v) => [formatCurrency(v), 'Price']} />
                <Area type="monotone" dataKey="close" stroke={isPositive ? 'var(--green)' : 'var(--red)'} strokeWidth={2} fill="url(#stockGrad)" activeDot={{ r: 6, stroke: isPositive ? 'var(--green)' : 'var(--red)', strokeWidth: 2, fill: 'var(--card-bg)' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={candleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--border-light)' }} interval={Math.floor(candleData.length / 8)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(v, name) => {
                    if (name === 'close') return [formatCurrency(v), 'Close'];
                    return [formatCurrency(v), name];
                  }}
                />
                <Bar dataKey="low" stackId="wick" fill="transparent" />
                <Bar dataKey="high" stackId="wick" fill="var(--text-muted)" barSize={1} />
                <Bar
                  dataKey="close"
                  fill="var(--green)"
                  barSize={6}
                  radius={[2, 2, 2, 2]}
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    const color = payload.isUp ? 'var(--green)' : 'var(--red)';
                    return <rect x={x} y={y} width={width} height={Math.max(height, 2)} fill={color} rx={1} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Yearly Performance */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card animate-fadeIn" style={{ animationDelay: '450ms' }}>
          <div className="card-header">
            <h3>Yearly Growth</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v) => [`${v}%`, 'Growth']} />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Bar
                  dataKey="growth"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    const clr = payload.growth >= 0 ? 'var(--green)' : 'var(--red)';
                    return <rect x={x} y={y} width={width} height={height} fill={clr} rx={4} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <div className="card-header">
            <h3>Yearly Summary</h3>
          </div>
          <div className="card-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {yearly.slice().reverse().map((y) => (
                  <tr key={y.year}>
                    <td style={{ fontWeight: 600 }}>{y.year}</td>
                    <td>{formatCurrency(y.startPrice)}</td>
                    <td>{formatCurrency(y.endPrice)}</td>
                    <td>
                      <span className={`badge ${y.growth >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {formatPercent(y.growth)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
