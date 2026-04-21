import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchStocks } from '../../data/mockStocks';

export default function SearchBar({ expanded = false, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        const found = searchStocks(query);
        setResults(found);
        setIsOpen(true);
        setActiveIndex(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(ticker) {
    setQuery('');
    setIsOpen(false);
    navigate(`/stock/${ticker}`);
    if (onClose) onClose();
  }

  function handleKeyDown(e) {
    if (!isOpen || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(results[activeIndex].ticker);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (onClose) onClose();
    }
  }

  return (
    <div className="search-bar-wrapper" ref={dropdownRef}>
      <div className="search-input-container">
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stocks by name or ticker..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="search-input"
          id="stock-search-input"
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-dropdown animate-scaleIn">
          {results.map((stock, i) => (
            <button
              key={stock.ticker}
              className={`search-result-item ${i === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelect(stock.ticker)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="result-ticker">{stock.ticker}</span>
              <span className="result-name">{stock.name}</span>
              <span className="result-sector">{stock.sector}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="search-dropdown animate-scaleIn">
          <div className="search-empty">No stocks found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
