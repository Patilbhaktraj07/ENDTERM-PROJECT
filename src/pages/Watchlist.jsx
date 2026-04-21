import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, Download, ArrowUpRight, ArrowDownRight, BookmarkX } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getStockProfile, getHistoricalData } from '../data/mockStocks';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import useStockStore from '../store/useStockStore';
import { useToast } from '../components/ui/Toast';
import './Watchlist.css';

export default function Watchlist() {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useStockStore();
  const { addToast } = useToast();

  const stocksData = useMemo(() => {
    return watchlist.map((ticker) => {
      const profile = getStockProfile(ticker);
      const history = getHistoricalData(ticker);
      const spark = history.slice(-30).map((d) => ({ v: d.close }));
      return { ...profile, spark };
    }).filter(Boolean);
  }, [watchlist]);

  function handleExport() {
    if (!stocksData.length) return;
    const data = stocksData.map((s) => ({
      Ticker: s.ticker,
      Name: s.name,
      Price: s.currentPrice,
      Change: s.changePercent,
      'Market Cap': s.marketCap,
      'P/E Ratio': s.peRatio,
      Sector: s.sector,
    }));
    exportToCSV(data, 'watchlist.csv');
  }

  if (!watchlist.length) {
    return (
      <div className="watchlist">
        <div className="page-header">
          <h1 className="page-title">
            <Star size={28} style={{ color: '#f59e0b', marginRight: 10, verticalAlign: 'middle' }} />
            Watchlist
          </h1>
          <p className="page-subtitle">Track your favorite stocks in one place</p>
        </div>
        <div className="wl-empty card animate-fadeIn">
          <BookmarkX size={56} color="var(--text-muted)" />
          <h3>Your watchlist is empty</h3>
          <p>Search for stocks and click the star icon to add them to your watchlist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')} style={{ marginTop: 16 }}>
            Search Stocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Star size={28} style={{ color: '#f59e0b', marginRight: 10, verticalAlign: 'middle' }} />
            Watchlist
          </h1>
          <p className="page-subtitle">Tracking {watchlist.length} stock{watchlist.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="wl-grid">
        {stocksData.map((stock, i) => {
          const isPositive = stock.changePercent >= 0;
          return (
            <div
              key={stock.ticker}
              className="wl-card card animate-fadeIn"
              style={{ animationDelay: `${i * 60}ms`, cursor: 'pointer' }}
              onClick={() => navigate(`/stock/${stock.ticker}`)}
            >
              <div className="wl-card-header">
                <div>
                  <span className="stock-ticker-badge">{stock.ticker}</span>
                  <div className="wl-card-name">{stock.name}</div>
                  <div className="wl-card-sector">{stock.sector}</div>
                </div>
                <button
                  className="wl-remove-btn"
                  onClick={(e) => { e.stopPropagation(); removeFromWatchlist(stock.ticker); addToast(`${stock.ticker} removed from watchlist`, 'info', 'Watchlist Updated'); }}
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="wl-card-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={stock.spark}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={isPositive ? 'var(--green)' : 'var(--red)'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="wl-card-footer">
                <span className="wl-price">{formatCurrency(stock.currentPrice)}</span>
                <span className={`stock-card-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {formatPercent(stock.changePercent)}
                </span>
              </div>

              <div className="wl-card-metrics">
                <div className="wl-card-metric">
                  <span>Mkt Cap</span>
                  <span>{formatCurrency(stock.marketCap, true)}</span>
                </div>
                <div className="wl-card-metric">
                  <span>P/E</span>
                  <span>{stock.peRatio}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
