import React, { useState } from "react";
import Papa from "papaparse";
import "./IssueList.css";

const ReviewedIssueList = ({ issues = [], user: propUser }) => {
  const [modal, setModal] = useState({ open: false, type: "", content: "" });

  // ✅ Load user + token (for export if needed)
  const [user] = React.useMemo(() => {
    const storedUser =
      propUser ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("bb_user")) || null;
        } catch {
          return null;
        }
      })();
    return [storedUser];
  }, [propUser]);

  const extractImages = (body = "") => {
    const urls = [];
    const mdRegex = /!\[.*?\]\((.*?)\)/g;
    const htmlRegex = /<img[^>]+src=["'](.*?)["']/g;
    [...body.matchAll(mdRegex)].forEach((m) => urls.push(m[1]));
    [...body.matchAll(htmlRegex)].forEach((m) => urls.push(m[1]));
    return urls;
  };

  const extractText = (body = "") =>
    body.replace(/!\[.*?\]\(.*?\)/g, "").replace(/<img[^>]+>/g, "").trim();

  const exportCSV = () => {
    if (!issues.length) return alert("No reviewed issues to export!");
    const data = issues.map(({ body, ...rest }) => rest);
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reviewed_issues.csv";
    link.click();
  };

  return (
    <div className="il-container">
      {user?.role === "reviewer" && (
        <button onClick={exportCSV} className="il-btn il-btn-export">
          Export CSV
        </button>
      )}

      <table className="il-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Repository</th>
            <th>Reporter</th>
            <th>Body</th>
            <th>Link</th>
            <th>Screenshots</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No issues found.
              </td>
            </tr>
          ) : (
            issues.map((issue) => {
              const images = extractImages(issue.body);
              const text = extractText(issue.body);

              return (
                <tr key={issue._id}>
                  <td>{issue.title}</td>
                  <td>{issue.repo}</td>
                  <td>{issue.reporter}</td>
                  <td>
                    {text ? (
                      <button
                        className="il-desc-btn"
                        onClick={() =>
                          setModal({ open: true, type: "text", content: text })
                        }
                      >
                        View Description
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="il-gh-link"
                    >
                      View on GitHub
                    </a>
                  </td>
                  <td>
                    {images.length > 0
                      ? images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="screenshot"
                            className="il-thumb"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "image",
                                content: src,
                              })
                            }
                          />
                        ))
                      : "No Image"}
                  </td>
                  <td>
                    <span className={`il-status ${issue.status}`}>
                      {issue.status?.toUpperCase() || "UNREVIEWED"}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modal.open && (
        <div
          className="il-modal-backdrop"
          onClick={() => setModal({ open: false })}
        >
          <div className="il-modal" onClick={(e) => e.stopPropagation()}>
            {modal.type === "text" ? (
              <>
                <h3>Description</h3>
                <p>{modal.content}</p>
              </>
            ) : (
              <img
                src={modal.content}
                alt="Screenshot"
                className="il-modal-img"
              />
            )}
            <button
              onClick={() => setModal({ open: false })}
              className="il-btn il-btn-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewedIssueList;
