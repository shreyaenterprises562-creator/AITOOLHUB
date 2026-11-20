'use client';

import React from 'react';
import { RiderProvider } from '../../context/RiderContext';

export default function RiderRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RiderProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-[#FFD000] selection:text-black">
        {children}
      </div>
    </RiderProvider>
  );
}
