import React from 'react';
import { cn } from '../utils/cn';

interface AppLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  backgroundUrl?: string;
}

export function AppLayout({ 
  sidebar, 
  header, 
  children, 
  className,
  backgroundUrl = '/background.jpeg' 
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#030304] text-slate-200 overflow-hidden relative font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
      />

      {/* Dark Overlay gradient for readability and blending */}
      <div className="absolute inset-0 z-0 bg-[#030304]/60 backdrop-blur-sm"></div>

      {/* Background Atmospheric Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>

      {/* Sidebar */}
      {sidebar && (
        <div className="z-10 h-full flex flex-col justify-between shrink-0">
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col h-screen overflow-hidden z-10 relative", sidebar ? "ml-64" : "", className)}>
        {header && (
          <div className="shrink-0">
            {header}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
