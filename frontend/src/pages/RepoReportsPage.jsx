// /pages/RepoReportsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RepoReportsPage = () => {
  const [repos, setRepos] = useState([]);
  const userId = JSON.parse(localStorage.getItem('user'))?.userId;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then(res => res.json())
      .then(data => setRepos(data.activities || []))
      .catch(err => console.error("Error loading repos:", err));
  }, [userId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Repositories & Reports</h1>
      {repos.length === 0 ? (
        <p>No repositories scanned yet.</p>
      ) : (
        <div className="space-y-4">
          {repos.map((repo, index) => (
            <div key={index} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{repo.repoName}</p>
                <p className="text-sm text-gray-500">
                  Scanned on {new Date(repo.createdAt).toLocaleString()} — {repo.issuesFound} issues
                </p>
              </div>
              <div className="space-x-3">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => navigate(`/report/${repo._id}`)}
                >
                  View Online
                </button>
                <a
                  href={`http://localhost:5000/api/report/pdf/${repo._id}`}
                  className="text-green-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepoReportsPage;
