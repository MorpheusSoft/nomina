"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // Si no es el admin root, sacarlo de aquí
      if (!user || user.email !== 'admin@nebulapayrolls.com') {
        router.replace('/');
      }
    }
  }, [user, loading, router, mounted]);

  if (loading || !mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Verificando acceso raíz...</div>;
  }

  // Double check before rendering
  if (!user || user.email !== 'admin@nebulapayrolls.com') {
    return null;
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
