"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [issues, setIssues] = useState([]);
  const [marked, setMarked] = useState({});
  const [filter, setFilter] = useState("ALL"); // ALL, VALID, INVALID
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
          setIssues([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch issues");
        setLoading(false);
      });
  }, []);

  const toggleMark = (id) => {
    setMarked((prev) => ({
      ...prev,
      [id]: prev[id] === "VALID" ? "INVALID" : "VALID",
    }));
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === "ALL") return true;
    return marked[issue.id] === filter;
  });

  if (loading) return <div className="p-8">Loading issues...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">GitHub Issues - Team View</h1>

      <div className="mb-4">
        <button
          className={`px-3 py-1 mr-2 rounded ${
            filter === "ALL" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("ALL")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 mr-2 rounded ${
            filter === "VALID" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("VALID")}
        >
          Valid
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === "INVALID" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("INVALID")}
        >
          Invalid
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Issue Title</th>
            <th className="border px-2 py-1">Raised By (Team/User)</th>
            <th className="border px-2 py-1">On Team (Repo)</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map((issue) => (
            <tr key={issue.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{issue.title}</td>
              <td className="border px-2 py-1">
                {issue.reporterTeam} ({issue.reporter})
              </td>
              <td className="border px-2 py-1">{issue.repo}</td>
              <td className="border px-2 py-1">{marked[issue.id] || "UNMARKED"}</td>
              <td className="border px-2 py-1">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => toggleMark(issue.id)}
                >
                  Toggle Valid/Invalid
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredIssues.length === 0 && <p className="mt-4">No issues in this category</p>}
    </div>
  );
}
