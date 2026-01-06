'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Upload } from 'lucide-react';
import { productsApiService } from '@/lib/services/products-api.service';

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    initialProduct?: any;
}

export function ProductFormDialog({ open, onOpenChange, onSuccess, initialProduct }: ProductFormDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sku, setSku] = useState('');
    const [hasVariants, setHasVariants] = useState(false);
    const [salePrice, setSalePrice] = useState('');
    const [regularPrice, setRegularPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Category/Subcategory state (Flutter lines 37-38, 72-74)
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(true);

    // Variants state (Flutter lines 43-46)
    const [variants, setVariants] = useState<any[]>([]);

    // ✅ Update form when initialProduct changes (Flutter: initState)
    useEffect(() => {
        if (initialProduct) {
            setName(initialProduct.name || '');
            setDescription(initialProduct.description || '');
            setSku(initialProduct.sku || '');
            setHasVariants(initialProduct.hasVariant || false);
            setImageUrl(initialProduct.imageUrl || '');
            console.log('🔍 Edit Product - initialProduct:', initialProduct); // Debug
            setSelectedSubcategoryId(initialProduct.subcategory_id || initialProduct.subcategoryId || null);
            setIsActive(initialProduct.is_Active ?? initialProduct.isActive ?? true);

            // Load variants from initialProduct
            setVariants(initialProduct.variants || []);

            // ✅ Get prices from first variant (Flutter lines 52-65)
            if (!initialProduct.hasVariant && initialProduct.variants?.length > 0) {
                const firstVariant = initialProduct.variants[0];
                setSalePrice(firstVariant.salePrice?.toString() || firstVariant.saleprice?.toString() || '');
                setRegularPrice(firstVariant.regularPrice?.toString() || firstVariant.regularprice?.toString() || '');
                setWeight(firstVariant.weight?.toString() || '');
            }
        } else {
            // Reset form for "Add Product"
            setName('');
            setDescription('');
            setSku('');
            setHasVariants(false);
            setSalePrice('');
            setRegularPrice('');
            setWeight('');
            setImageUrl('');
            setImageFile(null);
            setSelectedSubcategoryId(null);
            setIsActive(true);
            setVariants([]); // Reset variants
        }
        setError(null);
    }, [initialProduct]);

    // Fetch categories with subcategories (Flutter lines 212-235)
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/getCategories`,
                    {
                        headers: {
                            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log('📦 Categories fetched:', data);
                    // Ensure data is an array - handle different response formats
                    if (Array.isArray(data)) {
                        setCategories(data);
                    } else if (data && Array.isArray(data.categories)) {
                        // API returns {categories: Array}
                        setCategories(data.categories);
                    } else if (data && Array.isArray(data.data)) {
                        setCategories(data.data);
                    } else {
                        console.warn('Categories data is not an array:', data);
                        setCategories([]);
                    }
                } else {
                    console.error('Failed to fetch categories:', response.status);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            }
        }
        if (open) {
            fetchCategories();
        }
    }, [open]);

    // Auto-detect category from subcategory when editing (Flutter lines 383-396)
    useEffect(() => {
        if (selectedSubcategoryId && !selectedCategoryId && categories.length > 0) {
            for (const cat of categories) {
                const subs = cat.subcategories || [];
                if (subs.some((s: any) => s.subcategory_id === selectedSubcategoryId)) {
                    setSelectedCategoryId(cat.category_id);
                    break;
                }
            }
        }
    }, [selectedSubcategoryId, selectedCategoryId, categories]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Upload image if selected
            let finalImageUrl = imageUrl;
            if (imageFile) {
                console.log('📤 Uploading image...');
                const uploadResult = await productsApiService.uploadImage(imageFile, sku || 'product');
                if (uploadResult.error) {
                    throw new Error(`Image upload failed: ${uploadResult.error}`);
                }
                finalImageUrl = uploadResult.url || '';
            }

            // Prepare product data (matching Flutter's Product.toJson())
            const productData: any = {
                name: name.trim(),
                description: description.trim(),
                sku: sku.trim(),
                has_variant: hasVariants,
                subcategory_id: selectedSubcategoryId,
                image_url: finalImageUrl,
                is_Active: isActive,
            };

            // Flutter Product.toJson line 155: if (id != null) 'product_id': id
            if (initialProduct?.id || initialProduct?.product_id) {
                productData.product_id = initialProduct.id || initialProduct.product_id;
            }

            // Add variants
            const variantData: any = {
                variant_name: name.trim(),
                sku: sku.trim(),
                saleprice: parseFloat(salePrice) || 0,
                regularprice: parseFloat(regularPrice) || 0,
                stock: 0,
                weight: parseFloat(weight) || 0,
                color: '',
                is_Active: true,
                image_url: finalImageUrl,
            };

            // Flutter Variant.toJson line 48: if (id != null) 'variant_id': id
            if (initialProduct?.variants?.[0]?.variant_id) {
                variantData.variant_id = initialProduct.variants[0].variant_id;
            }

            productData.variants = hasVariants ? [] : [variantData];

            console.log('📤 Submitting product:', productData);
            console.log('🔍 Debug initialProduct:', initialProduct);

            const productId = initialProduct?.id || initialProduct?.product_id;
            const result = initialProduct
                ? await productsApiService.updateProduct(productId, productData)
                : await productsApiService.addProduct(productData);

            if (!result.success) {
                throw new Error(result.error || 'Failed to save product');
            }

            console.log('✅ Product saved successfully');
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error('❌ Error saving product:', error);
            setError(error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialProduct ? 'Edit Product' : 'Add Product'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Product Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Product Information</h3>

                        {/* Image Upload */}
                        <div className="flex flex-col items-center">
                            <label htmlFor="image-upload" className="cursor-pointer">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Product"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                            </Button>
                        </div>

                        {/* Name */}
                        <div>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter product name"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter product description"
                                rows={3}
                            />
                        </div>

                        {/* SKU */}
                        <div>
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                required
                                placeholder="Enter SKU"
                                readOnly={!!initialProduct}
                            />
                        </div>

                        {/* Category & Subcategory - Flutter lines 374-453 */}
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                className="w-full px-3 py-2 border rounded-md"
                                value={selectedCategoryId || ''}
                                onChange={(e) => {
                                    const catId = e.target.value ? parseInt(e.target.value) : null;
                                    setSelectedCategoryId(catId);
                                    setSelectedSubcategoryId(null); // Reset subcategory when category changes
                                }}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="subcategory">Subcategory *</Label>
                            <select
                                id="subcategory"
                                className="w-full px-3 py-2 border rounded-md"
                                value={selectedSubcategoryId || ''}
                                onChange={(e) => {
                                    const subId = e.target.value ? parseInt(e.target.value) : null;
                                    setSelectedSubcategoryId(subId);
                                }}
                                required
                            >
                                <option value="">Select Subcategory</option>
                                {selectedCategoryId && categories
                                    .find((c: any) => c.category_id === selectedCategoryId)
                                    ?.subcategories?.map((sub: any) => (
                                        <option key={sub.subcategory_id} value={sub.subcategory_id}>
                                            {sub.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Has Variants */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has-variants"
                                checked={hasVariants}
                                onCheckedChange={(checked) => setHasVariants(checked as boolean)}
                            />
                            <Label htmlFor="has-variants" className="cursor-pointer">
                                Has Variants
                            </Label>
                        </div>

                        {/* Price fields (only if no variants) */}
                        {!hasVariants && (
                            <>
                                <div>
                                    <Label htmlFor="sale-price">Sale Price</Label>
                                    <Input
                                        id="sale-price"
                                        type="number"
                                        step="0.01"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="regular-price">Regular Price</Label>
                                    <Input
                                        id="regular-price"
                                        type="number"
                                        step="0.01"
                                        value={regularPrice}
                                        onChange={(e) => setRegularPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="weight">Weight (g)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Active/Inactive Switch - Flutter lines 485-494 */}
                                <div className="flex items-center justify-between p-3 border rounded-md">
                                    <Label htmlFor="is-active">{isActive ? 'Active' : 'Inactive'}</Label>
                                    <button
                                        type="button"
                                        id="is-active"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Variants section (if has variants) */}
                        {hasVariants && (
                            <div className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Variants</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // Add new variant using state
                                            setVariants([...variants, {
                                                variant_name: '',
                                                sku: '',
                                                saleprice: 0,
                                                regularprice: 0,
                                                weight: 0,
                                                color: '',
                                                is_Active: true
                                            }]);
                                        }}
                                    >
                                        + Add Variant
                                    </Button>
                                </div>

                                {variants && variants.length > 0 ? (
                                    variants.map((variant: any, index: number) => (
                                        <div key={index} className="border rounded p-3 space-y-3 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">Variant {index + 1}</span>
                                                {variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setVariants(variants.filter((_: any, i: number) => i !== index));
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        ✕ Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs">Variant Name *</Label>
                                                    <Input
                                                        value={variant.variant_name || variant.name || ''}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], variant_name: e.target.value };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="e.g., Gold - Small"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">SKU *</Label>
                                                    <Input
                                                        value={variant.sku || ''}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], sku: e.target.value };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="SKU"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Sale Price</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.saleprice || variant.salePrice || 0}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], saleprice: parseFloat(e.target.value) };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="0.00"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Regular Price</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.regularprice || variant.regularPrice || 0}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], regularprice: parseFloat(e.target.value) };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="0.00"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Weight (g)</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.weight || 0}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], weight: parseFloat(e.target.value) };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="0"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Color</Label>
                                                    <Input
                                                        value={variant.color || ''}
                                                        onChange={(e) => {
                                                            const newVariants = [...variants];
                                                            newVariants[index] = { ...newVariants[index], color: e.target.value };
                                                            setVariants(newVariants);
                                                        }}
                                                        placeholder="Color"
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No variants added yet. Click "+ Add Variant" to create one.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
