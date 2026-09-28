import React from 'react';
import { Store, Calendar, Search, ArrowLeftRight, Menu, Database } from 'lucide-react';

interface HeaderProps {
  onOpenMovementModal: () => void;
  onOpenMobileMenu?: () => void;
  onOpenConfigModal?: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMovementModal, 
  onOpenMobileMenu,
  onOpenConfigModal,
  searchValue, 
  onSearchChange 
}) => {
  const todayFormatted = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl z-30 flex items-center justify-between px-4 sm:px-6 border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Left: Mobile hamburger & Location/Date */}
      <div className="flex items-center gap-2 sm:gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-[#515f74] hover:text-[#0b1c30] hover:bg-[#eff4ff] lg:hidden transition-colors"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 bg-[#eff4ff] hover:bg-[#e5eeff] px-2.5 sm:px-3 py-1.5 rounded-lg text-[#0b1c30] cursor-pointer transition-colors border border-[#dce9ff]/60">
          <Store className="w-4 h-4 text-[#006194]" />
          <span className="text-xs font-bold truncate max-w-[130px] sm:max-w-none">Taller Central - Box 1</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[#515f74] text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#707881]" />
          <span className="capitalize">{todayFormatted}</span>
        </div>

        {/* Database Live Status Indicator */}
        {onOpenConfigModal && (
          <button
            onClick={onOpenConfigModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] text-[11px] font-semibold border border-[#a7f3d0] transition-colors"
            title="Base de datos configurada en Render"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>PostgreSQL Render</span>
          </button>
        )}
      </div>

      {/* Right: Search, Action, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#707881] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar repuestos..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-32 sm:w-48 md:w-64 h-9 pl-9 pr-10 sm:pr-14 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder-[#707881] border border-transparent focus:border-[#93ccff] focus:bg-white focus:outline-none transition-all"
          />
          <kbd className="hidden sm:inline absolute right-2 text-[10px] font-bold text-[#515f74] bg-white px-1.5 py-0.5 rounded shadow-xs border border-[#e5eeff] pointer-events-none">
            Ctrl + K
          </kbd>
        </div>

        <button
          onClick={onOpenMovementModal}
          className="flex items-center gap-1.5 bg-[#006194] hover:bg-[#007bb9] active:scale-95 text-white px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm shadow-[#006194]/25 transition-all shrink-0"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Entrada / Salida</span>
          <span className="sm:hidden font-bold">+ Movimiento</span>
        </button>

        <img
          alt="Carlos Mendoza"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e5eeff] shrink-0"
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
        />
      </div>
    </header>
  );
};
