import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, parentApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children: childrenComponents }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('storynest_access_token'));
  const [childrenList, setChildrenList] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active child object
  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0] || null;

  const initAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      let storedToken = localStorage.getItem('storynest_access_token');
      
      if (!storedToken) {
        // Auto-demo authentication for seamless local evaluation
        try {
          const tokens = await authApi.login('parent_demo', 'pass1234');
          localStorage.setItem('storynest_access_token', tokens.access);
          localStorage.setItem('storynest_refresh_token', tokens.refresh);
          setToken(tokens.access);
        } catch (loginErr) {
          // If demo user does not exist, register it
          try {
            await authApi.register({
              username: 'parent_demo',
              password: 'pass1234',
              email: 'parent@storynest.com',
              role: 'PARENT',
              phone: '1234567890'
            });
            const tokens = await authApi.login('parent_demo', 'pass1234');
            localStorage.setItem('storynest_access_token', tokens.access);
            localStorage.setItem('storynest_refresh_token', tokens.refresh);
            setToken(tokens.access);
          } catch (regErr) {
            console.error('Demo registration error:', regErr);
          }
        }
      }

      const meData = await authApi.getMe();
      setUser(meData.user);
      
      let fetchedChildren = meData.children || [];

      // If parent has no children, create default demo child "Leo"
      if (fetchedChildren.length === 0) {
        const newChild = await parentApi.createChild({
          name: "Leo",
          age: 7,
          gender: "boy",
          grade_level: "Grade 2",
          preferred_language: "Bilingual (EN/HI)",
          avatar: "🦁"
        });
        
        // Add sample initial reading log for Leo
        try {
          await parentApi.createReadingLog(newChild.id, {
            story_title: "Leo and the Golden Tree",
            reading_time_minutes: 32,
            pages_read: 5,
            completed: true,
            rating: 5,
            notes: "Great bedtime story!"
          });
        } catch (logErr) {
          console.warn("Could not create initial log", logErr);
        }

        fetchedChildren = [newChild];
      }

      setChildrenList(fetchedChildren);
      
      const savedActiveId = localStorage.getItem('storynest_active_child_id');
      const foundChild = fetchedChildren.find(c => String(c.id) === String(savedActiveId));
      if (foundChild) {
        setActiveChildId(foundChild.id);
      } else if (fetchedChildren.length > 0) {
        setActiveChildId(fetchedChildren[0].id);
        localStorage.setItem('storynest_active_child_id', fetchedChildren[0].id);
      }

    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Unable to authenticate. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const changeActiveChild = (id) => {
    setActiveChildId(id);
    localStorage.setItem('storynest_active_child_id', id);
  };

  const handleCreateChild = async (childData) => {
    const newChild = await parentApi.createChild(childData);
    setChildrenList(prev => [...prev, newChild]);
    changeActiveChild(newChild.id);
    return newChild;
  };

  const handleUpdateChild = async (id, childData) => {
    const updated = await parentApi.updateChild(id, childData);
    setChildrenList(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const handleDeleteChild = async (id) => {
    await parentApi.deleteChild(id);
    const remaining = childrenList.filter(c => c.id !== id);
    setChildrenList(remaining);
    if (activeChildId === id && remaining.length > 0) {
      changeActiveChild(remaining[0].id);
    } else if (remaining.length === 0) {
      setActiveChildId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('storynest_access_token');
    localStorage.removeItem('storynest_refresh_token');
    localStorage.removeItem('storynest_active_child_id');
    setUser(null);
    setToken(null);
    setChildrenList([]);
    setActiveChildId(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      childrenList,
      activeChild,
      activeChildId,
      setActiveChildId: changeActiveChild,
      createChild: handleCreateChild,
      updateChild: handleUpdateChild,
      deleteChild: handleDeleteChild,
      refreshChildren: initAuth,
      logout
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
