import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  FileX,
  Image,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generatePdfReport } from "../utils/generatePdfReport";

const ScanReport = () => {
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [history, setHistory] = useState([]);
  const { state } = useLocation();
  const { repo } = state || {};
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.activities || []);
        })
        .catch((err) => console.error("⚠️ Failed to load history:", err));
    }
  }, [userId]);

  const scanSteps = [
    { label: "Cloning repository", percent: 25 },
    { label: "Analyzing files", percent: 60 },
    { label: "Saving results", percent: 90 },
    { label: "Finalizing", percent: 100 },
  ];

  const simulateScanProgress = async () => {
    for (let i = 0; i < scanSteps.length; i++) {
      setCurrentStep(scanSteps[i].label);
      setScanProgress(scanSteps[i].percent);
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  };

  const handleStartScan = async () => {
    setLoading(true);
    setScanProgress(0);
    setCurrentStep('');
    try {
      simulateScanProgress(); // Run in parallel

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repo.name,
          repoOwner: repo.owner.login,
          cloneUrl: repo.clone_url,
          userId,
        }),
      });
      const data = await res.json();
      setScanResult(data);

      await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          repoName: repo.name,
          report: data,
          scannedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('❌ Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${repo.name}-scan-report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scanCategories = [
    { icon: FileX, label: 'Unused Files', key: 'unusedFiles', enabled: !!scanResult },
    { icon: Search, label: 'Unused Imports', key: 'unusedImports', enabled: !!scanResult },
    { icon: Image, label: 'Unused Assets', key: 'unusedAssets', enabled: false },
    { icon: Package, label: 'Duplicate Files', key: 'duplicateFiles', enabled: false },
    { icon: AlertTriangle, label: 'Large Files', key: 'largeFiles', enabled: false },
    { icon: CheckCircle, label: 'Security Scan', key: 'securityIssues', enabled: false },
  ];

  if (!repo) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">No repository selected</h2>
        <p>Please return to the dashboard and select a repository to scan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repository Cleanup</h1>
            <p className="text-gray-600">
              Analyzing: <span className="font-medium">{repo.name}</span>
            </p>
          </div>
        </div>

        {/* Repo Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{repo.name}</h2>
                <p className="text-gray-600">
                  Last scanned: {scanResult ? 'Just now' : 'Not yet'}
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Scan Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cleanup Scan</h3>
            <div className="flex gap-4">
              {scanResult && (
                <button
                  onClick={() =>
                    generatePdfReport({
                      repoName: repo.name,
                      scanType: "Full Scan",
                      issuesFound: scanResult.unusedFiles?.length || 0,
                      issues: scanResult.unusedFiles,
                      createdAt: new Date().toISOString(),
                    })
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              )}
              <button
                onClick={handleStartScan}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? 'Scanning...' : 'Start Deep Scan'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {loading && (
            <>
              <p className="text-sm text-gray-600 mb-1">⏳ {currentStep}</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </>
          )}

          {/* Scan cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {scanCategories.map((option) => (
              <div
                key={option.key}
                onClick={() => option.enabled && setActiveCategory(option.key)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  option.enabled
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <option.icon
                  className={`w-5 h-5 mb-2 ${
                    option.enabled ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <p
                  className={`font-medium ${
                    option.enabled ? 'text-green-900' : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Category Output */}
          {activeCategory && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">
                {scanCategories.find(c => c.key === activeCategory)?.label}
              </h4>
              {!scanResult ? (
                <p className="text-gray-500">Run a scan to see results.</p>
              ) : scanResult[activeCategory]?.length === 0 ? (
                <p className="text-green-600">✅ No issues found.</p>
              ) : (
                <ul className="list-disc pl-6 space-y-1 max-h-64 overflow-y-auto text-sm text-gray-700">
                  {scanResult[activeCategory].map((item, index) => (
                    <li key={index}>
                      {typeof item === 'string'
                        ? item
                        : item.file + (item.description ? ` — ${item.description}` : '')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scan History</h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No scans yet.</p>
            ) : (
              history.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{scan.scanType}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{scan.issuesFound} issues</p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanReport;
