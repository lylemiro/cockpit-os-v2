import React, { useState } from 'react';
import { ArenaProvider, useArena } from './context/ArenaContext.jsx';
import { TopSystemBar } from './components/TopSystemBar.jsx';
import { DesktopIconGrid } from './components/DesktopIconGrid.jsx';
import { CenterHeroCanvas } from './components/CenterHeroCanvas.jsx';
import { TelemetrySidebar } from './components/TelemetrySidebar.jsx';
import { BottomTaskbar } from './components/BottomTaskbar.jsx';
import { ModuleWindowModal } from './components/ModuleWindowModal.jsx';
import { BootAndLoginScreen } from './components/BootAndLoginScreen.jsx';
import { AltTabSwitcher } from './components/AltTabSwitcher.jsx';
import { DesktopContextMenu } from './components/DesktopContextMenu.jsx';
import { ToastContainer } from './components/CentralizedFeedbackStates.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

function CockpitDesktopInner() {
  const {
    bootCompleted,
    authenticatedOperator,
    wallpaper,
    toasts,
    dismissToast
  } = useArena();
  const [searchQuery, setSearchQuery] = useState('');

  if (!bootCompleted || !authenticatedOperator) {
    return (
      <>
        <BootAndLoginScreen />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className={`cockpit-os-shell wallpaper-${wallpaper || 'luxury_wavy'}`}>
      <TopSystemBar />

      <div className="desktop-workspace">
        <DesktopIconGrid searchQuery={searchQuery} />
        <CenterHeroCanvas />
        <TelemetrySidebar />
      </div>

      <BottomTaskbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ModuleWindowModal />

      {/* Global Windows Desktop Features */}
      <AltTabSwitcher />
      <DesktopContextMenu />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ArenaProvider>
        <CockpitDesktopInner />
      </ArenaProvider>
    </ErrorBoundary>
  );
}

