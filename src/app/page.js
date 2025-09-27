"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [issues, setIssues] = useState([]);
  const [validIssues, setValidIssues] = useState([]);
  const [invalidIssues, setInvalidIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch issues from API
  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
        else {
          console.error("GitHub API returned error:", data);
          setError(data.message || "Failed to load issues");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch issues");
        setLoading(false);
      });
  }, []);

  // Mark as valid or invalid
  const markValid = (issue) => {
    setValidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const markInvalid = (issue) => {
    setInvalidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  // Export CSV
  const exportCSV = (data, filename) => {
    const headers = ["Title", "Reporter (Team/User)", "Repo", "Created At", "URL"];
    const rows = data.map((i) => [i.title, `${i.reporterTeam} (${i.reporter})`, i.repo, new Date(i.raisedAt).toLocaleString(), i.url]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (data, includeActions = false) => (
    <table className="min-w-full border-collapse mb-8">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <th className="px-4 py-2 border">Title</th>
          <th className="px-4 py-2 border">Reporter (Team/User)</th>
          <th className="px-4 py-2 border">Repo</th>
          <th className="px-4 py-2 border">Created At</th>
          {includeActions && <th className="px-4 py-2 border">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={includeActions ? 5 : 4} className="px-4 py-3 text-center text-gray-500">
              No issues
            </td>
          </tr>
        )}
        {data.map((issue) => (
          <tr
            key={issue.id}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg duration-200 rounded-lg"
          >
            <td className="px-4 py-3 border">{issue.title}</td>
            <td className="px-4 py-3 border">{issue.reporterTeam} ({issue.reporter})</td>
            <td className="px-4 py-3 border">{issue.repo}</td>
            <td className="px-4 py-3 border">{new Date(issue.raisedAt).toLocaleString()}</td>
            {includeActions && (
              <td className="px-4 py-3 border space-x-2">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md shadow-md transition transform hover:scale-105"
                  onClick={() => markValid(issue)}
                >
                  Mark Valid
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-md transition transform hover:scale-105"
                  onClick={() => markInvalid(issue)}
                >
                  Mark Invalid
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) return <div className="p-8 text-center text-gray-700">Loading issues...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">GitHub Issues Dashboard</h1>

      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Unmarked Issues</h2>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded shadow-md hover:bg-blue-600"
          onClick={() => exportCSV(issues, "unmarked_issues.csv")}
        >
          Export CSV
        </button>
      </section>
      {renderTable(issues, true)}

      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-2 text-green-700 dark:text-green-400">Valid Issues</h2>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded shadow-md hover:bg-green-600"
          onClick={() => exportCSV(validIssues, "valid_issues.csv")}
        >
          Export CSV
        </button>
      </section>
      {renderTable(validIssues)}

      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-2 text-red-700 dark:text-red-400">Invalid Issues</h2>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600"
          onClick={() => exportCSV(invalidIssues, "invalid_issues.csv")}
        >
          Export CSV
        </button>
      </section>
      {renderTable(invalidIssues)}
    </div>
  );
}
