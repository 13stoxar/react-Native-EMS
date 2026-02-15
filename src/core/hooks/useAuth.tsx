import React, { createContext, useContext, useState, useEffect } from "react";
import { saveToken, getToken, removeToken } from "../storage/secureStorage";
import { loginUser } from "../api/auth.api";

interface AuthContextType {
  userToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      if (token) setUserToken(token);
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    await saveToken(data.token);
    setUserToken(data.token);
  };

  const logout = async () => {
    await removeToken();
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
