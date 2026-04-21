// Mock stock data with realistic price generation
// This module provides comprehensive stock data for demo purposes.
// Replace with real API calls (Alpha Vantage, Yahoo Finance) for production.

const STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', ceo: 'Tim Cook', founded: 1976, basePrice: 25, growth: 0.00045 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', ceo: 'Sundar Pichai', founded: 1998, basePrice: 30, growth: 0.0004 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', ceo: 'Satya Nadella', founded: 1975, basePrice: 20, growth: 0.00042 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', ceo: 'Andy Jassy', founded: 1994, basePrice: 15, growth: 0.0005 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', ceo: 'Elon Musk', founded: 2003, basePrice: 5, growth: 0.0006 },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', ceo: 'Mark Zuckerberg', founded: 2004, basePrice: 38, growth: 0.00035 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', ceo: 'Jensen Huang', founded: 1993, basePrice: 8, growth: 0.00065 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', ceo: 'Jamie Dimon', founded: 2000, basePrice: 35, growth: 0.00025 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financial Services', ceo: 'Ryan McInerney', founded: 1958, basePrice: 18, growth: 0.0004 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', ceo: 'Joaquin Duato', founded: 1886, basePrice: 60, growth: 0.00015 },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', ceo: 'Doug McMillon', founded: 1962, basePrice: 45, growth: 0.0002 },
  { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', ceo: 'Jon Moeller', founded: 1837, basePrice: 55, growth: 0.00018 },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services', ceo: 'Michael Miebach', founded: 1966, basePrice: 20, growth: 0.00042 },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', ceo: 'Andrew Witty', founded: 1977, basePrice: 30, growth: 0.00038 },
  { ticker: 'HD', name: 'The Home Depot Inc.', sector: 'Consumer Cyclical', ceo: 'Ted Decker', founded: 1978, basePrice: 25, growth: 0.00032 },
  { ticker: 'DIS', name: 'The Walt Disney Co.', sector: 'Communication Services', ceo: 'Bob Iger', founded: 1923, basePrice: 28, growth: 0.00015 },
  { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services', ceo: 'Brian Moynihan', founded: 1998, basePrice: 15, growth: 0.0002 },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', ceo: 'Darren Woods', founded: 1999, basePrice: 40, growth: 0.00012 },
  { ticker: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', ceo: 'James Quincey', founded: 1886, basePrice: 35, growth: 0.00014 },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', ceo: 'Albert Bourla', founded: 1849, basePrice: 22, growth: 0.0001 },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', ceo: 'Ted Sarandos', founded: 1997, basePrice: 8, growth: 0.00055 },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', ceo: 'Shantanu Narayen', founded: 1982, basePrice: 15, growth: 0.00048 },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', ceo: 'Marc Benioff', founded: 1999, basePrice: 12, growth: 0.00044 },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology', ceo: 'Chuck Robbins', founded: 1984, basePrice: 18, growth: 0.00012 },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', ceo: 'Pat Gelsinger', founded: 1968, basePrice: 22, growth: 0.00008 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', ceo: 'Lisa Su', founded: 1969, basePrice: 3, growth: 0.00058 },
  { ticker: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial Services', ceo: 'Alex Chriss', founded: 1998, basePrice: 10, growth: 0.00035 },
  { ticker: 'NKE', name: 'Nike Inc.', sector: 'Consumer Cyclical', ceo: 'John Donahoe', founded: 1964, basePrice: 20, growth: 0.00028 },
  { ticker: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Defensive', ceo: 'Ron Vachris', founded: 1983, basePrice: 35, growth: 0.00035 },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', ceo: 'Safra Catz', founded: 1977, basePrice: 15, growth: 0.00025 },
];

// Seeded pseudo-random number generator for consistent data
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate historical daily price data for a stock
function generateHistoricalData(stock, years = 12) {
  const rng = seededRandom(stock.ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 137);
  const data = [];
  const endDate = new Date('2026-04-18');
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - years);

  let price = stock.basePrice;
  const volatility = stock.growth > 0.0004 ? 0.025 : 0.018;
  const current = new Date(startDate);

  while (current <= endDate) {
    // Skip weekends
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      const dailyReturn = stock.growth + (rng() - 0.48) * volatility;
      price = Math.max(price * (1 + dailyReturn), 1);

      const dayVolatility = (rng() * 0.03 + 0.005) * price;
      const open = price * (1 + (rng() - 0.5) * 0.01);
      const high = Math.max(price, open) + rng() * dayVolatility;
      const low = Math.min(price, open) - rng() * dayVolatility;

      data.push({
        date: current.toISOString().split('T')[0],
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +Math.max(low, 0.5).toFixed(2),
        close: +price.toFixed(2),
        volume: Math.floor(rng() * 50000000 + 5000000),
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return data;
}

// Cache for generated historical data
const historicalCache = {};

export function getStockList() {
  return STOCKS.map((s) => ({
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
    ceo: s.ceo,
    founded: s.founded,
  }));
}

export function getStockProfile(ticker) {
  const stock = STOCKS.find((s) => s.ticker === ticker);
  if (!stock) return null;

  const history = getHistoricalData(ticker);
  const latest = history[history.length - 1];
  const prevDay = history[history.length - 2];
  const yearAgo = history.find(
    (d) => d.date >= new Date(new Date(latest.date).setFullYear(new Date(latest.date).getFullYear() - 1)).toISOString().split('T')[0]
  );

  const currentPrice = latest.close;
  const change = prevDay ? currentPrice - prevDay.close : 0;
  const changePercent = prevDay ? (change / prevDay.close) * 100 : 0;
  const yearReturn = yearAgo ? ((currentPrice - yearAgo.close) / yearAgo.close) * 100 : 0;

  // Generate realistic metrics based on price and growth
  const rng = seededRandom(stock.ticker.charCodeAt(0) * 31 + stock.ticker.charCodeAt(1) * 17);
  const marketCap = currentPrice * (rng() * 800 + 200) * 1e6;
  const peRatio = 15 + rng() * 40;
  const avgVolume = Math.floor(rng() * 80e6 + 10e6);
  const high52 = currentPrice * (1 + rng() * 0.3);
  const low52 = currentPrice * (1 - rng() * 0.25);
  const dividend = rng() > 0.4 ? +(rng() * 3 + 0.3).toFixed(2) : 0;
  const beta = +(0.6 + rng() * 1.2).toFixed(2);
  const eps = +(currentPrice / peRatio).toFixed(2);

  return {
    ticker: stock.ticker,
    name: stock.name,
    sector: stock.sector,
    ceo: stock.ceo,
    founded: stock.founded,
    currentPrice: +currentPrice.toFixed(2),
    change: +change.toFixed(2),
    changePercent: +changePercent.toFixed(2),
    yearReturn: +yearReturn.toFixed(2),
    marketCap,
    peRatio: +peRatio.toFixed(2),
    avgVolume,
    high52Week: +high52.toFixed(2),
    low52Week: +low52.toFixed(2),
    dividendYield: dividend,
    beta,
    eps,
  };
}

export function getHistoricalData(ticker) {
  if (!historicalCache[ticker]) {
    const stock = STOCKS.find((s) => s.ticker === ticker);
    if (!stock) return [];
    historicalCache[ticker] = generateHistoricalData(stock);
  }
  return historicalCache[ticker];
}

export function searchStocks(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return STOCKS.filter(
    (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  ).map((s) => ({ ticker: s.ticker, name: s.name, sector: s.sector }));
}

export function getYearlyPerformance(ticker) {
  const history = getHistoricalData(ticker);
  if (!history.length) return [];

  const yearly = {};
  history.forEach((d) => {
    const year = d.date.substring(0, 4);
    if (!yearly[year]) yearly[year] = { first: d.close, last: d.close };
    yearly[year].last = d.close;
  });

  return Object.entries(yearly).map(([year, data]) => ({
    year,
    startPrice: +data.first.toFixed(2),
    endPrice: +data.last.toFixed(2),
    growth: +(((data.last - data.first) / data.first) * 100).toFixed(2),
  }));
}

export function getTopStocks(filter = 'growth') {
  const allProfiles = STOCKS.map((s) => {
    const profile = getStockProfile(s.ticker);
    const yearly = getYearlyPerformance(s.ticker);
    const history = getHistoricalData(s.ticker);

    // Calculate metrics
    const totalReturn = history.length > 1
      ? ((history[history.length - 1].close - history[0].close) / history[0].close) * 100
      : 0;

    // Volatility: standard deviation of daily returns
    const returns = [];
    for (let i = 1; i < history.length; i++) {
      returns.push((history[i].close - history[i - 1].close) / history[i - 1].close);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // annualized

    // CAGR
    const yearsSpan = history.length / 252;
    const cagr = yearsSpan > 0
      ? (Math.pow(history[history.length - 1].close / history[0].close, 1 / yearsSpan) - 1) * 100
      : 0;

    return {
      ...profile,
      totalReturn: +totalReturn.toFixed(2),
      volatility: +volatility.toFixed(2),
      cagr: +cagr.toFixed(2),
      yearlyPerformance: yearly,
    };
  });

  let sorted;
  switch (filter) {
    case 'volatility':
      sorted = [...allProfiles].sort((a, b) => a.volatility - b.volatility);
      break;
    case 'longterm':
      // Best risk-adjusted: CAGR / volatility (Sharpe-like)
      sorted = [...allProfiles].sort((a, b) => (b.cagr / b.volatility) - (a.cagr / a.volatility));
      break;
    case 'growth':
    default:
      sorted = [...allProfiles].sort((a, b) => b.totalReturn - a.totalReturn);
      break;
  }

  return sorted.slice(0, 10);
}

export function simulateInvestment(ticker, amount, startDate) {
  const history = getHistoricalData(ticker);
  const start = history.find((d) => d.date >= startDate);
  if (!start) return null;

  const startIndex = history.indexOf(start);
  const endPrice = history[history.length - 1].close;
  const shares = amount / start.close;
  const currentValue = shares * endPrice;
  const growth = ((currentValue - amount) / amount) * 100;

  // Build growth timeline (weekly samples for chart)
  const timeline = [];
  for (let i = startIndex; i < history.length; i += 5) {
    const d = history[i];
    timeline.push({
      date: d.date,
      value: +(shares * d.close).toFixed(2),
    });
  }
  // Always include the last point
  const last = history[history.length - 1];
  if (timeline.length === 0 || timeline[timeline.length - 1].date !== last.date) {
    timeline.push({ date: last.date, value: +(shares * last.close).toFixed(2) });
  }

  return {
    ticker,
    investedAmount: amount,
    startDate: start.date,
    startPrice: start.close,
    endPrice,
    shares: +shares.toFixed(4),
    currentValue: +currentValue.toFixed(2),
    profit: +(currentValue - amount).toFixed(2),
    growthPercent: +growth.toFixed(2),
    timeline,
  };
}

export function getDashboardSummary() {
  const profiles = STOCKS.map((s) => getStockProfile(s.ticker));
  const sorted = [...profiles].sort((a, b) => b.changePercent - a.changePercent);
  const trending = profiles.filter((p) => p.changePercent > 0).length;

  return {
    totalStocks: STOCKS.length,
    bestPerformer: sorted[0],
    worstPerformer: sorted[sorted.length - 1],
    marketTrend: trending > STOCKS.length / 2 ? 'Bullish' : 'Bearish',
    trendPercent: +((trending / STOCKS.length) * 100).toFixed(0),
    sectorDistribution: getSectorDistribution(profiles),
    topMovers: sorted.slice(0, 5),
    bottomMovers: sorted.slice(-5).reverse(),
  };
}

function getSectorDistribution(profiles) {
  const sectors = {};
  profiles.forEach((p) => {
    if (!sectors[p.sector]) sectors[p.sector] = { sector: p.sector, count: 0, totalMarketCap: 0 };
    sectors[p.sector].count++;
    sectors[p.sector].totalMarketCap += p.marketCap;
  });
  return Object.values(sectors);
}

export { STOCKS };
