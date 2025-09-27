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
        if (Array.isArray(data)) {
          // Map GitHub created_at to raisedAt
          const formattedData = data.map((issue) => ({
            ...issue,
            raisedAt: issue.created_at
              ? new Date(issue.created_at).toLocaleString()
              : new Date().toLocaleString(),
          }));
          setIssues(formattedData);
        } else {
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

  // Mark as valid/invalid
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
    if (!data.length) return;

    const headers = ["Title", "Reporter", "Team", "Repo", "Raised At"];
    const csvRows = [
      headers.join(","), // header row
      ...data.map((row) =>
        [
          row.title,
          row.reporter,
          row.reporterTeam,
          row.repo,
          row.raisedAt,
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-700 dark:text-gray-300">
        Loading issues...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );

  // Table renderer
  const renderTable = (data, includeActions = false) => (
    <table className="min-w-full border-collapse mb-8">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <th className="px-4 py-2 border">Title</th>
          <th className="px-4 py-2 border">Reporter</th>
          <th className="px-4 py-2 border">Team</th>
          <th className="px-4 py-2 border">Repo</th>
          <th className="px-4 py-2 border">Raised At</th>
          {includeActions && <th className="px-4 py-2 border">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td
              colSpan={includeActions ? 6 : 5}
              className="px-4 py-3 text-center text-gray-500 dark:text-gray-400"
            >
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
            <td className="px-4 py-3 border">{issue.reporter}</td>
            <td className="px-4 py-3 border">{issue.reporterTeam}</td>
            <td className="px-4 py-3 border">{issue.repo}</td>
            <td className="px-4 py-3 border">{issue.raisedAt}</td>
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        GitHub Issues Dashboard
      </h1>

      {/* Export buttons */}
      <div className="mb-6 flex space-x-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
          onClick={() => exportCSV(validIssues, "valid-issues.csv")}
        >
          Export Valid CSV
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          onClick={() => exportCSV(invalidIssues, "invalid-issues.csv")}
        >
          Export Invalid CSV
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Unmarked Issues
        </h2>
        {renderTable(issues, true)}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-400">
          Valid Issues
        </h2>
        {renderTable(validIssues)}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">
          Invalid Issues
        </h2>
        {renderTable(invalidIssues)}
      </section>
    </div>
  );
}
