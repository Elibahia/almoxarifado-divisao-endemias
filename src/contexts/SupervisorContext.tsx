import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SupervisorContextType {
  selectedSubdistrict: string | null;
  setSelectedSubdistrict: (subdistrict: string | null) => void;
}

const SupervisorContext = createContext<SupervisorContextType | undefined>(undefined);

export function SupervisorProvider({ children }: { children: ReactNode }) {
  const [selectedSubdistrict, setSelectedSubdistrictState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('supervisor-selected-subdistrict');
    if (saved) {
      setSelectedSubdistrictState(saved);
    }
  }, []);

  // Save to localStorage when changed
  const setSelectedSubdistrict = (subdistrict: string | null) => {
    setSelectedSubdistrictState(subdistrict);
    if (subdistrict) {
      localStorage.setItem('supervisor-selected-subdistrict', subdistrict);
    } else {
      localStorage.removeItem('supervisor-selected-subdistrict');
    }
  };

  return (
    <SupervisorContext.Provider value={{ selectedSubdistrict, setSelectedSubdistrict }}>
      {children}
    </SupervisorContext.Provider>
  );
}

export function useSupervisor() {
  const context = useContext(SupervisorContext);
  if (context === undefined) {
    throw new Error('useSupervisor must be used within a SupervisorProvider');
  }
  return context;
}