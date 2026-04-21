import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, TrendingUp, Shield, Target,
  ArrowUpRight, ArrowDownRight, Star,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LineChart, Line,
} from 'recharts';
import { getTopStocks, getHistoricalData } from '../data/mockStocks';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import useStockStore from '../store/useStockStore';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/LoadingSkeleton';
import './TopStocks.css';

const FILTERS = [
  { key: 'growth', label: 'Highest Growth', icon: TrendingUp, color: '#10b981' },
  { key: 'volatility', label: 'Least Volatility', icon: Shield, color: '#5a67d8' },
  { key: 'longterm', label: 'Best Long-Term', icon: Target, color: '#38b2ac' },
];

export default function TopStocks() {
  const [filter, setFilter] = useState('growth');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const data = getTopStocks(filter);
      setStocks(data);
      setSelectedStock(data[0]?.ticker || null);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [filter]);

  const chartData = stocks.map((s) => ({
    ticker: s.ticker,
    value: filter === 'volatility' ? s.volatility : filter === 'longterm' ? s.cagr : s.totalReturn,
  }));

  const selectedHistory = selectedStock
    ? getHistoricalData(selectedStock).slice(-252).map((d) => ({ date: d.date.substring(5), price: d.close }))
    : [];

  return (
    <div className="top-stocks">
      <div className="page-header">
        <h1 className="page-title">
          <Trophy size={28} style={{ color: 'var(--orange)', marginRight: 10, verticalAlign: 'middle' }} />
          Top 10 Stocks
        </h1>
        <p className="page-subtitle">Best performing stocks based on historical analysis</p>
      </div>

      {/* Filter Tabs */}
      <div className="ts-filters animate-fadeIn">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              className={`ts-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
              style={filter === f.key ? { '--filter-color': f.color } : {}}
            >
              <Icon size={18} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonTable rows={10} />
      ) : (
        <>
          {/* Performance Chart */}
          <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
            <div className="card-header">
              <h3>
                {filter === 'growth' && 'Total Return (%)'}
                {filter === 'volatility' && 'Annualized Volatility (%)'}
                {filter === 'longterm' && 'CAGR (%)'}
              </h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                  />
                  <YAxis
                    dataKey="ticker"
                    type="category"
                    tick={{ fontSize: 12, fill: 'var(--text-primary)', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(v) => [`${v.toFixed(2)}%`, filter === 'volatility' ? 'Volatility' : 'Return']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={filter === 'volatility'
                          ? `hsl(${240 - i * 8}, 70%, 60%)`
                          : `hsl(${160 - i * 10}, 70%, 50%)`
                        }
                        cursor="pointer"
                        onClick={() => setSelectedStock(d.ticker)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Stock Mini Chart */}
          {selectedStock && (
            <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h3>{selectedStock} — 1 Year Price History</h3>
                <button className="btn btn-sm btn-primary" onClick={() => navigate(`/stock/${selectedStock}`)}>
                  View Details →
                </button>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} interval={40} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v) => [formatCurrency(v), 'Price']} />
                    <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stocks Table */}
          <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
            <div className="card-header">
              <h3>Rankings</h3>
            </div>
            <div className="card-body" style={{ padding: '0 24px 24px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Total Return</th>
                    <th>CAGR</th>
                    <th>Volatility</th>
                    <th>Day Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s, i) => {
                    const isWatched = watchlist.includes(s.ticker);
                    return (
                      <tr
                        key={s.ticker}
                        className={selectedStock === s.ticker ? 'ts-row-selected' : ''}
                        onClick={() => setSelectedStock(s.ticker)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className="ts-rank">{i + 1}</span>
                        </td>
                        <td>
                          <div className="ts-stock-cell">
                            <span className="ts-ticker">{s.ticker}</span>
                            <span className="ts-name">{s.name}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(s.currentPrice)}</td>
                        <td>
                          <span className={`badge ${s.totalReturn >= 0 ? 'badge-green' : 'badge-red'}`}>
                            {formatPercent(s.totalReturn)}
                          </span>
                        </td>
                        <td>{s.cagr.toFixed(1)}%</td>
                        <td>{s.volatility.toFixed(1)}%</td>
                        <td>
                          <span style={{ color: s.changePercent >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                            {s.changePercent >= 0 ? <ArrowUpRight size={13} style={{ verticalAlign: 'middle' }} /> : <ArrowDownRight size={13} style={{ verticalAlign: 'middle' }} />}
                            {formatPercent(s.changePercent)}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`watchlist-star ${isWatched ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isWatched) { removeFromWatchlist(s.ticker); addToast(`${s.ticker} removed`, 'info', 'Watchlist'); }
                              else { addToWatchlist(s.ticker); addToast(`${s.ticker} added`, 'success', 'Watchlist'); }
                            }}
                          >
                            <Star size={15} fill={isWatched ? '#f59e0b' : 'none'} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
