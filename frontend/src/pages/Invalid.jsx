import React, { useEffect, useState } from "react";
import ReviewedIssueList from "../components/ReviewedIssueList";
import { getAllIssues } from "../services/issueService";

const Invalid = () => {
  const [issues, setIssues] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("bb_token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchIssues = async () => {
      try {
        const data = await getAllIssues(token);
        console.log("✅ All issues from backend:", data);
        setIssues(data.filter((i) => i.status === "invalid"));
      } catch (err) {
        console.error("❌ Failed to load invalid issues:", err);
      }
    };

    fetchIssues();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Invalid Issues</h1>
      <ReviewedIssueList issues={issues} />
    </div>
  );
};

export default Invalid;
