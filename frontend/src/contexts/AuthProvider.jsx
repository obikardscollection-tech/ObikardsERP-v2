import { useEffect, useState } from "react";
import AuthContext from "./authContext";
import * as authService from "../services/authService";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authService.getCurrentUser()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    function handleUnauthorized() {
      setUser(null);
      setLoading(false);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  async function signIn(credentials) {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data.user;
  }

  async function signOut() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;