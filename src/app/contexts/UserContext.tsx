import { createContext, useContext, useState, ReactNode } from 'react';

type UserType = 'propietario' | 'roomie';

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>('roomie');
  const [userName, setUserName] = useState<string>('Teresa H.');

  return (
    <UserContext.Provider value={{ userType, setUserType, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
