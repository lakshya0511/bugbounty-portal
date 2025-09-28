"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * GitHub Issues Dashboard - White & Grey with Issue Detail Modal
 * 
 * Features:
 * - Pure white and grey color scheme
 * - Clickable issues that open detail modal
 * - Expandable network images in modal
 * - Clean, minimal design with proper visual hierarchy
 */

const LS_KEYS = {
  VALID: "gh_valid_issues_v1",
  INVALID: "gh_invalid_issues_v1",
  ISSUELESS: "gh_issueless_repos_v1",
};

// Image extraction utility
const extractImageFromContent = (content) => {
  if (!content || typeof content !== 'string') return null;
  
  const markdownImageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
  if (markdownImageMatch) return markdownImageMatch[1];
  
  const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
  if (htmlImageMatch) return htmlImageMatch[1];
  
  const directUrlMatch = content.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/i);
  if (directUrlMatch) return directUrlMatch[1];
  
  return null;
};

// Network Image Widget Component
const NetworkImageWidget = ({ issue, size = "md" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  useEffect(() => {
    const possibleImageUrl = extractImageFromContent(issue.body) || 
                            extractImageFromContent(issue.description) || 
                            extractImageFromContent(issue.content);
    
    setImageUrl(possibleImageUrl);
    setIsLoading(!possibleImageUrl);
  }, [issue]);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex-shrink-0 overflow-hidden`}>
      {imageUrl && !imageError ? (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={imageUrl}
            alt={`Preview for ${issue.title || 'issue'}`}
            fill
            className={`object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            unoptimized
            sizes={size === 'lg' ? '128px' : size === 'md' ? '80px' : '48px'}
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-center leading-tight">No Image</span>
        </div>
      )}
    </div>
  );
};

// Expandable Image Modal Component
const ExpandableImageModal = ({ imageUrl, isOpen, onClose, alt }) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75" onClick={onClose}>
      <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center text-xl font-bold"
        >
          ×
        </button>
        
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={800}
            height={600}
            className="max-w-full max-h-screen object-contain"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-96 h-64 bg-gray-100 border border-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Image could not be loaded</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Issue Detail Modal Component
const IssueDetailModal = ({ issue, isOpen, onClose, onMarkValid, onMarkInvalid }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  
  if (!isOpen || !issue) return null;

  const imageUrl = extractImageFromContent(issue.body) || 
                  extractImageFromContent(issue.description) || 
                  extractImageFromContent(issue.content);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="border-b border-gray-300 dark:border-gray-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Issue Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Issue Title & Image */}
            <div className="flex gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {issue.title || "(No title)"}
                </h3>
                
                {/* Metadata */}
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Repository:</span>
                    <span>{issue.repo || issue.name || "Unknown repository"}</span>
                  </div>
                  
                  <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                  
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Team:</span>
                    <span>{issue.reporterTeam || "Unknown team"}</span>
                  </div>
                  
                  {issue.reporter && (
                    <>
                      <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Reporter:</span>
                        <span className="font-mono">@{issue.reporter}</span>
                      </div>
                    </>
                  )}
                  
                  {issue.createdAt && (
                    <>
                      <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                        <span>
                          {new Date(issue.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expandable Image */}
              <div className="flex-shrink-0">
                <div 
                  className="cursor-pointer"
                  onClick={() => setExpandedImage(imageUrl)}
                >
                  <NetworkImageWidget issue={issue} size="lg" />
                </div>
                {imageUrl && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Click to expand
                  </p>
                )}
              </div>
            </div>

            {/* Issue Content */}
            {(issue.body || issue.description || issue.content) && (
              <>
                <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Description</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">
                      {issue.body || issue.description || issue.content || "No description available"}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-300 dark:border-gray-600 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => {
                onMarkValid(issue);
                onClose();
              }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 uppercase tracking-wide"
            >
              Mark Valid
            </button>
            <button
              onClick={() => {
                onMarkInvalid(issue);
                onClose();
              }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 uppercase tracking-wide"
            >
              Mark Invalid
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 uppercase tracking-wide"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Image Modal */}
      <ExpandableImageModal
        imageUrl={expandedImage}
        isOpen={!!expandedImage}
        onClose={() => setExpandedImage(null)}
        alt={`Expanded view - ${issue.title}`}
      />
    </>
  );
};

export default function Page() {
  const [issues, setIssues] = useState([]);
  const [issuelessRepos, setIssuelessRepos] = useState([]);
  const [validIssues, setValidIssues] = useState([]);
  const [invalidIssues, setInvalidIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const POLL_INTERVAL = 15000;

  // Helper functions
  const idsFrom = (arr) => (arr && arr.length ? arr.map((i) => i.id) : []);

  const uniqueById = (arr) => {
    const seen = new Set();
    const out = [];
    for (const it of arr) {
      if (!it || typeof it.id === "undefined") continue;
      if (!seen.has(it.id)) {
        seen.add(it.id);
        out.push(it);
      }
    }
    return out;
  };

  // Load persisted state and fetch
  useEffect(() => {
    try {
      const pValid = JSON.parse(localStorage.getItem(LS_KEYS.VALID) || "[]");
      const pInvalid = JSON.parse(localStorage.getItem(LS_KEYS.INVALID) || "[]");
      const pIssueless = JSON.parse(localStorage.getItem(LS_KEYS.ISSUELESS) || "[]");

      if (Array.isArray(pValid) && pValid.length) setValidIssues(pValid);
      if (Array.isArray(pInvalid) && pInvalid.length) setInvalidIssues(pInvalid);
      if (Array.isArray(pIssueless) && pIssueless.length) setIssuelessRepos(pIssueless);

      fetchIssues(pValid || [], pInvalid || []);
    } catch (err) {
      console.warn("Failed to load persisted lists:", err);
      fetchIssues();
    }
  }, []);

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.VALID, JSON.stringify(validIssues));
      localStorage.setItem(LS_KEYS.INVALID, JSON.stringify(invalidIssues));
      localStorage.setItem(LS_KEYS.ISSUELESS, JSON.stringify(issuelessRepos));
    } catch (err) {
      console.warn("Failed to persist lists:", err);
    }
  }, [validIssues, invalidIssues, issuelessRepos]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => fetchIssues(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [validIssues, invalidIssues]);

  async function fetchIssues(validOverride = null, invalidOverride = null) {
    setError("");
    try {
      const validArr = Array.isArray(validOverride) ? validOverride : validIssues;
      const invalidArr = Array.isArray(invalidOverride) ? invalidOverride : invalidIssues;

      const validIds = idsFrom(validArr).join(",");
      const invalidIds = idsFrom(invalidArr).join(",");

      const q = new URLSearchParams();
      if (validIds) q.set("validIds", validIds);
      if (invalidIds) q.set("invalidIds", invalidIds);

      const res = await fetch(`/api/issues${q.toString() ? `?${q.toString()}` : ""}`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${text}`);
      }
      const data = await res.json();

      if (!data || !("issues" in data) || !("issuelessRepos" in data)) {
        setError("Invalid data received from server");
        setLoading(false);
        return;
      }

      const reposWithIssuesSet = new Set((data.issues || []).map((i) => i.repo).filter(Boolean));

      setIssuelessRepos((prev) => {
        const prevMap = new Map(prev.map((r) => [r.name, r]));
        for (const name of reposWithIssuesSet) {
          if (prevMap.has(name)) prevMap.delete(name);
        }
        for (const r of data.issuelessRepos || []) {
          if (!prevMap.has(r.name) && !reposWithIssuesSet.has(r.name)) {
            prevMap.set(r.name, r);
          }
        }
        return Array.from(prevMap.values());
      });

      setIssues((prev) => {
        const existingIdSet = new Set([
          ...prev.map((i) => i.id),
          ...validIssues.map((i) => i.id),
          ...invalidIssues.map((i) => i.id),
        ]);
        const newIssues = (data.issues || []).filter((i) => !existingIdSet.has(i.id));
        if (!newIssues.length) return prev;
        const merged = [...prev, ...newIssues];
        return uniqueById(merged);
      });
    } catch (err) {
      console.error("fetchIssues error:", err);
      setError(typeof err === "string" ? err : err.message || "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }

  const markValid = (issue) => {
    setValidIssues((prev) => uniqueById([...prev, issue]));
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const markInvalid = (issue) => {
    setInvalidIssues((prev) => uniqueById([...prev, issue]));
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const closeIssueModal = () => {
    setSelectedIssue(null);
    setIsModalOpen(false);
  };

  const exportCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const rows = [headers.join(",")];
    for (const row of data) {
      const vals = headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`);
      rows.push(vals.join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 border border-gray-300 dark:border-gray-600">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading GitHub issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 dark:text-gray-400 text-lg">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Issues</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 text-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border hover:bg-gray-700 dark:hover:bg-gray-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              GitHub Issues Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and categorize repository issues with detailed views • Auto-refreshes every 15 seconds
            </p>
          </div>
        </header>

        {/* Stats Bar */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                  {issues.length}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Pending Review
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-300 dark:before:bg-gray-600 md:before:block before:hidden">
                <div className="text-2xl font-light text-gray-700 dark:text-gray-300 mb-1">
                  {validIssues.length}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Valid Issues
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-300 dark:before:bg-gray-600 md:before:block before:hidden">
                <div className="text-2xl font-light text-gray-700 dark:text-gray-300 mb-1">
                  {invalidIssues.length}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Invalid Issues
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-300 dark:before:bg-gray-600 md:before:block before:hidden">
                <div className="text-2xl font-light text-gray-500 dark:text-gray-400 mb-1">
                  {issuelessRepos.length}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Clean Repos
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Controls */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-end gap-3">
            <button
              onClick={() => exportCSV(validIssues, "valid_issues.csv")}
              className="text-xs px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 uppercase tracking-wide"
            >
              Export Valid
            </button>
            <button
              onClick={() => exportCSV(invalidIssues, "invalid_issues.csv")}
              className="text-xs px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 uppercase tracking-wide"
            >
              Export Invalid
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="bg-gray-100 dark:bg-gray-900 px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Pending Issues Section */}
            <section>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Pending Review
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                {issues.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-600 dark:text-gray-400 text-sm">
                    No pending issues to review
                  </div>
                ) : (
                  <div className="divide-y divide-gray-300 dark:divide-gray-600">
                    {issues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="group px-6 py-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-start gap-4">
                          <NetworkImageWidget issue={issue} />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-gray-700 dark:group-hover:text-gray-200">
                              {issue.title || "(No title)"}
                            </h3>
                            
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                              <span className="font-medium">
                                {issue.repo || issue.name || "Unknown repository"}
                              </span>
                              
                              <div className="w-px h-4 bg-gray-400 dark:bg-gray-500"></div>
                              
                              <span>
                                {issue.reporterTeam || "Unknown team"}
                              </span>
                              
                              {issue.reporter && (
                                <>
                                  <div className="w-px h-4 bg-gray-400 dark:bg-gray-500"></div>
                                  <span className="font-mono text-xs">
                                    @{issue.reporter}
                                  </span>
                                </>
                              )}
                              
                              {issue.createdAt && (
                                <>
                                  <div className="w-px h-4 bg-gray-400 dark:bg-gray-500"></div>
                                  <span className="text-xs">
                                    {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view details
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Horizontal Divider */}
            <hr className="border-gray-400 dark:border-gray-500" />

            {/* Valid Issues Section */}
            <section>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Valid Issues
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {validIssues.length} {validIssues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                {validIssues.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No valid issues yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-300 dark:divide-gray-600">
                    {validIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-center gap-4">
                          <NetworkImageWidget issue={issue} size="sm" />
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                              {issue.title || "(No title)"}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {issue.repo || issue.name} • {issue.reporterTeam || "Unknown team"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Horizontal Divider */}
            <hr className="border-gray-400 dark:border-gray-500" />

            {/* Invalid Issues Section */}
            <section>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Invalid Issues
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {invalidIssues.length} {invalidIssues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                {invalidIssues.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No invalid issues yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-300 dark:divide-gray-600">
                    {invalidIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-center gap-4">
                          <NetworkImageWidget issue={issue} size="sm" />
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                              {issue.title || "(No title)"}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {issue.repo || issue.name} • {issue.reporterTeam || "Unknown team"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Horizontal Divider */}
            <hr className="border-gray-400 dark:border-gray-500" />

            {/* Clean Repositories Section */}
            <section>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Clean Repositories
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {issuelessRepos.length} {issuelessRepos.length === 1 ? 'repository' : 'repositories'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                {issuelessRepos.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No clean repositories found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {issuelessRepos.map((repo, index) => (
                      <div 
                        key={repo.name} 
                        className={`px-6 py-4 ${
                          index % 4 !== 3 ? 'border-r border-gray-300 dark:border-gray-600' : ''
                        } ${
                          Math.floor(index / 4) !== Math.floor((issuelessRepos.length - 1) / 4) ? 'border-b border-gray-300 dark:border-gray-600' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {repo.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          No issues
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onClose={closeIssueModal}
        onMarkValid={markValid}
        onMarkInvalid={markInvalid}
      />
    </div>
  );
}
