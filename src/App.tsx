/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SimulationView } from './components/SimulationView';
import { PurchasesBudgetView } from './components/PurchasesBudgetView';
import { BackendDevHubView } from './components/BackendDevHubView';
import { MovementModal } from './components/modals/MovementModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { PromoPackageModal } from './components/modals/PromoPackageModal';
import { OrderConfirmationModal } from './components/modals/OrderConfirmationModal';
import { SuggestedPurchaseItem } from './types/inventory';
import { Check } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchValue, setSearchValue] = useState<string>('');

  // Modals
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementRepuestoId, setMovementRepuestoId] = useState<number | undefined>(undefined);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderTotalCOP, setOrderTotalCOP] = useState(0);
  const [orderItems, setOrderItems] = useState<SuggestedPurchaseItem[]>([]);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenMovementModal = (repuestoId?: number) => {
    setMovementRepuestoId(repuestoId);
    setIsMovementModalOpen(true);
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

      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenMovementModal={() => handleOpenMovementModal()}
      />

      {/* Main App Container */}
      <div className="pl-72 w-full flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMovementModal={() => handleOpenMovementModal()}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />

        {/* Dynamic Main View */}
        <main className="w-full pt-20 px-8 pb-12 flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenMovementModal={() => handleOpenMovementModal()}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
            />
          )}

          {currentTab === 'inventario' && (
            <InventoryView
              onOpenAddModal={() => setIsAddProductModalOpen(true)}
              onOpenMovementModal={(id) => handleOpenMovementModal(id)}
            />
          )}

          {currentTab === 'simulacion-pronosticos' && (
            <SimulationView
              onNavigateToPurchases={() => setCurrentTab('compras-presupuesto')}
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
        onClose={() => setIsMovementModalOpen(false)}
        selectedRepuestoId={movementRepuestoId}
        onSuccess={(msg) => triggerToast(msg)}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
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
    </div>
  );
}
