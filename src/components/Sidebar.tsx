import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  TrendingUp, 
  WalletCards, 
  Terminal, 
  HelpCircle, 
  ChevronDown,
  Wrench,
  Settings,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenMovementModal: () => void;
  onOpenConfigModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange,
  onOpenConfigModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Boxes },
    { id: 'simulacion-pronosticos', label: 'Simulación / Pronósticos', icon: TrendingUp },
    { id: 'compras-presupuesto', label: 'Compras / Presupuesto', icon: WalletCards },
    { id: 'backend-arquitectura', label: 'Backend & Data Science Hub', icon: Terminal, badge: 'Python / SQL' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between p-4 border-r border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
      <div className="flex flex-col gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006194] to-[#007bb9] flex items-center justify-center text-white shadow-md shadow-[#006194]/20 relative overflow-hidden">
            <Wrench className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-white/10 opacity-30 transform -rotate-45 translate-x-1" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#0b1c30] tracking-tight leading-none">MotoGestión</span>
            <span className="text-xs text-[#515f74] font-medium mt-1">Taller Mecánico Multimarca</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left text-sm font-medium ${
                  isActive
                    ? 'bg-[#d5e3fd] text-[#0d1c2f] font-semibold shadow-xs'
                    : 'text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#006194]' : 'text-[#707881]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#006194] text-white' : 'bg-[#e5eeff] text-[#006194]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile, Support & Database Config */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[#e5eeff]">
        {/* Database & Render Config Button */}
        <button
          onClick={onOpenConfigModal}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors text-xs font-bold border border-[#dce9ff]/80"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#006194]" />
            <span>Configurar Database</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#00855b] animate-pulse" title="Conectado a Render" />
        </button>

        <button 
          onClick={() => onTabChange('backend-arquitectura')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[#515f74] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors text-xs font-semibold"
        >
          <HelpCircle className="w-4 h-4 text-[#707881]" />
          <span>Documentación & Tesis UCC</span>
        </button>

        <div className="flex items-center gap-3 p-2 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60">
          <img
            alt="Carlos Mendoza"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-[#0b1c30] truncate">Carlos Mendoza</span>
            <span className="text-[11px] text-[#515f74] truncate">Jefe de Taller</span>
          </div>
          <button className="text-[#515f74] hover:text-[#0b1c30] p-1">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
