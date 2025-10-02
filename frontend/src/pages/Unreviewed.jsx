import React, { useEffect, useState } from "react";
import IssueList from "../components/IssueList";
import { getAllIssues } from "../services/issueService";

const Unreviewed = () => {
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    const data = await getAllIssues();
    setIssues(data.filter((i) => !i.status || i.status === "unreviewed"));
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Unreviewed Issues</h1>
      <IssueList issues={issues} refresh={fetchIssues} />
    </div>
  );
};

export default Unreviewed;
