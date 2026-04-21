import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown, Settings, Moon, Sun, Edit3, Image as ImageIcon, Camera } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import useStockStore from '../../store/useStockStore';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/search': 'Search Stocks',
  '/top-stocks': 'Top 10 Stocks',
  '/simulator': 'Investment Simulator',
  '/watchlist': 'Watchlist',
};

export default function Navbar() {
  const location = useLocation();
  const { setSidebarOpen, sidebarOpen, darkMode, toggleDarkMode } = useStockStore();
  const { user, logout, updateUserProfile } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const profileRef = useRef(null);

  const pathKey = Object.keys(PAGE_TITLES).find(
    (key) => key === '/' ? location.pathname === '/' : location.pathname.startsWith(key)
  );
  const title = pathKey ? PAGE_TITLES[pathKey] : 'Stock Details';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleEditProfile = () => {
    setEditName(user?.displayName || '');
    setEditPhotoUrl(user?.photoURL || '');
    setShowEditModal(true);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ displayName: editName, photoURL: editPhotoUrl });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const photoURL = user?.photoURL || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-center">
        <SearchBar />
      </div>

      <div className="navbar-right">


        {/* User Profile */}
        <div className="navbar-profile" ref={profileRef}>
          <button
            className="navbar-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            id="profile-menu-btn"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="navbar-avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="navbar-avatar">
                <span>{initials}</span>
              </div>
            )}
            <ChevronDown
              size={14}
              className={`profile-chevron ${showProfileMenu ? 'rotated' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {showProfileMenu && (
            <div className="profile-dropdown animate-scaleIn">
              <div className="profile-dropdown-header">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="dropdown-avatar-img"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="dropdown-avatar">
                    <span>{initials}</span>
                  </div>
                )}
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{displayName}</span>
                  <span className="dropdown-email">{email}</span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button className="profile-dropdown-item" onClick={handleEditProfile}>
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>

              <button className="profile-dropdown-item" onClick={() => {
                toggleDarkMode();
                setShowProfileMenu(false);
              }}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <div className="profile-dropdown-divider" />

              <button className="profile-dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && createPortal(
        <div className="profile-modal-overlay animate-fadeIn">
          <div className="profile-modal animate-scaleIn">
            <div className="profile-modal-header">
              <h3>Edit Profile</h3>
              <p>Update your personal information</p>
            </div>

            <div className="profile-modal-body">
              <div className="profile-avatar-preview-container">
                <div className="profile-avatar-preview">
                  {editPhotoUrl ? (
                    <img src={editPhotoUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="avatar-placeholder">
                      <Camera size={24} />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter new name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Image URL</label>
                <div className="input-with-icon">
                  <ImageIcon size={18} className="input-icon" />
                  <input
                    type="url"
                    value={editPhotoUrl}
                    onChange={(e) => setEditPhotoUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
                <span className="input-hint">Paste a link to your preferred avatar image.</span>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary profile-save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
