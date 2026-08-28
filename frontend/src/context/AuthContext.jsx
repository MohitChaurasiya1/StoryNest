import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, parentChildrenApi, tokenService, getApiErrorMessage } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children: childrenComponents }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenService.getAccessToken());
  const [childrenList, setChildrenList] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active child object
  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0] || null;

  const fetchUserData = async () => {
    try {
      const meData = await authApi.getMe();
      setUser(meData.user);
      const fetchedChildren = meData.children || [];
      setChildrenList(fetchedChildren);

      const savedActiveId = localStorage.getItem('storynest_active_child_id');
      const foundChild = fetchedChildren.find(c => String(c.id) === String(savedActiveId));
      if (foundChild) {
        setActiveChildId(foundChild.id);
      } else if (fetchedChildren.length > 0) {
        setActiveChildId(fetchedChildren[0].id);
        localStorage.setItem('storynest_active_child_id', fetchedChildren[0].id);
      } else {
        setActiveChildId(null);
        localStorage.removeItem('storynest_active_child_id');
      }

      setToken(tokenService.getAccessToken());
      return meData;
    } catch (err) {
      console.warn('Session verification failed:', err);
      logout();
      throw err;
    }
  };

  const initAuth = async () => {
    setLoading(true);
    setError(null);
    if (tokenService.hasAccessToken()) {
      try {
        await fetchUserData();
      } catch (err) {
        // Token invalid or expired
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const changeActiveChild = (id) => {
    setActiveChildId(id || null);
    if (id) {
      localStorage.setItem('storynest_active_child_id', id);
    } else {
      localStorage.removeItem('storynest_active_child_id');
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const tokens = await authApi.login(username, password);
      tokenService.setTokens(tokens);
      setToken(tokens.access);
      const meData = await fetchUserData();
      return meData.user;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Invalid username or password.');
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (payload) => {
    setError(null);
    try {
      const response = await authApi.register(payload);
      return response;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed. Please check your details.');
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    authApi.logout();
    tokenService.clearTokens();
    localStorage.removeItem('storynest_active_child_id');
    setUser(null);
    setToken(null);
    setChildrenList([]);
    setActiveChildId(null);
    setError(null);
  };

  const handleCreateChild = async (childData) => {
    const newChild = await parentChildrenApi.createChild(childData);
    setChildrenList(prev => [...prev, newChild]);
    changeActiveChild(newChild.id);
    return newChild;
  };

  const handleUpdateChild = async (id, childData) => {
    const updated = await parentChildrenApi.updateChild(id, childData);
    setChildrenList(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const handleDeleteChild = async (id) => {
    await parentChildrenApi.deleteChild(id);
    const remaining = childrenList.filter(c => c.id !== id);
    setChildrenList(remaining);
    if (remaining.length > 0) {
      if (activeChildId === id || !remaining.some(c => c.id === activeChildId)) {
        changeActiveChild(remaining[0].id);
      }
    } else {
      changeActiveChild(null);
    }
  };

  const handleUpdateProfile = async (payload) => {
    const updatedUser = await authApi.updateProfile(payload);
    setUser(prev => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const handleChangePassword = async (payload) => {
    const result = await authApi.changePassword(payload);
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      loading,
      error,
      childrenList,
      activeChild,
      activeChildId,
      setActiveChildId: changeActiveChild,
      login,
      register,
      logout,
      updateProfile: handleUpdateProfile,
      changePassword: handleChangePassword,
      createChild: handleCreateChild,
      updateChild: handleUpdateChild,
      deleteChild: handleDeleteChild,
      refreshChildren: fetchUserData
    }}>
      {childrenComponents}
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

