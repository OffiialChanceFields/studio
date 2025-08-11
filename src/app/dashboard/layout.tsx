
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarProvider
} from '@/components/ui/sidebar';
import { LayoutDashboard, Settings, FileCode } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarItem icon={<LayoutDashboard size={20} />} href="/dashboard">Dashboard</SidebarItem>
                    <SidebarItem icon={<FileCode size={20} />} href="/dashboard/generator">Generator</SidebarItem>
                    <SidebarItem icon={<Settings size={20} />} href="/settings">Settings</SidebarItem>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
