import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, TrendingDown, Activity,
  ArrowUpRight, ArrowDownRight, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { getDashboardSummary, getHistoricalData } from '../data/mockStocks';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import MetricCard from '../components/ui/MetricCard';
import StockCard from '../components/ui/StockCard';
import MarqueeBar from '../components/ui/MarqueeBar';
import { SkeletonMetric, SkeletonCard } from '../components/ui/LoadingSkeleton';
import './Dashboard.css';

const PIE_COLORS = ['#5a67d8', '#38b2ac', '#ed8936', '#e53e3e', '#9f7aea', '#48bb78', '#f56565', '#4299e1'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setData(getDashboardSummary());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Market trend chart data (last 60 days of a broad index simulation)
  const trendData = useMemo(() => {
    if (!data) return [];
    const history = getHistoricalData('AAPL');
    const last60 = history.slice(-60);
    return last60.map((d) => ({
      date: d.date.substring(5),
      price: d.close,
      volume: Math.floor(d.volume / 1e6),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of market performance and your tracked stocks</p>
        </div>
        <div className="grid-4">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <div className="grid-2" style={{ marginTop: 20 }}>
          <SkeletonCard height={320} />
          <SkeletonCard height={320} />
        </div>
      </div>
    );
  }

  const { bestPerformer, worstPerformer, marketTrend, trendPercent, sectorDistribution, topMovers, bottomMovers } = data;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of market performance and your tracked stocks</p>
      </div>

      {/* Live Market Ticker */}
      <MarqueeBar />

      {/* Summary Cards */}
      <div className="grid-4">
        <MetricCard
          icon={BarChart3}
          label="Total Stocks"
          value={data.totalStocks}
          subValue="Tracked in database"
          color="#5a67d8"
          delay={0}
        />
        <MetricCard
          icon={TrendingUp}
          label="Best Performer"
          value={bestPerformer.ticker}
          subValue={formatPercent(bestPerformer.changePercent)}
          trend={bestPerformer.changePercent}
          color="#10b981"
          delay={80}
        />
        <MetricCard
          icon={TrendingDown}
          label="Worst Performer"
          value={worstPerformer.ticker}
          subValue={formatPercent(worstPerformer.changePercent)}
          trend={worstPerformer.changePercent}
          color="#ef4444"
          delay={160}
        />
        <MetricCard
          icon={Activity}
          label="Market Trend"
          value={marketTrend}
          subValue={`${trendPercent}% stocks up`}
          trend={trendPercent - 50}
          color="#38b2ac"
          delay={240}
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginTop: 24 }}>
        {/* Market Trend Chart */}
        <div className="card animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <div className="card-header">
            <h3>Market Trend (60 Days)</h3>
            <span className="badge badge-primary">AAPL Index</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-light)' }}
                  interval={9}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow)',
                  }}
                  formatter={(v) => [formatCurrency(v), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#gradientArea)"
                  activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--card-bg)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="card animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <div className="card-header">
            <h3>Sector Distribution</h3>
            <span className="badge badge-primary">{sectorDistribution.length} Sectors</span>
          </div>
          <div className="card-body sector-chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sectorDistribution}
                  dataKey="count"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {sectorDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                  formatter={(v, name) => [`${v} stocks`, name]}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="card animate-fadeIn" style={{ marginTop: 24, animationDelay: '500ms' }}>
        <div className="card-header">
          <h3>Trading Volume (60 Days)</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-light)' }}
                interval={9}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
                formatter={(v) => [`${v}M`, 'Volume']}
              />
              <Bar dataKey="volume" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Bottom Movers */}
      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <div className="card-header">
            <h3>🚀 Top Movers</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topMovers.map((s) => (
                  <tr key={s.ticker} onClick={() => navigate(`/stock/${s.ticker}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.ticker}</span>
                    </td>
                    <td>{formatCurrency(s.currentPrice)}</td>
                    <td>
                      <span className={`badge ${s.changePercent >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {s.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {formatPercent(s.changePercent)}
                      </span>
                    </td>
                    <td>
                      <Eye size={16} color="var(--text-muted)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card animate-fadeIn" style={{ animationDelay: '700ms' }}>
          <div className="card-header">
            <h3>📉 Bottom Movers</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bottomMovers.map((s) => (
                  <tr key={s.ticker} onClick={() => navigate(`/stock/${s.ticker}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.ticker}</span>
                    </td>
                    <td>{formatCurrency(s.currentPrice)}</td>
                    <td>
                      <span className={`badge ${s.changePercent >= 0 ? 'badge-green' : 'badge-red'}`}>
                        {s.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {formatPercent(s.changePercent)}
                      </span>
                    </td>
                    <td>
                      <Eye size={16} color="var(--text-muted)" />
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
