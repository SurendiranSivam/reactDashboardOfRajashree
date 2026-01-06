import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Fetch active products with variants
        const { data: products, error } = await supabase
            .from('product_variants')
            .select(`
        variant_id,
        variant_name,
        sku,
        saleprice,
        stock,
        image_url,
        is_Active,
        master_product (
          product_id,
          name,
          description,
          subcategories (
            name,
            categories (name)
          )
        )
      `)
            .eq('is_Active', true)
            .gt('stock', 0);

        if (error) {
            return new NextResponse('Error fetching products', { status: 500 });
        }

        // Build RSS 2.0 feed
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rajashreefashion.com';

        const rssItems = products.map((variant: any) => {
            const product = variant.master_product;
            const productId = `${product.product_id}_${variant.variant_id}`;
            const title = `${product.name} - ${variant.variant_name}`;
            const description = product.description || product.name;
            const link = `${baseUrl}/product/${product.product_id}`;
            const imageLink = variant.image_url || '';
            const price = `${variant.saleprice} INR`;
            const availability = variant.stock > 10 ? 'in stock' : 'limited availability';
            const brand = 'Rajashree Fashion';

            // Get category path
            const category = product.subcategories?.categories?.name || 'Clothing';
            const subcategory = product.subcategories?.name || '';
            const categoryPath = subcategory ? `${category} > ${subcategory}` : category;

            return `
    <item>
      <g:id>${productId}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>${availability}</g:availability>
      <g:brand>${brand}</g:brand>
      <g:gtin>${variant.sku || ''}</g:gtin>
      <g:mpn>${variant.sku || ''}</g:mpn>
      <g:google_product_category>${categoryPath}</g:google_product_category>
      <g:product_type>${categoryPath}</g:product_type>
      <g:condition>new</g:condition>
    </item>`;
        }).join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Rajashree Fashion - Product Feed</title>
    <link>${baseUrl}</link>
    <description>Rajashree Fashion Product Catalog</description>
    ${rssItems}
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating Google Shopping feed:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }
}
