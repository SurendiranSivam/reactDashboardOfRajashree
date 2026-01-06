'use client';

import { useState } from 'react';
import { useBanners } from '@/lib/hooks/use-banners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Search, Image as ImageIcon, Plus } from 'lucide-react';

export default function BannersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: banners = [], isLoading } = useBanners();

    const filteredBanners = banners.filter((banner) =>
        banner.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeBanners = banners.filter(b => b.is_active).length;

    const columns = [
        {
            key: 'banner_id',
            label: 'ID',
            render: (banner: any) => (
                <span className="font-mono text-xs text-gray-600">{banner.banner_id.slice(0, 8)}</span>
            ),
        },
        {
            key: 'title',
            label: 'Banner',
            render: (banner: any) => (
                <div className="flex items-center gap-3">
                    {banner.image_url && (
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-16 h-10 rounded object-cover"
                        />
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{banner.title}</p>
                        {banner.subtitle && (
                            <p className="text-sm text-gray-500">{banner.subtitle}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'link_url',
            label: 'Link',
            render: (banner: any) => (
                <p className="text-sm text-blue-600 truncate max-w-xs">{banner.link_url || '-'}</p>
            ),
        },
        {
            key: 'display_order',
            label: 'Order',
            render: (banner: any) => (
                <Badge variant="outline" className="bg-gray-50">
                    {banner.display_order}
                </Badge>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (banner: any) => (
                <Badge
                    variant="outline"
                    className={
                        banner.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }
                >
                    {banner.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Banners</h2>
                    <p className="text-gray-600 mt-1">Manage promotional banners ({banners.length} total)</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Plus className="h-4 w-4" />
                    Add Banner
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Banners</p>
                                <p className="text-2xl font-bold mt-1">{banners.length}</p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <ImageIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold mt-1">{activeBanners}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <ImageIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold mt-1">{banners.length - activeBanners}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <ImageIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Banners Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Banners</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search banners..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={filteredBanners}
                        columns={columns}
                        getRowId={(banner) => banner.banner_id}
                        exportFilename="banners"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
