import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useStockStore from '../../store/useStockStore';
import './Layout.css';

export default function Layout({ children }) {
  const { darkMode, sidebarOpen } = useStockStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <div className="layout-main">
        <Navbar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
