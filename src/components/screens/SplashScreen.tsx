import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0B1020] via-[#111827] to-[#1F2940] transition-opacity duration-700 select-none">
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-700 transform ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#38BDF8] flex items-center justify-center shadow-xl shadow-purple-900/40 border border-white/20">
          <span className="text-white text-5xl font-bold font-sans">P</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-wide">Priya</h1>
        <p className="text-slate-400 text-sm tracking-wider">Your voice companion</p>
      </div>
    </div>
  );
};
