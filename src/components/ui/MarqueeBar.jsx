import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getStockList } from '../../data/mockStocks';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function MarqueeBar() {
  const stocks = useMemo(() => getStockList().slice(0, 15), []);

  // Duplicate for seamless loop
  const items = [...stocks, ...stocks];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {items.map((stock, i) => {
          const isPositive = stock.changePercent >= 0;
          return (
            <div className="marquee-item" key={`${stock.ticker}-${i}`}>
              <span className="marquee-ticker">{stock.ticker}</span>
              <span className="marquee-price">{formatCurrency(stock.currentPrice)}</span>
              <span className={`marquee-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formatPercent(stock.changePercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
