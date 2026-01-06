// Export utilities for CSV and Excel

export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
    // For basic Excel export, we'll use CSV format with .xls extension
    // For proper Excel files, you'd need a library like xlsx
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);

    // Create tab-separated content for Excel
    const excelContent = [
        headers.join('\t'),
        ...data.map(row =>
            headers.map(header => row[header] ?? '').join('\t')
        )
    ].join('\n');

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportSelectedToCSV(selectedIds: Set<any>, allData: any[], filename: string) {
    const selectedData = allData.filter(item => selectedIds.has(item.id || item[Object.keys(item)[0]]));
    exportToCSV(selectedData, `${filename}_selected`);
}

export function exportSelectedToExcel(selectedIds: Set<any>, allData: any[], filename: string) {
    const selectedData = allData.filter(item => selectedIds.has(item.id || item[Object.keys(item)[0]]));
    exportToExcel(selectedData, `${filename}_selected`);
}
