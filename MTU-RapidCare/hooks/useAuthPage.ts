import { useState } from 'react';

type TabType = 'login' | 'signup';

export function useAuthPage() {
  const [activeTab, setActiveTab] = useState<TabType>('login');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
} 