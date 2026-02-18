import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getTestById,
  addOrUpdateScores,
  getTestStatistics,
  deleteTest,
} from '../services/testService';
import { getBatchById } from '../services/batchService';
import {
  FaArrowLeft, FaCalendarAlt, FaGraduationCap, FaBook,
  FaChartBar, FaEdit, FaSave, FaTimes, FaTrash,
  FaTrophy, FaUserCheck, FaUserTimes, FaPercent
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statsMessage, setStatsMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Score entry state
  const [isEnteringScores, setIsEnteringScores] = useState(false);
  const [scoreEntries, setScoreEntries] = useState([]);
  const [savingScores, setSavingScores] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const [loadingScores, setLoadingScores] = useState(false);

  const fetchTest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTestById(testId);
      if (res.success) {
        setTest(res.test);
      }
    } catch (err) {
      setError(err.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await getTestStatistics(testId);
      if (res.statistics) {
        setStatistics(res.statistics);
        setStatsMessage('');
      } else {
        setStatistics(null);
        setStatsMessage(res.message || '');
      }
    } catch {
      // Stats may not be available yet
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
    fetchStatistics();
  }, [fetchTest, fetchStatistics]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  // Build score entry rows by fetching all students from applicable batches,
  // then merging with any already-saved scores.
  const startEnteringScores = async () => {
    if (!test) return;
    setLoadingScores(true);
    setScoreError('');

    try {
      // Fetch all applicable batches and collect their students
      const batchResults = await Promise.all(
        test.applicableBatches.map(b => getBatchById(b._id || b))
      );

      // Deduplicate students across batches by _id
      const studentMap = new Map();
      for (const res of batchResults) {
        if (res.success && res.batch?.students) {
          for (const s of res.batch.students) {
            if (!studentMap.has(s._id)) {
              studentMap.set(s._id, s);
            }
          }
        }
      }

      // Build a lookup of existing scores keyed by studentId string
      const existingScoreMap = new Map();
      for (const score of test.scores || []) {
        const sid = score.studentId?._id?.toString() || score.studentId?.toString();
        if (sid) existingScoreMap.set(sid, score);
      }

      // Build entries: one row per student, pre-filled with existing score if any
      const entries = Array.from(studentMap.values()).map(student => {
        const existing = existingScoreMap.get(student._id.toString());
        return {
          studentId: student._id,
          name: student.personalDetails?.fullName || 'Unknown',
          rollno: student.rollno || '—',
          marksObtained: existing ? existing.marksObtained : '',
          attendanceStatus: existing ? existing.attendanceStatus : 'Present',
          remark: existing ? existing.remark || '' : '',
        };
      });

      // Sort by roll number
      entries.sort((a, b) => (a.rollno || 0) - (b.rollno || 0));

      setScoreEntries(entries);
      setIsEnteringScores(true);
    } catch (err) {
      toast.error('Failed to load students from batches');
      console.error(err);
    } finally {
      setLoadingScores(false);
    }
  };

  const handleScoreChange = (index, field, value) => {
    setScoreEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveScores = async () => {
    setScoreError('');
    // Validate
    for (const entry of scoreEntries) {
      if (entry.attendanceStatus === 'Present') {
        if (entry.marksObtained === '' || entry.marksObtained === null || entry.marksObtained === undefined) {
          setScoreError(`Please enter marks for ${entry.name}`);
          return;
        }
        const marks = Number(entry.marksObtained);
        if (isNaN(marks) || marks < 0 || marks > test.maxMarks) {
          setScoreError(`Marks for ${entry.name} must be between 0 and ${test.maxMarks}`);
          return;
        }
      }
    }

    setSavingScores(true);
    try {
      const scores = scoreEntries.map(entry => ({
        studentId: entry.studentId,
        marksObtained: entry.attendanceStatus === 'Absent' ? 0 : Number(entry.marksObtained),
        attendanceStatus: entry.attendanceStatus,
        remark: entry.remark || '',
      }));

      await addOrUpdateScores(testId, scores);
      toast.success('Scores saved successfully!');
      setIsEnteringScores(false);
      await fetchTest();
      await fetchStatistics();
    } catch (err) {
      setScoreError(err.message || 'Failed to save scores');
    } finally {
      setSavingScores(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this test? All scores will be permanently lost.')) return;
    try {
      await deleteTest(testId);
      toast.success('Test deleted');
      navigate('/tests');
    } catch (err) {
      toast.error(err.message || 'Failed to delete test');
    }
  };

  const getPercentageColor = (pct) => {
    const p = parseFloat(pct);
    if (p >= 75) return 'text-green-600';
    if (p >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2C3E50] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading test details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  if (!test) return null;

  const hasScores = test.scores && test.scores.length > 0;

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/tests"
          className="flex items-center gap-2 text-gray-500 hover:text-[#2C3E50] transition-colors font-medium"
        >
          <FaArrowLeft /> Back to Tests
        </Link>
        <div className="flex gap-3">
          {!isEnteringScores && (
            <button
              onClick={startEnteringScores}
              disabled={loadingScores}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2C3E50] hover:bg-[#34495E] text-white rounded-lg font-semibold shadow transition-all hover:scale-105 text-sm disabled:opacity-60"
            >
              {loadingScores ? (
                <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> Loading...</>
              ) : (
                <><FaEdit /> {hasScores ? 'Edit Scores' : 'Enter Scores'}</>
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold border border-red-200 transition-colors text-sm"
          >
            <FaTrash /> Delete Test
          </button>
        </div>
      </div>

      {/* Test Info Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#2C3E50] to-[#3498DB]"></div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50]">{test.title}</h1>
              {test.topic && (
                <p className="text-gray-500 mt-1">{test.topic}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
                <FaGraduationCap /> Class {test.classLevel}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold border border-purple-100">
                <FaBook /> {test.subject}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <FaCalendarAlt className="text-green-500 text-xl mx-auto mb-1" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(test.testDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <FaChartBar className="text-orange-500 text-xl mx-auto mb-1" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Max Marks</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{test.maxMarks}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <FaUserCheck className="text-blue-500 text-xl mx-auto mb-1" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Scored</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{test.scores?.length || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <FaBook className="text-purple-500 text-xl mx-auto mb-1" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Batches</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{test.applicableBatches?.length || 0}</p>
            </div>
          </div>

          {/* Applicable Batches */}
          {test.applicableBatches?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {test.applicableBatches.map(b => (
                <span key={b._id} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium border border-blue-100">
                  {b.name} <span className="text-blue-400">({b.standard})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Panel */}
      {statistics && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <FaChartBar className="text-orange-500" /> Test Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Average</p>
              <p className="text-2xl font-bold text-blue-700">{statistics.marksAnalysis?.average}</p>
              <p className="text-xs text-blue-400">/ {test.maxMarks}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Highest</p>
              <p className="text-2xl font-bold text-green-700">{statistics.marksAnalysis?.highest}</p>
              <p className="text-xs text-green-400">/ {test.maxMarks}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wide mb-1">Lowest</p>
              <p className="text-2xl font-bold text-red-700">{statistics.marksAnalysis?.lowest}</p>
              <p className="text-xs text-red-400">/ {test.maxMarks}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Pass %</p>
              <p className="text-2xl font-bold text-purple-700">{statistics.marksAnalysis?.passPercentage}%</p>
              <p className="text-xs text-purple-400">≥40% to pass</p>
            </div>
          </div>

          {/* Attendance summary */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <FaUserCheck className="text-green-500" />
              <span className="text-gray-600">Present: <strong>{statistics.attendance?.present}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaUserTimes className="text-red-500" />
              <span className="text-gray-600">Absent: <strong>{statistics.attendance?.absent}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaPercent className="text-blue-500" />
              <span className="text-gray-600">Passing Marks: <strong>{statistics.marksAnalysis?.passingMarks}</strong></span>
            </div>
          </div>

          {/* Toppers */}
          {statistics.toppers?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                <FaTrophy className="text-yellow-500" /> Topper{statistics.toppers.length > 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-3">
                {statistics.toppers.map(t => (
                  <div key={t.studentId} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <FaTrophy className="text-yellow-500 text-sm" />
                    <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                    <span className="text-xs text-gray-500">Roll #{t.rollno}</span>
                    <span className="text-sm font-bold text-yellow-700">{t.marks}/{test.maxMarks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {statsMessage && !statistics && hasScores && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
          {statsMessage}
        </div>
      )}

      {/* Score Entry / Scores Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2C3E50]">
            {isEnteringScores ? 'Enter / Edit Scores' : 'Student Scores'}
          </h2>
          {isEnteringScores && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEnteringScores(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSaveScores}
                disabled={savingScores}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
              >
                <FaSave /> {savingScores ? 'Saving...' : 'Save Scores'}
              </button>
            </div>
          )}
        </div>

        {scoreError && (
          <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
            {scoreError}
          </div>
        )}

        {/* Score Entry Table */}
        {isEnteringScores && (
          <div className="p-6">
            {scoreEntries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No students found in the applicable batches.</p>
                <p className="text-xs mt-1">Make sure students are assigned to the selected batches.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-lg">Student</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll No</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Attendance</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Marks <span className="text-gray-400 font-normal">(/ {test.maxMarks})</span>
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-lg">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scoreEntries.map((entry, idx) => (
                      <tr key={entry.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{entry.name}</td>
                        <td className="px-4 py-3 text-gray-500">{entry.rollno}</td>
                        <td className="px-4 py-3">
                          <select
                            value={entry.attendanceStatus}
                            onChange={e => handleScoreChange(idx, 'attendanceStatus', e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              entry.attendanceStatus === 'Present'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={test.maxMarks}
                            value={entry.marksObtained}
                            onChange={e => handleScoreChange(idx, 'marksObtained', e.target.value)}
                            disabled={entry.attendanceStatus === 'Absent'}
                            placeholder="0"
                            className="w-20 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={entry.remark}
                            onChange={e => handleScoreChange(idx, 'remark', e.target.value)}
                            placeholder="Optional remark"
                            className="w-full border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Read-only Scores Table */}
        {!isEnteringScores && (
          <div className="p-6">
            {!hasScores ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <FaChartBar className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No scores entered yet</p>
                <button
                  onClick={startEnteringScores}
                  className="mt-3 text-blue-600 hover:underline text-sm font-semibold"
                >
                  Enter scores now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-lg">#</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll No</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marks</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-lg">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...test.scores]
                      .sort((a, b) => b.marksObtained - a.marksObtained)
                      .map((score, idx) => {
                        const pct = score.attendanceStatus === 'Present'
                          ? ((score.marksObtained / test.maxMarks) * 100).toFixed(1)
                          : null;
                        return (
                          <tr key={score._id || idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {score.studentId?.personalDetails?.fullName || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {score.studentId?.rollno || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                score.attendanceStatus === 'Present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {score.attendanceStatus === 'Present'
                                  ? <FaUserCheck className="text-xs" />
                                  : <FaUserTimes className="text-xs" />}
                                {score.attendanceStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">
                              {score.attendanceStatus === 'Absent' ? (
                                <span className="text-gray-400 font-normal">—</span>
                              ) : (
                                <span>{score.marksObtained} <span className="text-gray-400 font-normal text-xs">/ {test.maxMarks}</span></span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {pct !== null ? (
                                <span className={`font-bold ${getPercentageColor(pct)}`}>{pct}%</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{score.remark || '—'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDetail;
