import { createContext, useContext, useState } from 'react';

// Demo-only session: there is no backend yet, so "logging in" just flips a flag
// that switches the site to the member (after-login) chrome.
const AuthContext = createContext(null);
const KEY = 'noholi.member';

export const DEMO_MEMBER = {
  name: 'Mohammad Rafiqul Islam',
  shortName: 'Mohammad R.',
  cardNumber: 'NL-88204',
};

function readSession() {
  try {
    return localStorage.getItem(KEY) ? DEMO_MEMBER : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [member, setMember] = useState(readSession);

  const logIn = () => {
    try { localStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
    setMember(DEMO_MEMBER);
  };
  const logOut = () => {
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    setMember(null);
  };

  return <AuthContext.Provider value={{ member, logIn, logOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
