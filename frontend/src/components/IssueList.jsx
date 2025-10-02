import React, { useState } from "react";
import { updateIssueStatus } from "../services/issueService";
import Papa from "papaparse";
import "./IssueList.css";

const IssueList = ({ issues, refresh }) => {
  const [modalContent, setModalContent] = useState("");
  const [modalType, setModalType] = useState(""); // 'text' or 'image'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract images
  const extractImages = (body) => {
    if (!body) return [];
    const urls = [];
    const mdRegex = /!\[.*?\]\((.*?)\)/g;
    [...body.matchAll(mdRegex)].forEach((m) => urls.push(m[1]));
    const htmlRegex = /<img[^>]+src=["'](.*?)["']/g;
    [...body.matchAll(htmlRegex)].forEach((m) => urls.push(m[1]));
    return urls;
  };

  // Extract text only
  const extractTextOnly = (body) => {
    if (!body) return "";
    let text = body.replace(/!\[.*?\]\(.*?\)/g, "");
    text = text.replace(/<img[^>]+>/g, "");
    return text.trim();
  };

  const handleMark = async (id, status) => {
    await updateIssueStatus(id, status);
    refresh();
  };

  const openModal = (content, type) => {
    setModalContent(content);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent("");
    setModalType("");
  };

  const exportCSV = () => {
    const dataToExport = issues
      .filter((issue) => ["valid", "invalid"].includes(issue.status))
      .map(({ body, ...rest }) => rest);

    if (!dataToExport.length) {
      alert("No valid/invalid issues to export!");
      return;
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "issues_page_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="il-container">
      <button onClick={exportCSV} className="il-btn il-btn-export">
        Export Page CSV
      </button>

      <table className="il-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Repository</th>
            <th>Reporter</th>
            <th>Body</th>
            <th>Link</th>
            <th>Screenshots</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const images = extractImages(issue.body);
            const textOnly = extractTextOnly(issue.body);

            return (
              <tr key={issue._id}>
                <td>{issue.title}</td>
                <td>{issue.repo}</td>
                <td>
                  <div className="il-avatar-reporter">
                    <span role="img" aria-label="reporter" className="il-avatar-icon">
                      🧑‍💻
                    </span>
                    <span>{issue.reporter}</span>
                  </div>
                </td>
                <td>
                  {textOnly ? (
                    <span className="il-desc-link" onClick={() => openModal(textOnly, "text")}>
                      View Description
                    </span>
                  ) : (
                    <span className="il-no-desc">—</span>
                  )}
                </td>
                <td>
                  <a href={issue.url} target="_blank" rel="noopener noreferrer" className="il-gh-link">
                    View on GitHub
                  </a>
                </td>
                <td>
                  {images.length > 0 ? (
                    images.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`screenshot-${idx}`}
                        className="il-thumb"
                        onClick={() => openModal(url, "image")}
                      />
                    ))
                  ) : (
                    <span className="il-no-img">No Image</span>
                  )}
                </td>
                <td>
                  {!issue.status || issue.status === "unreviewed" ? (
                    <div className="il-btns">
                      <button onClick={() => handleMark(issue._id, "valid")} className="il-btn il-btn-valid">
                        ✔ Valid
                      </button>
                      <button onClick={() => handleMark(issue._id, "invalid")} className="il-btn il-btn-invalid">
                        ✖ Invalid
                      </button>
                    </div>
                  ) : (
                    <span className="il-status">✅ {issue.status.toUpperCase()}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="il-modal-backdrop" onClick={closeModal}>
          <div className="il-modal" onClick={(e) => e.stopPropagation()}>
            {modalType === "text" ? (
              <>
                <h3 className="il-modal-title">Issue Description</h3>
                <p className="il-modal-content">{modalContent}</p>
              </>
            ) : (
              <img src={modalContent} alt="screenshot" className="il-modal-img" />
            )}
            <button className="il-btn il-btn-close" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueList;
