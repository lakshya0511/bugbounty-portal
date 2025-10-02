import React, { useState } from "react";
import { addIssue } from "../services/issueService";

const IssueForm = ({ onIssueAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert("Please fill all fields");

    setLoading(true);
    const success = await addIssue({ title, description });
    setLoading(false);

    if (success) {
      setTitle("");
      setDescription("");
      onIssueAdded(); // refresh the list
    } else {
      alert("Failed to add issue");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h2>Add New Issue</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: "10px", padding: "5px", width: "200px" }}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginRight: "10px", padding: "5px", width: "300px" }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Issue"}
      </button>
    </form>
  );
};

export default IssueForm; // ✅ default export
