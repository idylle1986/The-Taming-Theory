import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ProtocolState } from './types';
import { reducer, initialState, Action } from './reducer';

const STORAGE_KEY = 'taming_protocol_state_v1';

interface ProtocolContextType {
  state: ProtocolState;
  dispatch: React.Dispatch<Action>;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const ProtocolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (defaultState) => {
     try {
       if (typeof window !== 'undefined') {
         const stored = localStorage.getItem(STORAGE_KEY);
         if (stored) {
           const parsed = JSON.parse(stored);
           if (parsed.version === defaultState.version) {
             return parsed;
           }
         }
       }
     } catch (e) {
       console.error("Failed to load state", e);
     }
     return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <ProtocolContext.Provider value={{ state, dispatch }}>
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (context === undefined) {
    throw new Error('useProtocol must be used within a ProtocolProvider');
  }
  return context;
};