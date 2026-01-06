// Add this helper function after the handleDelete function (around line 75)

const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsDialog(true);
};

const handleDownloadInvoice = (invoiceImage: string, invoiceNo: string) => {
    const link = document.createElement('a');
    link.href = invoiceImage;
    link.download = `invoice-${invoiceNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Updated table header row (replace line 197-209)
<thead>
    <tr className="bg-gray-50 border-b">
        <th className="p-3 text-left font-semibold">Purchase ID</th>
        <th className="p-3 text-left font-semibold">Invoice No</th>
        <th className="p-3 text-left font-semibold">Vendor Name</th>
        <th className="p-3 text-left font-semibold">Invoice Date</th>
        <th className="p-3 text-center font-semibold">Invoice Image</th>
        <th className="p-3 text-right font-semibold">Total Amount</th>
        <th className="p-3 text-center font-semibold">Item Count</th>
        <th className="p-3 text-center font-semibold">Actions</th>
    </tr>
</thead>

// Updated table body row (replace lines 210-251)
<tbody>
    {paginatedPurchases.map((purchase) => (
        <tr key={purchase.purchase_id} className="border-b hover:bg-gray-50 transition-colors">
            <td className="p-3 font-medium">{purchase.purchase_id}</td>
            <td className="p-3">{purchase.invoice_no}</td>
            <td className="p-3">{purchase.vendor?.name || '-'}</td>
            <td className="p-3 text-sm">
                {purchase.invoice_date
                    ? new Date(purchase.invoice_date).toLocaleDateString('en-IN')
                    : '-'}
            </td>
            <td className="p-3 text-center">
                {purchase.invoice_image ? (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleViewDetails(purchase)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="View Invoice"
                        >
                            <Image className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                            onClick={() => handleDownloadInvoice(purchase.invoice_image!, purchase.invoice_no!)}
                            className="p-1 hover:bg-green-50 rounded"
                            title="Download Invoice"
                        >
                            <Download className="h-5 w-5 text-green-600" />
                        </button>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                )}
            </td>
            <td className="p-3 text-right font-semibold">₹{purchase.amount?.toLocaleString('en-IN') || 0}</td>
            <td className="p-3 text-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {purchase.purchase_items?.length || 0} items
                </span>
            </td>
            <td className="p-3">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleViewDetails(purchase)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => handleDelete(purchase.purchase_id!)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                </div>
            </td>
        </tr>
    ))}
</tbody>

// Add this dialog before the closing </div> (after the AddPurchaseDialog, around line 293)
{/* Purchase Details Dialog */}
<Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>Purchase Details - {selectedPurchase?.invoice_no}</DialogTitle>
        </DialogHeader>

        {selectedPurchase && (
            <div className="space-y-4">
                {/* Purchase Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Purchase ID</p>
                        <p className="font-semibold">{selectedPurchase.purchase_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Invoice No</p>
                        <p className="font-semibold">{selectedPurchase.invoice_no}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Vendor</p>
                        <p className="font-semibold">{selectedPurchase.vendor?.name || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-semibold">{selectedPurchase.vendor?.contact_number || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Invoice Date</p>
                        <p className="font-semibold">
                            {selectedPurchase.invoice_date
                                ? new Date(selectedPurchase.invoice_date).toLocaleDateString('en-IN')
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold text-lg text-green-600">
                            ₹{selectedPurchase.amount?.toLocaleString('en-IN') || 0}
                        </p>
                    </div>
                </div>

                {/* Invoice Image */}
                {selectedPurchase.invoice_image && (
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Invoice Image</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(selectedPurchase.invoice_image!, selectedPurchase.invoice_no!)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                        <img
                            src={selectedPurchase.invoice_image}
                            alt="Invoice"
                            className="w-full max-h-96 object-contain border rounded"
                        />
                    </div>
                )}

                {/* Purchase Items */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Purchase Items</h3>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2 text-left text-sm">SKU</th>
                                <th className="p-2 text-center text-sm">Quantity</th>
                                <th className="p-2 text-right text-sm">Cost Price</th>
                                <th className="p-2 text-right text-sm">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPurchase.purchase_items?.map((item:  any, idx: number) => (
                                <tr key={idx} className="border-t">
                                    <td className="p-2">
                                        {item.product_variants?.sku || item.variant_id}
                                    </td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-right">
                                        ₹{(item.cost_price / item.quantity).toFixed(2)}
                                    </td>
                                    <td className="p-2 text-right font-semibold">
                                        ₹{item.cost_price?.toLocaleString('en-IN') || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </DialogContent>
</Dialog>
