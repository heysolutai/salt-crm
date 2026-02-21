import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

interface InlineNotificationContextType {
  notification: NotificationState;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideNotification: () => void;
}

const InlineNotificationContext = createContext<InlineNotificationContextType | undefined>(undefined);

export const InlineNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type, visible: true });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <InlineNotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </InlineNotificationContext.Provider>
  );
};

export const useInlineNotification = () => {
  const context = useContext(InlineNotificationContext);
  if (!context) {
    throw new Error('useInlineNotification must be used within InlineNotificationProvider');
  }
  return context;
};
