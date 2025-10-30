import React, { useEffect, useState } from "react";
import ReviewedIssueList from "../components/ReviewedIssueList";
import { getAllIssues } from "../services/issueService";

const Valid = () => {
  const [issues, setIssues] = useState([]);
  const [token, setToken] = useState(null);

  // 🪪 Load token from localStorage once
  useEffect(() => {
    const t = localStorage.getItem("bb_token");
    setToken(t);
  }, []);

  // 🔁 Fetch only after token is ready
  useEffect(() => {
    if (!token) return;

    const fetchIssues = async () => {
      try {
        const data = await getAllIssues(token);
        console.log("✅ All issues from backend:", data);
        setIssues(data.filter((i) => i.status === "valid"));
      } catch (err) {
        console.error("❌ Failed to load valid issues:", err);
      }
    };

    fetchIssues();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Valid Issues</h1>
      <ReviewedIssueList issues={issues} />
    </div>
  );
};

export default Valid;
