import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { storageService } from '../../services/storage/storageService';

interface PermissionsScreenProps {
  onBack: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onBack }) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    storageService.getPermissions()
  );

  const permissionItems = [
    {
      title: 'Microphone',
      description: 'Required for voice conversations and wake word recognition.',
    },
    {
      title: 'Notifications',
      description: 'Required for reminders and scheduled alarm tasks.',
    },
    {
      title: 'Contacts and phone',
      description: 'Required when Priya looks up a contact or places a call.',
    },
    {
      title: 'Location',
      description: 'Required for local weather, location, and navigation commands.',
    },
    {
      title: 'Calendar',
      description: 'Required for schedule and calendar actions.',
    },
  ];

  const handleToggle = async (title: string) => {
    if (title === 'Microphone') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        storageService.setPermission(title, true);
        setPermissions({ ...permissions, [title]: true });
        return;
      } catch {
        // user denied or unsupported
      }
    }

    if (title === 'Notifications' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        const granted = res === 'granted';
        storageService.setPermission(title, granted);
        setPermissions({ ...permissions, [title]: granted });
        return;
      } catch {
        // continue
      }
    }

    if (title === 'Location' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          storageService.setPermission(title, true);
          setPermissions({ ...permissions, [title]: true });
        },
        () => {
          storageService.setPermission(title, false);
          setPermissions({ ...permissions, [title]: false });
        }
      );
      return;
    }

    // Default simulation grant
    const nextVal = !permissions[title];
    storageService.setPermission(title, nextVal);
    setPermissions({ ...permissions, [title]: nextVal });
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-[#E2E8F0] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Permissions</h2>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-white">Required app permissions</h3>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Grant only the permissions needed for the features you use. Browser prompts will verify real hardware access where applicable.
          </p>
        </div>

        <div className="space-y-3">
          {permissionItems.map((item) => {
            const isGranted = Boolean(permissions[item.title]);
            return (
              <div
                key={item.title}
                className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3"
              >
                <div>
                  <h4 className="text-base font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleToggle(item.title)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isGranted
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isGranted ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Granted</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Grant permission</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
