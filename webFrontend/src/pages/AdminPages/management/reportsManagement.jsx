import { useState, useEffect } from "react";
import { Flag, Users, ShieldAlert, CheckCircle, XCircle, ShieldX, ImageIcon } from "lucide-react";
import api from "../../../api/axios";
import toastService from "../../../services/toastService";
import { useModal } from "../../../context/modalContext";
import ReporterListModal from "./reporterListModal"; // Import the new modal
import ImageModal from "./imageModal"; // Modal to display images

// Helper to summarize reasons
const getReasonSummary = (reports) => {
    const counts = reports.reduce((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).map(([reason, count]) => `${reason} (${count})`).join(', ');
};


export default function ReportsManagement() {
    const [groupedReports, setGroupedReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { showModal, hideModal } = useModal();

    const fetchReports = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = { page: page.toString(), status: statusFilter };
            const response = await api.get('/admin/reports', { params });
            setGroupedReports(response.data.reports);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Could not load reports.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(1);
    }, [statusFilter]);

    const handleBulkAction = async (contentId, type, action) => {
        const endpoint = action === 'dismiss' ? '/admin/reports/dismiss-content' : '/admin/reports/resolve-content';
        try {
            await api.post(endpoint, { contentId, type });
            toastService.success(`Action successful.`);
            fetchReports(currentPage); // Refresh list
        } catch (error) {
            toastService.error(`Failed to ${action} reports.`);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReports(newPage);
        }
    };

    if (isLoading) return <div className="text-center main-text py-10">Loading reports...</div>;
    if (error) return <div className="text-center status-error py-10">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="card-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold main-text mb-4">Filter Reports</h3>
                <div className="flex flex-wrap gap-2">
                    {["PENDING", "RESOLVED", "DISMISSED", "ALL"].map((status) => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${statusFilter === status ? "button-primary" : "button-secondary"}`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {groupedReports.length === 0 ? (
                <div className="card-secondary rounded-lg p-10 text-center tertiary-text">No {statusFilter.toLowerCase()} reports found.</div>
            ) : (
                <div className="space-y-4">
                    {groupedReports.map((group) => (
                        <div key={group.contentId} className="card-secondary rounded-lg p-4 space-y-3">
                            {/* --- Main Content Info --- */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold uppercase tertiary-text mb-1">Reported Content ({group.type})</p>
                                    <p className="main-text italic line-clamp-2">"{group.content}"</p>
                                    <p className="text-xs tertiary-text mt-1">Author: {group.author?.email || 'N/A'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold uppercase tertiary-text mb-1">Reports</p>
                                    <p className="text-2xl font-bold main-text">{group.uniqueReportCount}</p>
                                </div>
                            </div>
                            
                            {/* --- Summary of Reasons --- */}
                            <div className="px-2 py-1 bg-[var(--bg-tertiary)] rounded">
                                <p className="text-xs tertiary-text"><span className="font-semibold">Reasons:</span> {getReasonSummary(group.reports)}</p>
                            </div>

                            {/* --- Action Bar --- */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => showModal(<ReporterListModal reports={group.reports} onClose={hideModal} />)} className="flex items-center gap-2 tertiary-text hover:main-text text-sm font-semibold p-2 rounded-md hover-interactive">
                                        <Users className="w-4 h-4"/>
                                        View Reporters
                                    </button>
                                    {group.type === 'POST' && group.imageUrl && (
                                        <button onClick={() => showModal(<ImageModal imageUrl={group.imageUrl} onClose={hideModal} />)} className="flex items-center gap-2 tertiary-text hover:main-text text-sm font-semibold p-2 rounded-md hover-interactive">
                                            <ImageIcon className="w-4 h-4"/>
                                            View Image
                                        </button>
                                    )}
                                </div>
                                
                                {statusFilter === 'PENDING' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleBulkAction(group.contentId, group.type, 'dismiss')} className="flex items-center gap-2 text-sm button-secondary px-3 py-1.5 rounded-lg">
                                            <ShieldX className="w-4 h-4"/> Dismiss All
                                        </button>
                                        <button onClick={() => handleBulkAction(group.contentId, group.type, 'resolve')} className="flex items-center gap-2 text-sm bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg">
                                            <CheckCircle className="w-4 h-4"/> Resolve & Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 flex justify-center items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded button-secondary disabled:opacity-50">Prev</button>
                    <span className="text-sm font-medium tertiary-text">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded button-secondary disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}