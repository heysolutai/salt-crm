import { useState, useEffect } from 'react';

interface UserProfile {
  avatarUrl: string | null;
}

interface CompanySettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
}

const USER_PROFILE_KEY = 'salt_user_profile';
const COMPANY_SETTINGS_KEY = 'salt_company_settings';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    return saved ? JSON.parse(saved) : { avatarUrl: null };
  });

  useEffect(() => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    // Dispatch custom event so header can react
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: profile }));
  }, [profile]);

  const updateAvatar = (avatarUrl: string | null) => {
    setProfile(prev => ({ ...prev, avatarUrl }));
  };

  return { profile, updateAvatar };
};

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(COMPANY_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      name: 'SALT Demo Company',
      logoUrl: null,
      primaryColor: '#5B8DEF'
    };
  });

  useEffect(() => {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('companySettingsUpdated', { detail: settings }));
  }, [settings]);

  const updateName = (name: string) => {
    setSettings(prev => ({ ...prev, name }));
  };

  const updateLogo = (logoUrl: string | null) => {
    setSettings(prev => ({ ...prev, logoUrl }));
  };

  const updatePrimaryColor = (primaryColor: string) => {
    setSettings(prev => ({ ...prev, primaryColor }));
  };

  return { settings, updateName, updateLogo, updatePrimaryColor };
};

// Helper to get profile from localStorage (for components that just need to read)
export const getUserAvatarUrl = (): string | null => {
  const saved = localStorage.getItem(USER_PROFILE_KEY);
  if (saved) {
    const profile = JSON.parse(saved);
    return profile.avatarUrl;
  }
  return null;
};

// Helper to get company settings from localStorage (for components that just need to read)
export const getCompanySettings = (): CompanySettings => {
  const saved = localStorage.getItem(COMPANY_SETTINGS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    name: 'SALT AI & Automation',
    logoUrl: null,
    primaryColor: '#5B8DEF'
  };
};
