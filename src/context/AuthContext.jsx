import { createContext, useContext, useEffect, useState } from 'react';

// ─── Local Auth Helpers (localStorage-based, no Firebase needed) ────────────
const USERS_KEY = 'stockanalyzer_users';
const SESSION_KEY = 'stockanalyzer_session';

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Auth Context ───────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedUser = getSession();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const loginWithEmail = async (email, password) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email);

    if (!found) {
      const error = new Error('Invalid email or password.');
      error.code = 'auth/user-not-found';
      throw error;
    }

    if (found.password !== password) {
      const error = new Error('Invalid email or password.');
      error.code = 'auth/wrong-password';
      throw error;
    }

    const sessionUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName || null,
      photoURL: found.photoURL || null,
    };

    saveSession(sessionUser);
    setUser(sessionUser);
  };

  const signupWithEmail = async (email, password, name) => {
    if (!password || password.length < 6) {
      const error = new Error('Password should be at least 6 characters.');
      error.code = 'auth/weak-password';
      throw error;
    }

    const users = getStoredUsers();

    if (users.find((u) => u.email === email)) {
      const error = new Error('Email is already in use.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    const newUser = {
      uid: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      email,
      password,
      displayName: name || null,
      photoURL: null,
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: newUser.photoURL,
    };

    saveSession(sessionUser);
    setUser(sessionUser);

    return { user: sessionUser };
  };

  const logout = async () => {
    clearSession();
    setUser(null);
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...(displayName !== undefined && { displayName }),
      ...(photoURL !== undefined && { photoURL }),
    };

    // Update session
    saveSession(updatedUser);
    setUser(updatedUser);

    // Update stored user record too
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], displayName: updatedUser.displayName, photoURL: updatedUser.photoURL };
      saveUsers(users);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading StockVision...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, signupWithEmail, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
