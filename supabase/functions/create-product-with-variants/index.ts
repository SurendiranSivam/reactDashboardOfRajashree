import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    try {
        const body = await req.json();

        console.log("📤 Creating product:", body.name);

        // ✅ Validation
        if (
            body.has_variant &&
            (!Array.isArray(body.variants) || body.variants.length === 0)
        ) {
            console.error("❌ Validation failed: has_variant true but no variants");
            return new Response(
                JSON.stringify({
                    error: "has_variant is true, so variants must be provided.",
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    }
                }
            );
        }

        // ✅ Category/Subcategory mapping
        let subcategoryId: number | null = null;

        if (body.category) {
            const { data: subcatData, error: subcatError } = await supabase
                .from("subcategories")
                .select("subcategory_id")
                .ilike("name", body.category)
                .maybeSingle();

            if (subcatError) {
                console.error("❌ Subcategory lookup failed:", subcatError);
            } else if (!subcatData) {
                console.warn("⚠️ Subcategory not found:", body.category);
            } else {
                subcategoryId = subcatData.subcategory_id;
                console.log("✅ Subcategory mapped:", subcategoryId);
            }
        }

        // ✅ Insert into master_product
        const productToInsert: any = {
            name: body.name,
            description: body.description,
            sku: body.sku,
            has_variant: body.has_variant,
            subcategory_id: subcategoryId,
            image_url: body.image_url,
            created_at: new Date().toISOString(),
        };

        // Only include product_id if editing (not for new products)
        if (body.product_id) {
            productToInsert.product_id = body.product_id;
        }

        const { data: masterProduct, error: insertMasterError } = await supabase
            .from("master_product")
            .upsert([productToInsert])
            .select("product_id")
            .single();

        if (insertMasterError) {
            console.error("❌ Master product insert failed:", insertMasterError);
            return new Response(
                JSON.stringify({
                    error: "Failed to insert into master_product",
                    details: insertMasterError,
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    }
                }
            );
        }

        console.log("✅ Product created:", masterProduct.product_id);

        // ✅ Variants insert
        if (body.has_variant && Array.isArray(body.variants) && body.variants.length > 0) {
            const variants = body.variants.map((variant: any) => ({
                product_id: masterProduct.product_id,
                variant_id: variant.variant_id,
                variant_name: variant.variant_name,
                sku: variant.sku,
                saleprice: variant.saleprice,
                regularprice: variant.regularprice,
                stock: variant.stock ?? 0,
                weight: variant.weight,
                length: variant.length ?? null,
                size: variant.size ?? null,
                color: variant.color ?? null,
                created_at: new Date().toISOString(),
                image_url: variant.image_url ?? null,
                is_variant: true,
            }));

            const { error: variantInsertErr } = await supabase
                .from("product_variants")
                .upsert(variants);

            if (variantInsertErr) {
                console.error("❌ Variant insert failed, rolling back:", variantInsertErr);

                // Rollback master product
                await supabase
                    .from("master_product")
                    .delete()
                    .eq("product_id", masterProduct.product_id);

                return new Response(
                    JSON.stringify({
                        error: "Failed to insert variants",
                        details: variantInsertErr,
                    }),
                    {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        }
                    }
                );
            }

            console.log("✅ Variants created");
        } else if (!body.has_variant && Array.isArray(body.variants) && body.variants.length > 0) {
            // ✅ Single product without variants
            const variants = body.variants.map((variant: any) => ({
                product_id: masterProduct.product_id,
                variant_id: masterProduct.product_id,
                variant_name: variant.variant_name,
                sku: variant.sku,
                saleprice: variant.saleprice,
                regularprice: variant.regularprice,
                stock: variant.stock ?? 0,
                weight: variant.weight,
                length: variant.length ?? null,
                size: variant.size ?? null,
                color: variant.color ?? null,
                created_at: new Date().toISOString(),
                image_url: variant.image_url ?? null,
                is_variant: false,
            }));

            const { error: variantInsertErr } = await supabase
                .from("product_variants")
                .upsert(variants);

            if (variantInsertErr) {
                console.error("❌ Single variant insert failed, rolling back:", variantInsertErr);

                // Rollback master product
                await supabase
                    .from("master_product")
                    .delete()
                    .eq("product_id", masterProduct.product_id);

                return new Response(
                    JSON.stringify({
                        error: "Failed to insert variants",
                        details: variantInsertErr,
                    }),
                    {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        }
                    }
                );
            }

            console.log("✅ Single variant created");
        }

        console.log("✅ Product creation complete");

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
            },
        });
    } catch (err) {
        console.error("❌ Unhandled error:", err);
        return new Response(
            JSON.stringify({ error: "Unexpected server error", details: err.message }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                }
            }
        );
    }
});
