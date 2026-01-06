import * as XLSX from 'xlsx';
import type { Order, SkuSummary } from '@/types/orders';

export const excelService = {
    /**
     * Export orders to Excel (matching Flutter functionality)
     */
    exportOrdersToExcel(orders: Order[]): boolean {
        try {
            // Prepare data for Excel
            const excelData = orders.map(order => ({
                'Order ID': order.order_id,
                'Date': order.order_date,
                'Customer Name': order.customers?.full_name || 'N/A',
                'Mobile': order.customers?.mobile_number || order.contact_number || 'N/A',
                'Email': order.customers?.email || 'N/A',
                'Shipping Address': `${order.name}, ${order.shipping_address}, ${order.shipping_state}`,
                'Contact Number': order.contact_number,
                'Total Amount': order.total_amount,
                'Shipping Amount': order.shipping_amount,
                'Source': order.source,
                'Order Status': order.order_status,
                'Shipment Status': order.shipment_status || 'N/A',
                'Payment Method': order.payment_method,
                'Payment Transaction ID': order.payment_transaction_id || 'N/A',
                'Order Note': order.order_note || '',
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = [
                { wch: 15 }, // Order ID
                { wch: 20 }, // Date
                { wch: 20 }, // Customer Name
                { wch: 15 }, // Mobile
                { wch: 25 }, // Email
                { wch: 40 }, // Shipping Address
                { wch: 15 }, // Contact Number
                { wch: 12 }, // Total Amount
                { wch: 12 }, // Shipping Amount
                { wch: 12 }, // Source
                { wch: 15 }, // Order Status
                { wch: 15 }, // Shipment Status
                { wch: 15 }, // Payment Method
                { wch: 20 }, // Payment Transaction ID
                { wch: 30 }, // Order Note
            ];
            worksheet['!cols'] = colWidths;

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

            // Generate file name with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Orders_Export_${timestamp}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, filename);

            return true;
        } catch (error) {
            console.error('Error exporting orders to Excel:', error);
            return false;
        }
    },

    /**
     * Export SKU summary to Excel (matching Flutter functionality)
     */
    exportSkuSummaryToExcel(skuData: SkuSummary[], date: Date): boolean {
        try {
            // Prepare data for Excel
            const excelData = skuData.map(sku => ({
                'SKU': sku.sku,
                'Variant Name': sku.variant_name,
                'Quantity Sold': sku.total_qty,
                'Current Stock': sku.current_stock,
                'Sale Price': sku.saleprice,
                'Total Revenue': sku.total_qty * sku.saleprice,
                'Stock Status': sku.current_stock < sku.total_qty ? 'Low Stock' : 'Sufficient',
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = [
                { wch: 20 }, // SKU
                { wch: 25 }, // Variant Name
                { wch: 15 }, // Quantity Sold
                { wch: 15 }, // Current Stock
                { wch: 12 }, // Sale Price
                { wch: 15 }, // Total Revenue
                { wch: 15 }, // Stock Status
            ];
            worksheet['!cols'] = colWidths;

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'SKU Summary');

            // Generate file name with date
            const dateStr = date.toISOString().split('T')[0];
            const filename = `SKU_Summary_${dateStr}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, filename);

            return true;
        } catch (error) {
            console.error('Error exporting SKU summary to Excel:', error);
            return false;
        }
    },
};
