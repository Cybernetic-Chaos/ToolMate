import { AdminNav } from '@/components/AdminNav';
import React from 'react';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>){
    
    return (
        <div>
            <AdminNav/>
            {children}
        </div>
    );
}