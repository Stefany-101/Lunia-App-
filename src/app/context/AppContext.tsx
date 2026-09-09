import { createContext, useContext, useState, ReactNode } from 'react';

type ProfileType = 'A' | 'B' | 'C' | 'D';
export type AvatarType = 'moon' | 'star' | 'nebula' | 'comet' | 'galaxy';

interface AppState {
  zenMode: boolean;
  toggleZenMode: () => void;
  devMode: boolean;
  toggleDevMode: () => void;
  profile: ProfileType;
  setProfile: (p: ProfileType) => void;
  isPremium: boolean;
  setPremium: (p: boolean) => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  stressLevel: number;
  setStressLevel: (s: number) => void;
  cycleDay: number;
  setCycleDay: (d: number) => void;
  userName: string;
  setUserName: (n: string) => void;
  userAvatar: AvatarType;
  setUserAvatar: (a: AvatarType) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [zenMode, setZenMode] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [profile, setProfile] = useState<ProfileType>('C');
  const [isPremium, setPremium] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [stressLevel, setStressLevel] = useState(3);
  const [cycleDay, setCycleDay] = useState(1);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<AvatarType>('moon');

  return (
    <AppContext.Provider value={{
      zenMode, toggleZenMode: () => setZenMode(z => !z),
      devMode, toggleDevMode: () => setDevMode(d => !d),
      profile, setProfile,
      isPremium, setPremium,
      onboardingComplete, completeOnboarding: () => setOnboardingComplete(true),
      stressLevel, setStressLevel,
      cycleDay, setCycleDay,
      userName, setUserName,
      userAvatar, setUserAvatar,
    }}>
      <div className={`min-h-screen w-full cosmic-bg transition-all duration-700 ${zenMode ? 'zen-mode' : ''}`}>
        <div className="max-w-md mx-auto h-screen flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
