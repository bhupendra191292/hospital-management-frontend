import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions, getRoleInfo } from '../constants/roles';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('newflow_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserRole(userData.role);
        setPermissions(userData.permissions || []);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('newflow_user');
      }
    }

    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
    setPermissions(userData.permissions || []);
    localStorage.setItem('newflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setPermissions([]);
    localStorage.removeItem('newflow_user');
    localStorage.removeItem('newflow_token');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('newflow_user', JSON.stringify(newUserData));
  };

  const can = (permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const canAny = (permissionList) => {
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissionList);
  };

  const canAll = (permissionList) => {
    if (!userRole) return false;
    return hasAllPermissions(userRole, permissionList);
  };

  const getRoleDetails = () => {
    if (!userRole) return null;
    return getRoleInfo(userRole);
  };

  const isRole = (role) => {
    return userRole === role;
  };

  const isAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  const value = {
    user,
    userRole,
    permissions,
    isLoading,
    login,
    logout,
    updateUser,
    can,
    canAny,
    canAll,
    getRoleDetails,
    isRole,
    isAnyRole,
    ROLES,
    PERMISSIONS
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
