"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [issues, setIssues] = useState([]);
  const [validIssues, setValidIssues] = useState([]);
  const [invalidIssues, setInvalidIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const markValid = (issue) => {
    setValidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const markInvalid = (issue) => {
    setInvalidIssues((prev) => [...prev, issue]);
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  if (loading) return <div className="p-8 text-center text-gray-700">Loading issues...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const renderTable = (data, includeActions = false) => (
    <table className="min-w-full border-collapse mb-8">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
          <th className="px-4 py-2 border">Title</th>
          <th className="px-4 py-2 border">Reporter (Team/User)</th>
          <th className="px-4 py-2 border">Repo</th>
          {includeActions && <th className="px-4 py-2 border">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={includeActions ? 4 : 3} className="px-4 py-3 text-center text-gray-500">
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
            <td className="px-4 py-3 border">
              {issue.reporterTeam} ({issue.reporter})
            </td>
            <td className="px-4 py-3 border">{issue.repo}</td>
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">GitHub Issues Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Unmarked Issues</h2>
        {renderTable(issues, true)}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-400">Valid Issues</h2>
        {renderTable(validIssues)}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-700 dark:text-red-400">Invalid Issues</h2>
        {renderTable(invalidIssues)}
      </section>
    </div>
  );
}
