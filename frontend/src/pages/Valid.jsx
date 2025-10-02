import React, { useEffect, useState } from "react";
import IssueList from "../components/IssueList";
import { getAllIssues } from "../services/issueService";

const Valid = () => {
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    const data = await getAllIssues();
    setIssues(data.filter((i) => i.status === "valid"));
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Valid Issues</h1>
      <IssueList issues={issues} refresh={() => {}} />
    </div>
  );
};

export default Valid;
