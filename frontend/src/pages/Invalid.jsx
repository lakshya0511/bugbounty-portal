import React, { useEffect, useState } from "react";
import IssueList from "../components/IssueList";
import { getAllIssues } from "../services/issueService";

const Invalid = () => {
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    const data = await getAllIssues();
    setIssues(data.filter((i) => i.status === "invalid"));
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Invalid Issues</h1>
      <IssueList issues={issues} refresh={() => {}} />
    </div>
  );
};

export default Invalid;
