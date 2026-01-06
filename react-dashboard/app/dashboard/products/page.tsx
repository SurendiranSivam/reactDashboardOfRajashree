'use client';

import { useState, useEffect, useMemo } from 'react';
import { productsService } from '@/lib/services/products.service';
import type { ProductVariant } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, RefreshCw, FileDown, Package, AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProductFormDialog } from '@/components/products/product-form-dialog';

export default function ProductsPage() {
    // State for products (not variants)
    const [products, setProducts] = useState<any[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSizeOptions = [10, 20, 50, 100];

    // Selection state (matching Flutter)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Server-side pagination state
    const [serverPage, setServerPage] = useState(1);
    const [totalServerProducts, setTotalServerProducts] = useState(0);

    // Dialog states
    const [addProductDialog, setAddProductDialog] = useState(false);
    const [editProduct, setEditProduct] = useState<any | null>(null);
    const [imageDialog, setImageDialog] = useState<{ open: boolean; url: string | null }>({ open: false, url: null });
    const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; product: any | null }>({ open: false, product: null });

    // Helper functions to handle different field naming conventions
    const getStock = (v: ProductVariant) => v.stock_quantity ?? v.stock ?? 0;
    const getCostPrice = (v: ProductVariant) => v.cost_price ?? v.costPrice ?? v.regularPrice ?? 0;
    const getSalePrice = (v: ProductVariant) => v.saleprice ?? v.salePrice ?? 0;
    const getMRP = (v: ProductVariant) => v.mrp ?? getSalePrice(v);
    const getVariantName = (v: ProductVariant) => v.variant_name ?? v.name ?? '';



    // Fetch products using Edge Function with server-side pagination
    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            console.log(`📡 Fetching page ${serverPage} from Edge Function${searchQuery ? ` with search: "${searchQuery}"` : ''}...`);

            const result = await productsService.fetchProductsViaEdgeFunction(serverPage, 100, searchQuery);

            if (result.data && result.data.length > 0) {
                console.log(`✅ Edge Function returned ${result.data.length} products (Total: ${result.total})`);
                console.log('📦 First product raw data:', result.data[0]); // Debug: see actual fields
                setTotalServerProducts(result.total);

                // Map API response to TypeScript types (image_url → imageUrl, product_id → id)
                const productsWithCorrectProps = result.data.map((p: any) => ({
                    ...p,
                    id: p.id || p.product_id, // Map product_id to id
                    imageUrl: p.imageUrl || p.image_url, // Map snake_case to camelCase
                    isActive: p.isActive ?? p.is_Active ?? true, // Map is_Active
                    subcategoryName: p.subcategoryName || p.subcategory_name || '-', // Ensure subcategory name
                }));

                // Store full products
                setProducts(productsWithCorrectProps);

                // Also flatten variants for other operations
                const variantsFromProducts: ProductVariant[] = [];
                productsWithCorrectProps.forEach((product: any) => {
                    if (product.variants && product.variants.length > 0) {
                        product.variants.forEach((variant: any) => {
                            variantsFromProducts.push({
                                ...variant,
                                products: {
                                    product_id: product.id,
                                    product_name: product.name,
                                    sku_prefix: product.sku,
                                    category: product.subcategoryName || '',
                                    imageUrl: product.imageUrl,
                                }
                            } as ProductVariant);
                        });
                    }
                });
                setVariants(variantsFromProducts);

                // Reset client-side page to 0 when server page changes
                setCurrentPage(0);
            } else {
                console.log('⚠️ Edge Function returned no data');
            }

            setLoading(false);
        }
        loadProducts();
    }, [serverPage, searchQuery]);  // ✅ Re-fetch when search changes

    // Reset to page 1 when search query changes
    useEffect(() => {
        if (searchQuery) {
            setServerPage(1);
            setCurrentPage(0);
        }
    }, [searchQuery]);


    // No longer need client-side filtering - search is server-side now
    // But keep this for type consistency
    const filteredProducts = products;

    const paginatedProducts = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    // Export to Excel
    function exportToExcel() {
        // Get selected products
        const selectedProducts = filteredProducts.filter(p => selectedIds.has(p.id));

        // Flatten to variants for export
        const excelData: any[] = [];
        selectedProducts.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant: any) => {
                    excelData.push({
                        'Product Name': product.name,
                        'Product SKU': product.sku,
                        'Variant Name': variant.name || variant.variant_name || '-',
                        'Variant SKU': variant.sku,
                        'Category': product.subcategoryName || '-',
                        'Stock': variant.stock || variant.stock_quantity || 0,
                        'Regular Price': variant.regularPrice || variant.cost_price || 0,
                        'Sale Price': variant.salePrice || variant.saleprice || 0,
                        'Weight (g)': variant.weight || '-',
                        'Status': variant.isActive ? 'Active' : 'Inactive',
                    });
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Products_${timestamp}.xlsx`);
    }

    // Calculate stats from ALL products (server-side totals)
    const stats = useMemo(() => {
        // Use server totals for actual database counts
        const totalProducts = totalServerProducts || products.length;
        const totalVariants = variants.length; // From current batch
        const lowStock = variants.filter(v => getStock(v) < 10).length; // From current batch
        const totalValue = variants.reduce((sum, v) => sum + (getStock(v) * getSalePrice(v)), 0); // From current batch

        return { totalProducts, totalVariants, lowStock, totalValue };
    }, [totalServerProducts, products, variants]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Products & Inventory
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Showing {(serverPage - 1) * 100 + 1}-{Math.min(serverPage * 100, totalServerProducts)} of {totalServerProducts.toLocaleString()} Products
                    </p>
                    <p className="text-sm text-gray-500">
                        Page {serverPage} of {Math.ceil(totalServerProducts / 100)} · {stats.totalVariants} Variants loaded
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    {selectedIds.size > 0 && (
                        <Badge variant="secondary" className="text-sm">
                            {selectedIds.size} selected
                        </Badge>
                    )}
                    <Button
                        onClick={() => setAddProductDialog(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                    >
                        <Package className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                    <Button
                        onClick={exportToExcel}
                        variant="outline"
                        disabled={selectedIds.size === 0}
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Selected
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">Database Total</p>
                            </div>
                            <Package className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Variants Loaded</p>
                                <p className="text-2xl font-bold">{stats.totalVariants}</p>
                                <p className="text-xs text-gray-500 mt-1">Current Batch</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Low Stock Items</p>
                                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inventory Value</p>
                                <p className="text-2xl font-bold">₹{(stats.totalValue / 1000).toFixed(1)}K</p>
                            </div>
                            <Package className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by SKU, product name, variant, category, color, size..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setCurrentPage(0);
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Products ({filteredProducts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : paginatedProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No products found
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-visible">
                            <div className="min-w-max">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectAll(checked);
                                                        if (checked) {
                                                            setSelectedIds(new Set(paginatedProducts.map(p => p.id || '')));
                                                        } else {
                                                            setSelectedIds(new Set());
                                                        }
                                                    }}
                                                    className="w-4 h-4 cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-3 text-left font-semibold">Image</th>
                                            <th className="p-3 text-left font-semibold">Name</th>
                                            <th className="p-3 text-left font-semibold">SKU</th>
                                            <th className="p-3 text-left font-semibold">Category</th>
                                            <th className="p-3 text-center font-semibold">Variants</th>
                                            <th className="p-3 text-center font-semibold">Status</th>
                                            <th className="p-3 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map((product: any) => {
                                            const isSelected = selectedIds.has(product.id || '');
                                            const isActive = product.is_Active ?? product.isActive ?? true;

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className={`border-b hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                                >
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newSelected = new Set(selectedIds);
                                                                if (e.target.checked) {
                                                                    newSelected.add(product.id || '');
                                                                } else {
                                                                    newSelected.delete(product.id || '');
                                                                    setSelectAll(false);
                                                                }
                                                                setSelectedIds(newSelected);
                                                            }}
                                                            className="w-4 h-4 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => setImageDialog({ open: true, url: product.imageUrl })}
                                                                onError={(e) => {
                                                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                        ) : (
                                                            <Package className="h-12 w-12 text-gray-300" />
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-medium">{product.name || '-'}</td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => {
                                                                setDetailsDialog({
                                                                    open: true,
                                                                    product: {
                                                                        id: product.id,
                                                                        name: product.name,
                                                                        sku: product.sku,
                                                                        imageUrl: product.imageUrl,
                                                                        category: product.subcategoryName,
                                                                        variants: product.variants || []
                                                                    }
                                                                });
                                                            }}
                                                            className="text-blue-600 hover:underline font-mono text-sm"
                                                        >
                                                            {product.sku}
                                                        </button>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline">{product.subcategoryName || '-'}</Badge>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Badge variant="secondary">{product.variants?.length || 0}</Badge>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {isActive ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600 inline" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600 inline" />
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setDetailsDialog({
                                                                    open: true,
                                                                    product: product // Pass complete product object
                                                                });
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View/Edit Product"
                                                        >
                                                            <Edit className="h-4 w-4 text-gray-600" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        {/* Client-side pagination (within current 100 products) */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs text-gray-500 ml-2">
                                (from current batch)
                            </span>
                        </div>

                        {/* Server-side pagination (navigate all 6,401 products) */}
                        <div className="flex items-center gap-4">
                            {/* Client page navigation */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 0}
                                >
                                    ◄
                                </Button>
                                <span className="text-sm px-2">
                                    {currentPage + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    ►
                                </Button>
                            </div>

                            {/* Server page navigation */}
                            <div className="flex items-center gap-2 border-l pl-4">
                                <span className="text-xs text-gray-600">Server Page:</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setServerPage(serverPage - 1)}
                                    disabled={serverPage === 1}
                                >
                                    « Previous
                                </Button>
                                <span className="text-sm font-medium px-2">
                                    {serverPage} / {Math.ceil(totalServerProducts / 100)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setServerPage(serverPage + 1)}
                                    disabled={serverPage >= Math.ceil(totalServerProducts / 100)}
                                >
                                    Next »
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Image Zoom Dialog */}
                    <Dialog open={imageDialog.open} onOpenChange={(open) => setImageDialog({ open, url: null })}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Product Image</DialogTitle>
                            </DialogHeader>
                            {imageDialog.url && (
                                <div className="flex items-center justify-center p-4">
                                    <img
                                        src={imageDialog.url}
                                        alt="Product"
                                        className="max-h-[70vh] w-auto object-contain"
                                    />
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Product Details Dialog */}
                    <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ open, product: null })}>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl flex items-center gap-2">
                                        {detailsDialog.product?.name}
                                        {detailsDialog.product?.variants?.some((v: any) => v.isActive) ? (
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        )}
                                    </DialogTitle>
                                </div>
                            </DialogHeader>

                            {detailsDialog.product && (
                                <div className="space-y-4">
                                    {/* Product Image */}
                                    {detailsDialog.product.imageUrl && (
                                        <div className="mb-4">
                                            <img
                                                src={detailsDialog.product.imageUrl}
                                                alt={detailsDialog.product.name}
                                                className="h-32 object-contain rounded"
                                            />
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-bold">SKU: </span>
                                            <span>{detailsDialog.product.sku}</span>
                                        </div>
                                        <div>
                                        </div>
                                        {detailsDialog.product.description && (
                                            <div>
                                                <span className="font-bold">Description: </span>
                                                <span>{detailsDialog.product.description}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-bold">Category: </span>
                                            <span>{detailsDialog.product.subcategoryName || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Variants */}
                                    {detailsDialog.product.variants && detailsDialog.product.variants.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg">Variants:</h3>
                                            {detailsDialog.product.variants.map((v: ProductVariant, idx: number) => {
                                                const lowStock = getStock(v) < 10;
                                                return (
                                                    <div key={idx} className="border rounded p-3 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{getVariantName(v)}</span>
                                                            <div className="flex items-center gap-2">
                                                                {v.isActive ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            SKU: {v.sku}, Regular: ₹{(v as any).regularprice || v.regularPrice || 0}, Sale: ₹{getSalePrice(v)}, Weight: {v.weight || 0}g
                                                        </div>
                                                        <div className={`text-sm font-bold ${lowStock ? 'text-red-600' : ''}`}>
                                                            Stock: {getStock(v)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDetailsDialog({ open: false, product: null })}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    const productToEdit = detailsDialog.product;
                                    setDetailsDialog({ open: false, product: null });
                                    setEditProduct(productToEdit);
                                    setAddProductDialog(true);
                                }}>
                                    Edit
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add/Edit Product Dialog */}
                    <ProductFormDialog
                        open={addProductDialog}
                        onOpenChange={(open) => {
                            setAddProductDialog(open);
                            if (!open) setEditProduct(null);  // Clear edit state when closing
                        }}
                        initialProduct={editProduct}
                        onSuccess={() => {
                            window.location.reload();
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
