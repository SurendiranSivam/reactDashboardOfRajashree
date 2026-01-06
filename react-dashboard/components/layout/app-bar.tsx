'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Search,
    Settings,
    LogOut,
    User,
    ChevronDown,
    Menu,
    Users,
    Shield,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

export function AppBar() {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    // Get page title from pathname
    const getPageTitle = () => {
        const path = pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left Section - Page Title & Search */}
                <div className="flex items-center gap-6 flex-1">
                    {/* Page Title */}
                    <h1 className="text-2xl font-bold text-gray-900">
                        {getPageTitle()}
                    </h1>

                    {/* Search Bar */}
                    <div className="relative hidden md:flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search anything..."
                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Section - Actions & Profile */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition group">
                        <Bell className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {/* Settings */}
                    <Link href="/dashboard/settings">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition group">
                            <Settings className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition" />
                        </button>
                    </Link>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <span className="text-sm font-semibold text-white">RF</span>
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-semibold text-gray-900">Rajashree Fashion</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Rajashree Fashion</p>
                                    <p className="text-xs text-gray-500">admin@rajashreefashion.com</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/users">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Users Management</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/role-management">
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Role Management</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                    window.location.href = '/login';
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
