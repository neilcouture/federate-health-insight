import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../components/ThemeProvider';
import Layout from '../components/Layout';
import CleanRoomSetup from '../components/tabs/CleanRoomSetup';
import DataIngestion from '../components/tabs/DataIngestion';
import ExplorationDashboard from '../components/tabs/ExplorationDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CleanRoomSetup />;
      case 1:
        return <DataIngestion />;
      case 2:
        return <ExplorationDashboard />;
      default:
        return <CleanRoomSetup />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Layout activeTab={activeTab} onTabChange={handleTabChange}>
          {renderTabContent()}
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Index;
