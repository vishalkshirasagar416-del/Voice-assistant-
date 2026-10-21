import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { MemoryRecord } from '../../types';
import { storageService } from '../../services/storage/storageService';

interface MemoryScreenProps {
  onBack: () => void;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({ onBack }) => {
  const [memories, setMemories] = useState<MemoryRecord[]>(() => storageService.getMemories());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<MemoryRecord['type']>('GENERAL');

  const handleDelete = (id: string) => {
    storageService.deleteMemory(id);
    setMemories(storageService.getMemories());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all stored memories?')) {
      storageService.clearAllMemories();
      setMemories([]);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    storageService.addMemory(newKey.trim(), newValue.trim(), newType);
    setMemories(storageService.getMemories());
    setNewKey('');
    setNewValue('');
    setShowAddModal(false);
  };

  const formatDate = (epochMillis: number) => {
    return new Date(epochMillis).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-[#E2E8F0] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">Memory</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          {memories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-950/20"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Stored memories</h3>
          <span className="text-xs text-slate-400">{memories.length} records</span>
        </div>

        {memories.length === 0 ? (
          <div className="p-8 text-center bg-[#111827] rounded-2xl border border-slate-800/80">
            <p className="text-slate-400 text-sm">No memories stored yet.</p>
            <p className="text-slate-500 text-xs mt-1">
              Ask Priya to remember facts, preferences, or study notes, or click Add.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{mem.key}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">
                    {mem.type}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{mem.value}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Created: {formatDate(mem.createdAt)}</span>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Add New Memory</h3>
            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Key / Topic</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. favorite_color, goal"
                  className="w-full bg-[#070B16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Value / Content</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. Likes lavender and deep focus soundscapes"
                  className="w-full bg-[#070B16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 resize-none h-20"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MemoryRecord['type'])}
                  className="w-full bg-[#070B16] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="PREFERENCE">PREFERENCE</option>
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="STUDY">STUDY</option>
                  <option value="SYSTEM">SYSTEM</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
