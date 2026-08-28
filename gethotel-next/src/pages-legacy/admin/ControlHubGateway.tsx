'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminLogin from '@/pages-legacy/AdminLogin';
import SuperAdminDashboard from '@/pages-legacy/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

import AdminLayout from '@/components/layout/AdminLayout';

export default function ControlHubGateway() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!user || user.role !== 'super_admin') {
        return <AdminLogin />;
    }

    return (
        <AdminLayout>
            <SuperAdminDashboard />
        </AdminLayout>
    );
}
