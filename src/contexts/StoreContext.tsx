import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AppSettings {
  app_name: string;
  phone: string | null;
  email: string | null;
}

interface StoreContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  app_name: "نظام المجوهرات",
  phone: "",
  email: "",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      if (isDemo) {
        const stored = localStorage.getItem('app_settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } else {
        // In production, you would fetch from Supabase
        // For now, use localStorage as fallback
        const stored = localStorage.getItem('app_settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [isDemo]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (isDemo) {
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
    } else {
      // In production, update Supabase
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
    }
  };

  return (
    <StoreContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
