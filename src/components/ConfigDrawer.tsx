import React, { useState } from "react";
import { X, Save, Settings, Phone, MessageSquareCode, User, HelpCircle } from "lucide-react";
import { AppSettings } from "../types";

interface ConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [waNum, setWaNum] = useState(settings.whatsappNumber);
  const [hostName, setHostName] = useState(settings.customHostName);
  const [msgTemplate, setMsgTemplate] = useState(settings.customMessageTemplate);
  const [vipTemplate, setVipTemplate] = useState(settings.vipComboTemplate);
  const [showNotification, setShowNotification] = useState(false);

  // Sync state if settings prop changes
  React.useEffect(() => {
    if (isOpen) {
      setWaNum(settings.whatsappNumber);
      setHostName(settings.customHostName);
      setMsgTemplate(settings.customMessageTemplate);
      setVipTemplate(settings.vipComboTemplate);
    }
  }, [isOpen, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean phone number (strip spaces, symbols, keep only digits)
    const sanitizedPhone = waNum.replace(/[^0-9]/g, "");

    onSave({
      whatsappNumber: sanitizedPhone,
      customHostName: hostName,
      customMessageTemplate: msgTemplate,
      vipComboTemplate: vipTemplate,
      enableSoundEffects: settings.enableSoundEffects,
    });

    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <h2 className="text-md font-extrabold uppercase text-white tracking-wider">
                ADMIN CONTROL PANEL (CMS)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-1.5 rounded-lg bg-slate-850 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" /> Usage Instructions
              </span>
              <p className="text-[11.5px] text-slate-300 leading-relaxed mt-1">
                You can easily change the redirect WhatsApp recipient configuration dynamically here. Your custom templates are fully stored inside the local storage without touching the core source files.
              </p>
            </div>

            {/* Input 1: WhatsApp Contact */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-500" /> Redirect WhatsApp Contact Number
              </label>
              <input
                type="text"
                value={waNum}
                onChange={(e) => setWaNum(e.target.value)}
                placeholder="Example: 255718009830"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                * Input digits with country code format only (no + prefix). E.g. Tanzanian number starting with 255
              </span>
            </div>

            {/* Input 2: Host Presentation Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-500" /> Presentess Hostess Name
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Example: Amina"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Input 3: Preset Message spin win */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <MessageSquareCode className="w-4 h-4 text-amber-500" /> Winning Ticket Auto-Fill Message
              </label>
              <textarea
                value={msgTemplate}
                onChange={(e) => setMsgTemplate(e.target.value)}
                rows={3}
                placeholder="Message that gets loaded automatically upon winner redirection..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-sans leading-relaxed"
                required
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                * Note: '{`{ODDS}`}' will be automatically substituted by the earned slice name inside the App redirector logic.
              </span>
            </div>

            {/* Input 4: VIP Combo Booking Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <MessageSquareCode className="w-4 h-4 text-amber-500" /> VIP Combo Request Template
              </label>
              <textarea
                value={vipTemplate}
                onChange={(e) => setVipTemplate(e.target.value)}
                rows={3}
                placeholder="Template used when users inquire about custom VIP match tickets..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors font-sans leading-relaxed"
                required
              />
            </div>
          </form>

          {/* Footer Save Button */}
          <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-3">
            {showNotification && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-xs font-bold rounded-lg animate-pulse">
                ✓ Configurations saved successfully!
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
