import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverallPerformance } from '../services/testService';
import { FaArrowLeft, FaDownload, FaTrophy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 10;

const OverallPerformance = () => {
    const navigate = useNavigate();
    const [perfLoading, setPerfLoading] = useState(true);
    const [perfData, setPerfData] = useState(null);
    // Which page of tests we're viewing (0-based)
    const [testPage, setTestPage] = useState(0);

    useEffect(() => {
        loadPerformance();
    }, []);

    const loadPerformance = async () => {
        setPerfLoading(true);
        try {
            // Fetch all tests (large limit) — pagination is done on the frontend
            const res = await getOverallPerformance({ limit: 1000 });
            if (res.success) setPerfData(res);
        } catch (err) {
            toast.error(err.message || 'Failed to load performance data');
        } finally {
            setPerfLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // All tests from backend
    const allTests = perfData?.tests || [];
    const totalPages = Math.ceil(allTests.length / PAGE_SIZE);
    // Tests visible in current page
    const visibleTests = allTests.slice(testPage * PAGE_SIZE, (testPage + 1) * PAGE_SIZE);

    // ─── Export helpers — always use ALL tests ────────────────────────────────
    const exportPerfCSV = () => {
        if (!perfData?.students?.length || !allTests.length) return;

        const testHeaders = allTests.map(t => `${t.title} (${formatDate(t.testDate)}) Max:${t.maxMarks}`);
        const headers = ['Student Name', 'Rank', ...testHeaders, 'Total Marks Obtained', 'Total Max Marks', 'Percentage'];

        const rows = perfData.students.map(s => {
            const row = [s.name || '-', s.rank];
            allTests.forEach(t => {
                const scoreEntry = s.scores.find(score => score.testId === t._id);
                if (scoreEntry) {
                    row.push(scoreEntry.attendanceStatus === 'Absent' ? 'Absent' : `${scoreEntry.marksObtained}`);
                } else {
                    row.push('N/A');
                }
            });
            row.push(s.totalMarksObtained);
            row.push(s.totalMaxMarks);
            row.push(`${s.percentage}%`);
            return row;
        });

        const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `overall_performance_all${allTests.length}tests.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPerfPDF = () => {
        if (!perfData?.students?.length || !allTests.length) return;
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text(`Overall Performance — All ${allTests.length} Tests`, 14, 16);
        doc.setFontSize(10);

        const testTitles = allTests.map(t => t.title).join(', ');
        doc.text(`Tests: ${testTitles}`, 14, 24, { maxWidth: 270 });

        const headRow = ['Student Name', 'Rank', ...allTests.map(t => `${t.title}\n(${formatDate(t.testDate)})`), 'Total %'];

        const bodyRows = perfData.students.map(s => {
            const row = [s.name, s.rank];
            allTests.forEach(t => {
                const scoreEntry = s.scores.find(score => score.testId === t._id);
                if (scoreEntry) {
                    row.push(scoreEntry.attendanceStatus === 'Absent' ? 'Absent' : `${scoreEntry.marksObtained}/${t.maxMarks}`);
                } else {
                    row.push('-');
                }
            });
            row.push(`${s.percentage}%`);
            return row;
        });

        autoTable(doc, {
            startY: 34,
            head: [headRow],
            body: bodyRows,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [44, 62, 80], halign: 'center' },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { halign: 'center', cellWidth: 15 },
            },
            bodyStyles: { halign: 'center' }
        });

        doc.save(`overall_performance_all${allTests.length}tests.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tests')}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-[#2C3E50] hover:bg-gray-50 rounded-xl transition-all shadow-sm"
                        title="Back to Tests"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-3">
                            <FaTrophy className="text-amber-500" /> Overall Performance
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {perfData
                                ? `${allTests.length} test${allTests.length !== 1 ? 's' : ''} total`
                                : 'Loading...'}
                        </p>
                    </div>
                </div>

                {/* Export buttons */}
                {perfData?.students?.length > 0 && (
                    <div className="flex gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-xs text-gray-400 self-center mr-1">Export all data:</span>
                        <button
                            onClick={exportPerfCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold transition-colors"
                            title="Export all tests to CSV"
                        >
                            <FaDownload /> CSV
                        </button>
                        <button
                            onClick={exportPerfPDF}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                            title="Export all tests to PDF"
                        >
                            <FaDownload /> PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Test range navigation */}
            {allTests.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-gray-600">Tests:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => {
                            const from = i * PAGE_SIZE + 1;
                            const to = Math.min((i + 1) * PAGE_SIZE, allTests.length);
                            return (
                                <button
                                    key={i}
                                    onClick={() => setTestPage(i)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${testPage === i
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
                                        }`}
                                >
                                    {from}–{to}
                                </button>
                            );
                        })}
                    </div>
                    {/* Prev / Next arrows */}
                    <div className="flex gap-1 ml-auto">
                        <button
                            onClick={() => setTestPage(p => Math.max(0, p - 1))}
                            disabled={testPage === 0}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Previous 10 tests"
                        >
                            <FaChevronLeft className="text-xs" />
                        </button>
                        <button
                            onClick={() => setTestPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={testPage >= totalPages - 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Next 10 tests"
                        >
                            <FaChevronRight className="text-xs" />
                        </button>
                    </div>
                </div>
            )}

            {/* Tests included info for current page */}
            {visibleTests.length > 0 && (
                <div className="px-5 py-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        Showing tests {testPage * PAGE_SIZE + 1}–{Math.min((testPage + 1) * PAGE_SIZE, allTests.length)} of {allTests.length}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {visibleTests.map(t => (
                            <span key={t._id} className="px-3 py-1 bg-white text-blue-700 text-xs rounded-lg border border-blue-200 font-medium whitespace-nowrap shadow-sm">
                                {t.title} <span className="text-blue-400">({formatDate(t.testDate)})</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {perfLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading performance data...</p>
                    </div>
                ) : !perfData?.students?.length ? (
                    <div className="text-center py-20 text-gray-400">
                        <FaTrophy className="text-6xl mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium text-gray-500 mb-1">No data available</p>
                        <p className="text-sm">Ensure tests are created and scores are recorded.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                                    <th className="px-4 py-4 text-left font-bold text-[#2C3E50] whitespace-nowrap sticky left-0 bg-gray-50 z-10 border-r border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Student Name
                                    </th>
                                    <th className="px-4 py-4 text-center font-bold text-[#2C3E50] whitespace-nowrap border-b border-gray-200">
                                        Rank
                                    </th>
                                    {visibleTests.map(test => (
                                        <th key={test._id} className="px-4 py-3 text-center font-bold text-gray-700 border-b border-gray-200 min-w-[120px]">
                                            <div className="text-xs text-gray-800 mb-0.5 truncate max-w-[150px] mx-auto" title={test.title}>
                                                {test.title}
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                                                {formatDate(test.testDate)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-4 text-center font-bold text-blue-800 whitespace-nowrap border-b border-gray-200 bg-blue-50/50">
                                        Overall %
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {perfData.students.map((student, index) => {
                                    const rankDisplay = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank;
                                    const isTop3 = student.rank <= 3;
                                    const pctNum = parseFloat(student.percentage);
                                    const pctColor = pctNum >= 75 ? 'text-green-600' : pctNum >= 40 ? 'text-amber-600' : 'text-red-600';

                                    return (
                                        <tr key={student.studentId} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ${isTop3 ? 'bg-amber-50/20' : ''}`}>
                                            <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-inherit">
                                                {student.name}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-700 text-base">
                                                {rankDisplay}
                                            </td>

                                            {visibleTests.map(test => {
                                                const scoreEntry = student.scores.find(s => s.testId === test._id);
                                                if (!scoreEntry) {
                                                    return (
                                                        <td key={test._id} className="px-4 py-3 text-center text-gray-300 font-medium">
                                                            —
                                                        </td>
                                                    );
                                                }
                                                if (scoreEntry.attendanceStatus === 'Absent') {
                                                    return (
                                                        <td key={test._id} className="px-4 py-3 text-center">
                                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded">Absent</span>
                                                        </td>
                                                    );
                                                }

                                                const marksRatio = scoreEntry.marksObtained / test.maxMarks;
                                                const scoreColor = marksRatio > 0.8 ? 'text-green-700' : marksRatio > 0.4 ? 'text-gray-700' : 'text-orange-600';

                                                return (
                                                    <td key={test._id} className="px-4 py-3 text-center">
                                                        <span className={`font-bold ${scoreColor}`}>
                                                            {scoreEntry.marksObtained}
                                                        </span>
                                                        <span className="text-gray-400 text-xs font-medium ml-0.5">
                                                            /{test.maxMarks}
                                                        </span>
                                                    </td>
                                                );
                                            })}

                                            <td className="px-4 py-3 text-center bg-blue-50/20">
                                                <span className={`font-bold text-sm ${pctColor}`}>
                                                    {student.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverallPerformance;
