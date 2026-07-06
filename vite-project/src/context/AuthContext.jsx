'use client';
import { createContext, useState, useContext } from 'react';
import { fetchUsers } from '../api/userService';
//import { loginUserApi } from "../api/userService";
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation(['login', 'common']);
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const login = async (username, password) => {
    try {
      const users = await fetchUsers();
      const foundUser = users.find((u) => u.username === username && u.password === password);

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        return { success: true };
      } else {
        return { success: false, message: t('IncorrectCred') };
      }
    } catch (error) {
      console.log('Giriş hatası', error);

      return { success: false, message: t('ServerError') };
    }
  };

  /* const login = async (username,password) => {
    try{
      const payload = {username,password};

      const response = await loginUserApi(payload);

    if(response){
      setUser(response);
      return { success : true}
    }
    
    }catch(error){
      console.log("Giriş hatası",error);
      if (error.response && error.response.status === 401) {
          return { success: false, message: "Kullanıcı adı veya şifre hatalı!" };
      }
      if (error.response && error.response.status === 404) {
          return { success: false, message: "Böyle bir kullanıcı bulunamadı (API Endpoint Yok)!" };
      }
      
      return { success: false, message: "Sunucu hatası!" };
    }

    };*/

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const values = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
