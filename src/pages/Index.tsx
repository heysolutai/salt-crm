import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import saltLogo from '@/assets/salt-logo.png';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem('salt_session');
    if (session) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative">
        <img 
          src={saltLogo} 
          alt="SALT Logo" 
          className="w-20 h-20 animate-pulse"
        />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    </div>
  );
};

export default Index;
