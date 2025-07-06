import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface RefreshContextType {
  refreshing: boolean;
  refreshAll: () => Promise<void>;
  registerFetcher: (fetcher: () => Promise<void>) => void;
  unregisterFetcher: (fetcher: () => Promise<void>) => void;
}

const RefreshContext = createContext<RefreshContextType>({
  refreshing: false,
  refreshAll: async () => {},
  registerFetcher: () => {},
  unregisterFetcher: () => {},
});

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshing, setRefreshing] = useState(false);
  const fetchersRef = useRef<(() => Promise<void>)[]>([]);

  const registerFetcher = useCallback((fetcher: () => Promise<void>) => {
    if (!fetchersRef.current.includes(fetcher)) {
      fetchersRef.current.push(fetcher);
    }
  }, []);

  const unregisterFetcher = useCallback((fetcher: () => Promise<void>) => {
    fetchersRef.current = fetchersRef.current.filter(fn => fn !== fetcher);
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(fetchersRef.current.map(fn => fn()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshing, refreshAll, registerFetcher, unregisterFetcher }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext); 