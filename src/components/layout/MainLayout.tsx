import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/ui/header';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
