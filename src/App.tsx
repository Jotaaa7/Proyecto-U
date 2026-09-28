/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SimulationView } from './components/SimulationView';
import { PurchasesBudgetView } from './components/PurchasesBudgetView';
import { BackendDevHubView } from './components/BackendDevHubView';
import { MovementModal } from './components/modals/MovementModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { EditProductModal } from './components/modals/EditProductModal';
import { PromoPackageModal } from './components/modals/PromoPackageModal';
import { OrderConfirmationModal } from './components/modals/OrderConfirmationModal';
import { ConfigModal } from './components/modals/ConfigModal';
import { SuggestedPurchaseItem, Repuesto } from './types/inventory';
import { Check } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementRepuestoId, setMovementRepuestoId] = useState<number | undefined>(undefined);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [orderTotalCOP, setOrderTotalCOP] = useState(0);
  const [orderItems, setOrderItems] = useState<SuggestedPurchaseItem[]>([]);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keyboard Shortcuts (Ctrl+K for search, F2 for Movement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentTab('inventario');
        const input = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (input) input.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsMovementModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenMovementModal = (repuestoId?: number) => {
    setMovementRepuestoId(repuestoId);
    setIsMovementModalOpen(true);
  };

  const handleOpenEditModal = (repuesto: Repuesto) => {
    setEditingRepuesto(repuesto);
    setIsEditProductModalOpen(true);
  };

  const handleOpenApproveModal = (totalCOP: number, items: SuggestedPurchaseItem[]) => {
    setOrderTotalCOP(totalCOP);
    setOrderItems(items);
    setIsOrderModalOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (val.trim().length > 0 && currentTab !== 'inventario') {
      setCurrentTab('inventario');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0b1c30] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-[#3f4850] flex items-center gap-2.5 animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-[#00855b] flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar with Desktop & Mobile Responsive Drawer */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenMovementModal={() => handleOpenMovementModal()}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="pl-0 lg:pl-72 w-full flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMovementModal={() => handleOpenMovementModal()}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />

        {/* Dynamic Main View */}
        <main className="w-full pt-20 px-4 sm:px-6 lg:px-8 pb-12 flex-1 max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenMovementModal={() => handleOpenMovementModal()}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
              onShowToast={triggerToast}
            />
          )}

          {currentTab === 'inventario' && (
            <InventoryView
              onOpenAddModal={() => setIsAddProductModalOpen(true)}
              onOpenMovementModal={(id) => handleOpenMovementModal(id)}
              onEditRepuesto={handleOpenEditModal}
              initialSearch={searchValue}
            />
          )}

          {currentTab === 'simulacion-pronosticos' && (
            <SimulationView
              onNavigateToPurchases={() => setCurrentTab('compras-presupuesto')}
              onShowToast={triggerToast}
            />
          )}

          {currentTab === 'compras-presupuesto' && (
            <PurchasesBudgetView
              onOpenApproveModal={handleOpenApproveModal}
            />
          )}

          {currentTab === 'backend-arquitectura' && (
            <BackendDevHubView />
          )}
        </main>
      </div>

      {/* Modals */}
      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementRepuestoId(undefined);
        }}
        selectedRepuestoId={movementRepuestoId}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingRepuesto(null);
        }}
        repuesto={editingRepuesto}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <PromoPackageModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onApply={() => triggerToast('Paquete promocional publicado en vitrina y mostrador con éxito.')}
      />

      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        totalCOP={orderTotalCOP}
        items={orderItems}
        onConfirm={() => triggerToast(`Orden formal por $ ${orderTotalCOP.toLocaleString('es-CO')} COP aprobada y enviada a proveedores.`)}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaveSuccess={(msg) => triggerToast(msg)}
      />
    </div>
  );
}
