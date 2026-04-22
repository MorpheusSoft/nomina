"use client";

import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from '../contexts/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const value = {
    ripple: true,
  };

  return (
    <PrimeReactProvider value={value}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrimeReactProvider>
  );
}
