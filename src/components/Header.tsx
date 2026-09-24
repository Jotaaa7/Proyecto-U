import React from 'react';
import { Store, Calendar, Search, ArrowLeftRight } from 'lucide-react';

interface HeaderProps {
  onOpenMovementModal: () => void;
  onSearchFocus?: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMovementModal, 
  searchValue, 
  onSearchChange 
}) => {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-xl z-40 flex items-center justify-between px-6 border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Left: Location & Date */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#eff4ff] hover:bg-[#e5eeff] px-3 py-1.5 rounded-lg text-[#0b1c30] cursor-pointer transition-colors border border-[#dce9ff]/60">
          <Store className="w-4 h-4 text-[#006194]" />
          <span className="text-xs font-bold">Taller Central - Box 1</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[#515f74] text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#707881]" />
          <span>Hoy, 24 Octubre 2024</span>
        </div>
      </div>

      {/* Right: Search, Action, Profile */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#707881] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar repuestos..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 md:w-64 h-9 pl-9 pr-14 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder-[#707881] border border-transparent focus:border-[#93ccff] focus:bg-white focus:outline-none transition-all"
          />
          <kbd className="absolute right-2 text-[10px] font-bold text-[#515f74] bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#e5eeff] pointer-events-none">
            Ctrl + K
          </kbd>
        </div>

        <button
          onClick={onOpenMovementModal}
          className="flex items-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm shadow-[#006194]/25 transition-all"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>+ Entrada / Salida</span>
        </button>

        <img
          alt="Carlos Mendoza"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e5eeff]"
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
        />
      </div>
    </header>
  );
};
