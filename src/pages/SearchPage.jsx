import { useState, useMemo } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { searchStocks, getStockProfile, getStockList } from '../data/mockStocks';
import StockCard from '../components/ui/StockCard';
import './SearchPage.css';

const SECTORS = ['All', 'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical', 'Consumer Defensive', 'Communication Services', 'Energy', 'Automotive'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const allStocks = useMemo(() => getStockList(), []);

  const results = useMemo(() => {
    let list = query
      ? searchStocks(query)
      : allStocks;

    if (sector !== 'All') {
      list = list.filter((s) => s.sector === sector);
    }

    return list.map((s) => getStockProfile(s.ticker)).filter(Boolean);
  }, [query, sector, allStocks]);

  return (
    <div className="search-page">
      <div className="page-header">
        <h1 className="page-title">Search Stocks</h1>
        <p className="page-subtitle">Browse and discover stocks across all sectors</p>
      </div>

      <div className="sp-controls card animate-fadeIn">
        <div className="sp-search-row">
          <div className="sp-search-input-wrap">
            <SearchIcon size={18} className="sp-search-icon" />
            <input
              type="text"
              placeholder="Search by name or ticker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sp-search-input"
            />
          </div>
        </div>
        <div className="sp-sectors">
          <Filter size={15} color="var(--text-muted)" />
          {SECTORS.map((s) => (
            <button
              key={s}
              className={`tab-pill ${sector === s ? 'active' : ''}`}
              onClick={() => setSector(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sp-results-count">
        {results.length} stock{results.length !== 1 ? 's' : ''} found
      </div>

      <div className="sp-grid">
        {results.map((stock, i) => (
          <StockCard key={stock.ticker} stock={stock} delay={i * 40} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="sp-no-results card">
          <p>No stocks match your search. Try a different query or sector filter.</p>
        </div>
      )}
    </div>
  );
}
