'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
    LayoutDashboard, MessageSquare, ShoppingCart, Users, Package,
    Store, Truck, RotateCcw, Layers, ShoppingBag,
    Image as ImageIcon, AlertCircle, Ticket, Users2,
    Megaphone, ChevronDown, Sparkles, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Vendors', href: '/dashboard/vendors', icon: Store },
    { name: 'Shipments', href: '/dashboard/shipments', icon: Truck },
    { name: 'Queries', href: '/dashboard/queries', icon: MessageSquare },
    { name: 'Tickets', href: '/dashboard/tickets', icon: AlertCircle },
    { name: 'Returns', href: '/dashboard/returns', icon: RotateCcw },
    { name: 'Combos', href: '/dashboard/combos', icon: Layers },
    { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
    { name: 'Banners', href: '/dashboard/banners', icon: ImageIcon },
];

const marketingNav = {
    name: 'Marketing & Growth',
    icon: Megaphone,
    items: [
        { name: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
        { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users2 },
        { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
    ],
};

interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [marketingOpen, setMarketingOpen] = useState(!isCollapsed);
    const [logoHover, setLogoHover] = useState(false);
    const isMarketingActive = marketingNav.items.some(item => pathname === item.href);

    return (
        <div className={cn(
            'flex h-full flex-col relative overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-20' : 'w-72'
        )}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.15),transparent_50%)]" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
                <div className={cn(
                    'flex items-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-all duration-300',
                    isCollapsed ? 'h-20 justify-center px-2' : 'h-28 justify-center px-6'
                )}>
                    <div
                        className={cn(
                            'flex items-center transition-all duration-500',
                            isCollapsed ? 'flex-col gap-0' : 'flex-col gap-3'
                        )}
                        onMouseEnter={() => setLogoHover(true)}
                        onMouseLeave={() => setLogoHover(false)}
                    >
                        <div className={cn(
                            'flex-shrink-0 bg-white rounded-2xl p-2 flex items-center justify-center transition-all duration-500 shadow-2xl',
                            isCollapsed ? 'w-12 h-12 rounded-xl' : 'w-16 h-16 rounded-2xl',
                            logoHover && 'scale-110 rotate-6 shadow-purple-500/50'
                        )}>
                            <div className="relative w-full h-full">
                                <img
                                    src="/logo.png"
                                    alt="Rajashree Fashion"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.parentElement) {
                                            e.currentTarget.parentElement.innerHTML = '<span class="text-purple-600 font-bold text-2xl">RF</span>';
                                        }
                                    }}
                                />
                                {logoHover && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-xl" />
                                )}
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-white leading-tight tracking-tight">
                                    Rajashree Fashion
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Sparkles className="h-3 w-3 text-purple-400" />
                                    <span className="text-xs text-purple-300/80 font-medium">Admin Dashboard</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className={cn(
                                'absolute top-6 transition-all duration-300 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white',
                                isCollapsed ? 'right-2' : 'right-4'
                            )}
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden',
                                            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                                            isActive
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        {!isActive && (
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                        )}

                                        <item.icon className={cn(
                                            'h-5 w-5 transition-transform duration-300 flex-shrink-0',
                                            isActive && 'scale-110',
                                            !isActive && 'group-hover:scale-110'
                                        )} />

                                        {!isCollapsed && (
                                            <>
                                                <span className="relative z-10">{item.name}</span>
                                                {isActive && (
                                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                )}
                                            </>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}

                        {!isCollapsed && (
                            <li className="pt-4 pb-2">
                                <div className="flex items-center gap-2 px-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                            </li>
                        )}

                        <li>
                            {isCollapsed ? (
                                <Link
                                    href="/dashboard/coupons"
                                    className={cn(
                                        'group relative flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                                        isMarketingActive
                                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                                    )}
                                    title="Marketing & Growth"
                                >
                                    <marketingNav.icon className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setMarketingOpen(!marketingOpen)}
                                        className={cn(
                                            'group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                                            isMarketingActive
                                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {!isMarketingActive && (
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                        )}

                                        <div className="flex items-center gap-3 relative z-10">
                                            <marketingNav.icon className={cn(
                                                'h-5 w-5 transition-transform duration-300',
                                                isMarketingActive && 'scale-110',
                                                !isMarketingActive && 'group-hover:scale-110'
                                            )} />
                                            {marketingNav.name}
                                        </div>
                                        <ChevronDown className={cn(
                                            'h-4 w-4 transition-transform duration-300 relative z-10',
                                            !marketingOpen && '-rotate-90'
                                        )} />
                                    </button>

                                    <div className={cn(
                                        'overflow-hidden transition-all duration-300 ease-in-out',
                                        marketingOpen ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
                                    )}>
                                        <ul className="space-y-1 ml-3 pl-3 border-l border-white/10">
                                            {marketingNav.items.map((subItem) => {
                                                const isActive = pathname === subItem.href;
                                                return (
                                                    <li key={subItem.name}>
                                                        <Link
                                                            href={subItem.href}
                                                            className={cn(
                                                                'group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative',
                                                                isActive
                                                                    ? 'bg-purple-500/20 text-purple-200 border-l-2 border-purple-400'
                                                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
                                                            )}
                                                        >
                                                            <subItem.icon className={cn(
                                                                'h-4 w-4 transition-transform duration-200',
                                                                isActive && 'scale-110'
                                                            )} />
                                                            {subItem.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </li>
                    </ul>
                </nav>

                <div className="border-t border-white/10 p-4 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
                    {!isCollapsed && (
                        <div className="text-center">
                            <p className="text-xs text-slate-400">© 2025 Rajashree Fashion</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                <span>Admin Dashboard</span>
                                <span className="inline-block w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                                <span className="text-purple-400 font-medium">v2.0</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}