'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { exportToCSV, exportToExcel } from '@/lib/utils/export';

interface DataTableProps<T> {
    data: T[];
    columns: {
        key: string;
        label: string;
        render?: (item: T) => React.ReactNode;
    }[];
    onRowClick?: (item: T) => void;
    getRowId: (item: T) => string | number;
    searchTerm?: string;
    exportFilename: string;
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    getRowId,
    exportFilename,
}: DataTableProps<T>) {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Pagination
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedData.map(getRowId)));
        }
    };

    const toggleSelect = (id: string | number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const isAllSelected = paginatedData.length > 0 && selectedIds.size === paginatedData.length;
    const isSomeSelected = selectedIds.size > 0 && selectedIds.size < paginatedData.length;

    // Export handlers
    const handleExportCSV = () => {
        if (selectedIds.size > 0) {
            const selectedData = data.filter(item => selectedIds.has(getRowId(item)));
            exportToCSV(selectedData, `${exportFilename}_selected`);
        } else {
            exportToCSV(data, exportFilename);
        }
    };

    const handleExportExcel = () => {
        if (selectedIds.size > 0) {
            const selectedData = data.filter(item => selectedIds.has(getRowId(item)));
            exportToExcel(selectedData, `${exportFilename}_selected`);
        } else {
            exportToExcel(data, exportFilename);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <span className="text-sm text-gray-600">
                            {selectedIds.size} item(s) selected
                        </span>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportCSV}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export as CSV
                            {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export as Excel
                            {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                        className={isSomeSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                                    />
                                </th>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="text-left px-4 py-3 font-semibold text-gray-700 text-sm"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((item) => {
                                const id = getRowId(item);
                                const isSelected = selectedIds.has(id);

                                return (
                                    <tr
                                        key={id}
                                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''
                                            } ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(id)}
                                                aria-label={`Select row ${id}`}
                                            />
                                        </td>
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                                                {column.render
                                                    ? column.render(item)
                                                    : (item as any)[column.key]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
}
