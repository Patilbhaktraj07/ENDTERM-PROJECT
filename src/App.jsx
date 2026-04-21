import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import TopStocks from './pages/TopStocks';
import Simulator from './pages/Simulator';
import Watchlist from './pages/Watchlist';
import SearchPage from './pages/SearchPage';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/stock/:ticker" element={<StockDetails />} />
                <Route path="/top-stocks" element={<TopStocks />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/watchlist" element={<Watchlist />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
