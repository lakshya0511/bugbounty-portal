import React, { useEffect, useState } from "react";
import IssueList from "../components/IssueList";
import { getMyIssues } from "../services/issueService";
import { useAuth } from "../context/AuthContext";

const MyIssues = () => {
  const { token } = useAuth();
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    try {
      const data = await getMyIssues(token);
      setIssues(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Reports</h1>
      <IssueList issues={issues} refresh={fetchIssues} />
    </div>
  );
};

export default MyIssues;
