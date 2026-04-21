import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { getHistoricalData } from '../../data/mockStocks';
import useStockStore from '../../store/useStockStore';
import { useToast } from './Toast';
import { useMemo } from 'react';

export default function StockCard({ stock, delay = 0 }) {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore();
  const { addToast } = useToast();
  const isWatched = watchlist.includes(stock.ticker);

  // Get last 30 days for sparkline
  const sparkData = useMemo(() => {
    const history = getHistoricalData(stock.ticker);
    return history.slice(-30).map((d) => ({ v: d.close }));
  }, [stock.ticker]);

  const isPositive = stock.changePercent >= 0;

  return (
    <div
      className="stock-card card animate-fadeIn"
      style={{ animationDelay: `${delay}ms`, cursor: 'pointer' }}
      onClick={() => navigate(`/stock/${stock.ticker}`)}
    >
      <div className="stock-card-top">
        <div className="stock-card-info">
          <div className="stock-card-ticker-row">
            <span className="stock-ticker-badge">{stock.ticker}</span>
            <button
              className={`watchlist-star ${isWatched ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isWatched) { removeFromWatchlist(stock.ticker); addToast(`${stock.ticker} removed`, 'info', 'Watchlist'); }
                else { addToWatchlist(stock.ticker); addToast(`${stock.ticker} added`, 'success', 'Watchlist'); }
              }}
              title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star size={15} fill={isWatched ? '#f59e0b' : 'none'} />
            </button>
          </div>
          <div className="stock-card-name">{stock.name}</div>
        </div>
        <div className="stock-card-sparkline">
          <ResponsiveContainer width={80} height={36}>
            <LineChart data={sparkData}>
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
      </div>
      <div className="stock-card-bottom">
        <span className="stock-card-price">{formatCurrency(stock.currentPrice)}</span>
        <span className={`stock-card-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {formatPercent(stock.changePercent)}
        </span>
      </div>
    </div>
  );
}
