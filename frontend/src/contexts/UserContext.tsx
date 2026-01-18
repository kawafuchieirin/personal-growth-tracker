import { createContext, useContext, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
}

interface UserContextType {
  user: User;
}

const defaultUser: User = {
  id: 'demo-user',
  name: 'Demo User',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const value: UserContextType = {
    user: defaultUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
