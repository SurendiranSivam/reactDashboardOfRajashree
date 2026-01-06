'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Search, AlertCircle, Clock, CheckCircle, XCircle,
    User, Briefcase, Calendar
} from 'lucide-react';
import { ticketsService } from '@/lib/services/tickets.service';
import type { Ticket, TicketStatus, TicketSeverity } from '@/types/queries';
import { TICKET_STATUSES, TICKET_CATEGORIES } from '@/types/queries';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Dialog
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const result = await ticketsService.fetchTickets();
        if (result.data) {
            setTickets(result.data);
        }
        setLoading(false);
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            ticket.ticket_number.toLowerCase().includes(search) ||
            ticket.subject.toLowerCase().includes(search) ||
            ticket.category.toLowerCase().includes(search) ||
            ticket.status.toLowerCase().includes(search) ||
            ticket.assigned_to?.toLowerCase().includes(search) ||
            ticket.description.toLowerCase().includes(search)
        );
    });

    // Paginate
    const totalPages = Math.ceil(filteredTickets.length / pageSize);
    const paginatedTickets = filteredTickets.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    // Severity badge color
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'High':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Low':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New':
                return 'bg-blue-100 text-blue-800';
            case 'Assigned':
                return 'bg-purple-100 text-purple-800';
            case 'In Progress':
                return 'bg-orange-100 text-orange-800';
            case 'Pending Customer':
                return 'bg-yellow-100 text-yellow-800';
            case 'Pending Internal':
                return 'bg-amber-100 text-amber-800';
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            case 'Closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New':
                return <AlertCircle className="h-4 w-4" />;
            case 'In Progress':
                return <Clock className="h-4 w-4" />;
            case 'Resolved':
                return <CheckCircle className="h-4 w-4" />;
            case 'Closed':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    // Handle view details
    const handleViewDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailsDialog(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-600">Support Tickets</h1>
                    <p className="text-gray-600">Manage escalated customer issues</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-2xl font-bold text-indigo-600">{tickets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">New</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {tickets.filter(t => t.status === 'New').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Assigned</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {tickets.filter(t => t.status === 'Assigned').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">In Progress</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {tickets.filter(t => t.status === 'In Progress').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Pending</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {tickets.filter(t => t.status.includes('Pending')).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Resolved</div>
                        <div className="text-2xl font-bold text-green-600">
                            {tickets.filter(t => t.status === 'Resolved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Closed</div>
                        <div className="text-2xl font-bold text-gray-600">
                            {tickets.filter(t => t.status === 'Closed').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by ticket number, subject, category, status, or assigned to..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-sm">Ticket #</th>
                                    <th className="p-3 text-left font-semibold text-sm">Subject</th>
                                    <th className="p-3 text-left font-semibold text-sm">Category</th>
                                    <th className="p-3 text-left font-semibold text-sm">Severity</th>
                                    <th className="p-3 text-left font-semibold text-sm">Status</th>
                                    <th className="p-3 text-left font-semibold text-sm">Assigned To</th>
                                    <th className="p-3 text-left font-semibold text-sm">Created</th>
                                    <th className="p-3 text-left font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-gray-500">
                                            No tickets found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTickets.map((ticket) => (
                                        <tr key={ticket.ticket_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-semibold border border-indigo-200">
                                                    {ticket.ticket_number}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{ticket.subject}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Query #{ticket.query_id}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-sm text-gray-700">{ticket.category}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(ticket.severity)}`}>
                                                    {ticket.severity}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(ticket.status)}
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {ticket.assigned_to ? (
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <User className="h-3 w-3 text-gray-400" />
                                                            {ticket.assigned_to}
                                                        </div>
                                                        {ticket.assigned_department && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                <Briefcase className="h-3 w-3" />
                                                                {ticket.assigned_department}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(ticket.created_at!).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(ticket)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredTickets.length)} of {filteredTickets.length} tickets
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage + 1} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Details Dialog */}
            {showDetailsDialog && selectedTicket && (
                <TicketDetailsDialog
                    ticket={selectedTicket}
                    open={showDetailsDialog}
                    onClose={() => {
                        setShowDetailsDialog(false);
                        setSelectedTicket(null);
                    }}
                    onSuccess={loadTickets}
                />
            )}
        </div>
    );
}

// Ticket Details Dialog Component
interface TicketDetailsDialogProps {
    ticket: Ticket;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function TicketDetailsDialog({ ticket, open, onClose, onSuccess }: TicketDetailsDialogProps) {
    const [status, setStatus] = useState(ticket.status);
    const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '');
    const [resolution, setResolution] = useState(ticket.resolution || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);

        const updates: Partial<Ticket> = {
            assigned_to: assignedTo || undefined,
            resolution: resolution || undefined,
        };

        // Update ticket details
        await ticketsService.updateTicket(ticket.ticket_id!, updates);

        // Update status if changed
        if (status !== ticket.status) {
            await ticketsService.updateStatus(ticket.ticket_id!, status as TicketStatus);
        }

        setLoading(false);
        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ticket Details - {ticket.ticket_number}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Ticket Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Subject:</span>
                                    <p className="font-semibold mt-1">{ticket.subject}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Category:</span>
                                    <p className="font-semibold mt-1">{ticket.category}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Severity:</span>
                                    <p className="font-semibold mt-1">{ticket.severity}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Created:</span>
                                    <p className="font-semibold mt-1">
                                        {new Date(ticket.created_at!).toLocaleString()}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600">Description:</span>
                                    <p className="mt-1 text-gray-700">{ticket.description}</p>
                                </div>
                                {ticket.escalated_by && (
                                    <div>
                                        <span className="text-gray-600">Escalated By:</span>
                                        <p className="font-semibold mt-1">{ticket.escalated_by}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Form */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mt-1"
                            >
                                {TICKET_STATUSES.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="assignedTo">Assigned To</Label>
                            <Input
                                id="assignedTo"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                placeholder="Person/Team name"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="resolution">Resolution Notes</Label>
                            <textarea
                                id="resolution"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Add resolution details..."
                                className="w-full px-3 py-2 border rounded-md min-h-[100px] mt-1"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                        {loading ? 'Updating...' : 'Update Ticket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
