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
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
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
