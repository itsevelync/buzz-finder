"use client";
import { createContext, useState, useContext, ReactNode } from 'react';

interface SelectedPinContextType {
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
}

const SelectedPinContext = createContext<SelectedPinContextType | undefined>(undefined);

export const SelectedPinProvider = ({ 
  children, 
  defaultSelectedId 
}: { 
  children: ReactNode, 
  defaultSelectedId?: string | null 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null);

  return (
    <SelectedPinContext.Provider value={{ selectedId, setSelectedId }}>
      {children}
    </SelectedPinContext.Provider>
  );
};

export const useSelectedPin = () => {
  const context = useContext(SelectedPinContext);
  if (context === undefined) {
    throw new Error('useSelectedPin must be used within a SelectedPinProvider');
  }
  return context;
};