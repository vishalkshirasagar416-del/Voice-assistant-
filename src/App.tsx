import React, { useState } from 'react';
import { PriyaScreen } from './types';
import { SplashScreen } from './components/screens/SplashScreen';
import { MainAssistantScreen } from './components/screens/MainAssistantScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AIProviderSetupScreen } from './components/screens/AIProviderSetupScreen';
import { VoiceSettingsScreen } from './components/screens/VoiceSettingsScreen';
import { MemoryScreen } from './components/screens/MemoryScreen';
import { PermissionsScreen } from './components/screens/PermissionsScreen';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<PriyaScreen>('splash');
  const [navHistory, setNavHistory] = useState<PriyaScreen[]>([]);

  const navigateTo = (screen: PriyaScreen) => {
    setNavHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory((old) => old.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('main_assistant');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-[#E2E8F0]">
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen('main_assistant')} />
      )}

      {currentScreen === 'main_assistant' && (
        <MainAssistantScreen
          onOpenSettings={() => navigateTo('settings')}
          onNavigateToPermissions={() => navigateTo('permissions')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={handleBack}
          onNavigate={(screen) => navigateTo(screen)}
        />
      )}

      {currentScreen === 'ai_setup' && (
        <AIProviderSetupScreen
          onBack={handleBack}
          onComplete={handleBack}
          allowSkip={false}
        />
      )}

      {currentScreen === 'voice_settings' && (
        <VoiceSettingsScreen onBack={handleBack} />
      )}

      {currentScreen === 'memory' && (
        <MemoryScreen onBack={handleBack} />
      )}

      {currentScreen === 'permissions' && (
        <PermissionsScreen onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
