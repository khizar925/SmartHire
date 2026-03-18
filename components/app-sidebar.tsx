'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    BrainCircuit,
    User,
    Sparkles,
    ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';

interface NavLink {
    label: string;
    icon: React.ElementType;
    href?: string;
    onClick?: () => void;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    role: 'candidate' | 'recruiter'; // Changed to required
    onOpenProfile: () => void; // Changed to required
    onOpenScore: () => void; // Added
}

export function AppSidebar({ role, onOpenProfile, onOpenScore, ...props }: AppSidebarProps) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar(); // Added

    // Removed candidateLinks and recruiterLinks, replaced with dynamic links
    const links: NavLink[] = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        ...(role === 'candidate' ? [
      { label: 'My Applications', icon: ClipboardList, href: '/dashboard/applications' } as NavLink,
    ] : []),
        {
            label: 'Score Resume',
            icon: Sparkles,
            onClick: () => {
                setOpenMobile(false);
                onOpenScore();
            }
        },
        {
            label: 'Manage Profile',
            icon: User,
            onClick: () => {
                setOpenMobile(false); // Added
                onOpenProfile();
            }
        },
    ];

    // Removed the old `links` assignment

    // The Sidebar component manages its own collapsible state and applies `data-collapsible="icon"`
    // to its root element when collapsed. We can use CSS to hide/show elements based on this.
    // The `!isCollapsed` check in the provided snippet is likely a simplification or
    // assumes `isCollapsed` is passed down. For this component, we'll rely on CSS.

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border shadow-sm">
            <SidebarHeader className="h-20 flex flex-row items-center px-6 transition-all duration-300 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center overflow-hidden">
                <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-sidebar-primary/20 shrink-0 group-data-[collapsible=icon]:p-2.5">
                        <BrainCircuit className="h-6 w-6 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
                    </div>
                    {/* Using group-data-[collapsible=icon]:hidden to hide when sidebar is collapsed */}
                    <span className="font-bold text-xl tracking-tight text-slate-900 font-serif animate-fade-in truncate group-data-[collapsible=icon]:hidden">
                        Smart Hire
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 pt-6 group-data-[collapsible=icon]:px-0">
                <SidebarGroup className="group-data-[collapsible=icon]:px-1">
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
                        Overview
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2 md:gap-3 group-data-[collapsible=icon]:gap-4">
                            {links.map((link) => {
                                const isActive = link.href ? pathname === link.href : false;

                                return (
                                    <SidebarMenuItem key={link.label} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                                        <SidebarMenuButton
                                            asChild={!!link.href}
                                            isActive={isActive}
                                            tooltip={link.label}
                                            onClick={link.onClick}
                                            className={`
                        h-11 rounded-xl transition-all duration-200
                        ${isActive
                                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25'
                                                    : 'text-slate-600 hover:bg-sidebar-accent hover:text-sidebar-primary group-hover/button:translate-x-1'
                                                }
                        group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl
                      `}
                                        >
                                            {link.href ? (
                                                <Link href={link.href} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                                                    <link.icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                    <span className="font-medium text-sm tracking-wide font-sans group-data-[collapsible=icon]:hidden">{link.label}</span>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                                                    <link.icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                    <span className="font-medium text-sm tracking-wide font-sans group-data-[collapsible=icon]:hidden">{link.label}</span>
                                                </div>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 p-6 bg-slate-50/50 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <div className="flex flex-col items-center gap-2 group-data-[collapsible=icon]:hidden animate-fade-in">
                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.15em] font-bold">
                        Powered by Smart Hire
                    </p>
                </div>
                <div className="hidden group-data-[collapsible=icon]:block">
                    <div className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse" />
                </div>
            </SidebarFooter>
            <SidebarRail className="hover:after:bg-sidebar-primary/20" />
        </Sidebar>
    );
}
