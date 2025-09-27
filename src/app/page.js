"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [issues, setIssues] = useState([]);
  const [issuelessRepos, setIssuelessRepos] = useState([]);
  const [validIssues, setValidIssues] = useState([]);
  const [invalidIssues, setInvalidIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Poll interval in milliseconds (changeable)
  const POLL_INTERVAL = 15000; // 15s default, can be 10–15 min in production

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const data = await res.json();
        if (data.issues) {
          setIssues(data.issues);
          setIssuelessRepos(data.issuelessRepos);
        } else {
          console.error("GitHub API returned error:", data);
          setError(data.message || "Failed to load issues");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch issues");
      }
      setLoading(false);
    };

    fetchIssues();
    const interval = setInterval(fetchIssues, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const markValid = (issue) => {
    setValidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const markInvalid = (issue) => {
    setInvalidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    data.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const renderTable = (data, includeActions = false) => (
    <table className="min-w-full border-collapse mb-8">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <th className="px-4 py-2 border">Title / Repo</th>
          <th className="px-4 py-2 border">Reporter (Team/User)</th>
          {includeActions && <th className="px-4 py-2 border">Actions</th>}
          <th className="px-4 py-2 border">Created At</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={includeActions ? 4 : 3} className="px-4 py-3 text-center text-gray-500">
              No issues / repos
            </td>
          </tr>
        )}
        {data.map((issue) => (
          <tr
            key={issue.id || issue.name}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg duration-200 rounded-lg"
          >
            <td className="px-4 py-3 border">
              {issue.title || "(No issues)"} {issue.repo ? ` / ${issue.repo}` : issue.name ? ` / ${issue.name}` : ""}
            </td>
            <td className="px-4 py-3 border">
              {issue.reporterTeam || ""} {issue.reporter ? `(${issue.reporter})` : ""}
            </td>
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
            <td className="px-4 py-3 border">
              {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "-"}
            </td>
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

      <section className="mb-6 flex justify-end space-x-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md shadow-md"
          onClick={() => exportCSV(validIssues, "valid_issues.csv")}
        >
          Export Valid CSV
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-md"
          onClick={() => exportCSV(invalidIssues, "invalid_issues.csv")}
        >
          Export Invalid CSV
        </button>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Unmarked Issues</h2>
        {renderTable(issues, true)}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-400">Valid Issues</h2>
        {renderTable(validIssues)}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">Invalid Issues</h2>
        {renderTable(invalidIssues)}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400">Repositories with No Issues</h2>
        {renderTable(issuelessRepos)}
      </section>
    </div>
  );
}
