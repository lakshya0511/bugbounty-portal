"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * Manipal Hackathon '25 Bug Bounty Tracker - Dark Green Theme
 * 
 * Features:
 * - Dark green color scheme with high contrast for accessibility
 * - Full-page layout utilization
 * - Support for multiple images per issue
 * - Image gallery in modal view
 * - Direct GitHub issue links
 */

const LS_KEYS = {
  VALID: "gh_valid_issues_v1",
  INVALID: "gh_invalid_issues_v1",
  ISSUELESS: "gh_issueless_repos_v1",
};

// Enhanced image extraction utility for multiple images
const extractAllImagesFromContent = (content) => {
  if (!content || typeof content !== 'string') return [];
  
  const images = [];
  
  // Find all markdown images: ![alt](url)
  const markdownMatches = content.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g);
  for (const match of markdownMatches) {
    images.push(match[1]);
  }
  
  // Find all HTML img tags
  const htmlMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/g);
  for (const match of htmlMatches) {
    images.push(match[1]);
  }
  
  // Find all direct image URLs
  const directMatches = content.matchAll(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi);
  for (const match of directMatches) {
    images.push(match[1]);
  }
  
  // Remove duplicates and return
  return [...new Set(images)];
};

// Get first image for preview
const getPreviewImage = (issue) => {
  const allImages = extractAllImagesFromContent(issue.body) || 
                   extractAllImagesFromContent(issue.description) || 
                   extractAllImagesFromContent(issue.content);
  return allImages.length > 0 ? allImages[0] : null;
};

// Get GitHub issue URL
const getGitHubIssueUrl = (issue) => {
  if (issue.html_url) return issue.html_url;
  if (issue.repo && issue.number) {
    return `https://github.com/${issue.repo}/issues/${issue.number}`;
  }
  if (issue.repo && issue.id) {
    return `https://github.com/${issue.repo}/issues/${issue.id}`;
  }
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
    const previewImage = getPreviewImage(issue);
    setImageUrl(previewImage);
    setIsLoading(!previewImage);
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
    <div className={`${sizeClasses[size]} bg-green-800 dark:bg-green-950 border border-green-700 dark:border-green-800 flex-shrink-0 overflow-hidden rounded`}>
      {imageUrl && !imageError ? (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-green-400 border-t-green-200 rounded-full animate-spin"></div>
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
        <div className="w-full h-full flex flex-col items-center justify-center text-green-300 dark:text-green-400">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-center leading-tight">No Image</span>
        </div>
      )}
    </div>
  );
};

// Image Gallery Modal Component
const ImageGalleryModal = ({ images, isOpen, onClose, currentIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  if (!isOpen || !images.length) return null;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-green-950 bg-opacity-95" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-green-100 text-green-900 hover:bg-green-200 flex items-center justify-center text-2xl font-bold rounded-full"
        >
          ×
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-100 text-green-900 hover:bg-green-200 flex items-center justify-center text-2xl font-bold rounded-full"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-100 text-green-900 hover:bg-green-200 flex items-center justify-center text-2xl font-bold rounded-full"
            >
              ›
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="relative max-w-4xl max-h-full">
          <Image
            src={images[activeIndex]}
            alt={`Image ${activeIndex + 1} of ${images.length}`}
            width={800}
            height={600}
            className="max-w-full max-h-screen object-contain"
            unoptimized
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-900 px-4 py-2 rounded-full text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto p-2">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative w-16 h-16 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 ${
                  index === activeIndex ? 'border-green-200' : 'border-transparent'
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Issue Detail Modal Component
const IssueDetailModal = ({ issue, isOpen, onClose, onMarkValid, onMarkInvalid }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  if (!isOpen || !issue) return null;

  const allImages = extractAllImagesFromContent(issue.body) || 
                   extractAllImagesFromContent(issue.description) || 
                   extractAllImagesFromContent(issue.content) || [];
  
  const githubUrl = getGitHubIssueUrl(issue);

  const openGallery = (index = 0) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-green-950 bg-opacity-80" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-green-900 dark:bg-green-950 border border-green-700 dark:border-green-800 max-w-6xl w-full max-h-[95vh] overflow-y-auto rounded-lg">
          
          {/* Header */}
          <div className="border-b border-green-700 dark:border-green-800 px-8 py-6 bg-green-800 dark:bg-green-900">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-green-100 dark:text-green-200">
                Issue Details
              </h2>
              <button
                onClick={onClose}
                className="text-green-300 hover:text-green-100 dark:text-green-400 dark:hover:text-green-200 text-3xl font-bold w-10 h-10 flex items-center justify-center hover:bg-green-700 dark:hover:bg-green-800 rounded-full"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            
            {/* Issue Title */}
            <div>
              <h3 className="text-2xl font-semibold text-green-100 dark:text-green-200 mb-6">
                {issue.title || "(No title)"}
              </h3>
            </div>

            {/* Image Gallery Section */}
            {allImages.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-green-200 dark:text-green-300 mb-4">
                  Images ({allImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-full h-24 bg-green-800 border border-green-700 rounded cursor-pointer hover:border-green-500 transition-colors overflow-hidden"
                      onClick={() => openGallery(index)}
                    >
                      <Image
                        src={img}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-950 bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-300 dark:text-green-400 mt-2">
                  Click any image to view in gallery mode
                </p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 p-4 rounded">
                  <h5 className="font-semibold text-green-200 dark:text-green-300 mb-2">Repository</h5>
                  <p className="text-green-100 dark:text-green-200">{issue.repo || issue.name || "Unknown repository"}</p>
                </div>
                
                <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 p-4 rounded">
                  <h5 className="font-semibold text-green-200 dark:text-green-300 mb-2">Reporter Team</h5>
                  <p className="text-green-100 dark:text-green-200">{issue.reporterTeam || "Unknown team"}</p>
                </div>
              </div>

              <div className="space-y-4">
                {issue.reporter && (
                  <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 p-4 rounded">
                    <h5 className="font-semibold text-green-200 dark:text-green-300 mb-2">Reporter</h5>
                    <p className="text-green-100 dark:text-green-200 font-mono">@{issue.reporter}</p>
                  </div>
                )}
                
                {issue.createdAt && (
                  <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 p-4 rounded">
                    <h5 className="font-semibold text-green-200 dark:text-green-300 mb-2">Created</h5>
                    <p className="text-green-100 dark:text-green-200">
                      {new Date(issue.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Content */}
            {(issue.body || issue.description || issue.content) && (
              <div>
                <h4 className="text-lg font-medium text-green-200 dark:text-green-300 mb-4">Description</h4>
                <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 p-6 rounded text-sm text-green-100 dark:text-green-200 max-h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {issue.body || issue.description || issue.content || "No description available"}
                  </pre>
                </div>
              </div>
            )}

            {/* GitHub Link */}
            {githubUrl && (
              <div className="bg-green-800 dark:bg-green-900 border border-green-600 dark:border-green-700 p-4 rounded">
                <h5 className="font-semibold text-green-200 dark:text-green-300 mb-2">View on GitHub</h5>
                <a 
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 dark:text-green-400 hover:text-green-100 dark:hover:text-green-200 underline break-all"
                >
                  {githubUrl}
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-green-700 dark:border-green-800 px-8 py-6 bg-green-800 dark:bg-green-900 flex justify-end gap-4">
            <button
              onClick={() => {
                onMarkValid(issue);
                onClose();
              }}
              className="px-6 py-3 text-sm font-medium text-green-100 dark:text-green-200 border border-green-600 dark:border-green-700 hover:bg-green-700 dark:hover:bg-green-800 rounded uppercase tracking-wide transition-colors"
            >
              Mark Valid
            </button>
            <button
              onClick={() => {
                onMarkInvalid(issue);
                onClose();
              }}
              className="px-6 py-3 text-sm font-medium text-green-100 dark:text-green-200 border border-green-600 dark:border-green-700 hover:bg-green-700 dark:hover:bg-green-800 rounded uppercase tracking-wide transition-colors"
            >
              Mark Invalid
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 rounded uppercase tracking-wide transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={allImages}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        currentIndex={selectedImageIndex}
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
      <div className="min-h-screen bg-green-900 dark:bg-green-950 flex items-center justify-center">
        <div className="text-center bg-green-800 dark:bg-green-900 p-12 border border-green-700 dark:border-green-800 rounded-lg shadow-lg">
          <div className="w-8 h-8 border-3 border-green-400 border-t-green-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-green-100 dark:text-green-200 mb-2">Loading Bug Reports</h3>
          <p className="text-green-300 dark:text-green-400 text-sm">Fetching Manipal Hackathon data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-900 dark:bg-green-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-700 dark:bg-green-800 border border-green-600 dark:border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-200 dark:text-green-300 text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-semibold text-green-100 dark:text-green-200 mb-4">Error Loading Issues</h3>
            <p className="text-sm text-green-200 dark:text-green-300 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 text-sm font-medium bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-900 dark:bg-green-950">
      {/* Full Width Container */}
      <div className="w-full">
        
        {/* Header Section - Full Width */}
        <header className="bg-green-800 dark:bg-green-900 border-b border-green-700 dark:border-green-800 px-8 py-12">
          <div className="max-w-full mx-auto">
            <h1 className="text-4xl font-bold text-green-100 dark:text-green-200 mb-4">
              Manipal Hackathon '25 Bug Bounty Tracker
            </h1>
            <p className="text-lg text-green-200 dark:text-green-300 max-w-3xl">
              Review and categorize repository issues for the Manipal Hackathon 2025 with detailed views and image galleries • Auto-refreshes every 15 seconds
            </p>
          </div>
        </header>

        {/* Stats Bar - Full Width */}
        <section className="bg-green-800 dark:bg-green-900 border-b border-green-700 dark:border-green-800 px-8 py-8">
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="text-center">
                <div className="text-4xl font-light text-green-100 dark:text-green-200 mb-3">
                  {issues.length}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-green-200 dark:text-green-300">
                  Pending Review
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-green-600 dark:before:bg-green-700 md:before:block before:hidden">
                <div className="text-4xl font-light text-green-200 dark:text-green-300 mb-3">
                  {validIssues.length}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-green-200 dark:text-green-300">
                  Valid Issues
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-green-600 dark:before:bg-green-700 md:before:block before:hidden">
                <div className="text-4xl font-light text-green-200 dark:text-green-300 mb-3">
                  {invalidIssues.length}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-green-200 dark:text-green-300">
                  Invalid Issues
                </div>
              </div>
              
              <div className="relative text-center before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-green-600 dark:before:bg-green-700 md:before:block before:hidden">
                <div className="text-4xl font-light text-green-300 dark:text-green-400 mb-3">
                  {issuelessRepos.length}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-green-200 dark:text-green-300">
                  Clean Repos
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Controls - Full Width */}
        <section className="bg-green-800 dark:bg-green-900 border-b border-green-700 dark:border-green-800 px-8 py-6">
          <div className="max-w-full mx-auto flex justify-end gap-4">
            <button
              onClick={() => exportCSV(validIssues, "valid_issues.csv")}
              className="text-sm px-6 py-3 text-green-100 dark:text-green-200 border border-green-600 dark:border-green-700 hover:bg-green-700 dark:hover:bg-green-800 rounded font-medium uppercase tracking-wide transition-colors"
            >
              Export Valid CSV
            </button>
            <button
              onClick={() => exportCSV(invalidIssues, "invalid_issues.csv")}
              className="text-sm px-6 py-3 text-green-100 dark:text-green-200 border border-green-600 dark:border-green-700 hover:bg-green-700 dark:hover:bg-green-800 rounded font-medium uppercase tracking-wide transition-colors"
            >
              Export Invalid CSV
            </button>
          </div>
        </section>

        {/* Main Content Area - Full Width */}
        <main className="bg-green-900 dark:bg-green-950 px-8 py-12">
          <div className="max-w-full mx-auto space-y-16">
            
            {/* Pending Issues Section */}
            <section>
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg px-8 py-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-green-100 dark:text-green-200">
                    Pending Review
                  </h2>
                  <span className="text-lg text-green-200 dark:text-green-300 bg-green-700 dark:bg-green-800 px-4 py-2 rounded-full">
                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg overflow-hidden">
                {issues.length === 0 ? (
                  <div className="px-8 py-16 text-center text-green-200 dark:text-green-300">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-xl font-medium mb-2">All Caught Up!</h3>
                    <p className="text-sm">No pending bug reports to review at this time.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-green-700 dark:divide-green-800">
                    {issues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="group px-8 py-8 hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer transition-colors"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-start gap-6">
                          <NetworkImageWidget issue={issue} size="lg" />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-green-100 dark:text-green-200 mb-3 leading-tight group-hover:text-white dark:group-hover:text-green-100 transition-colors">
                              {issue.title || "(No title)"}
                            </h3>
                            
                            <div className="flex items-center text-green-200 dark:text-green-300 space-x-6 mb-4">
                              <span className="font-medium text-base">
                                📁 {issue.repo || issue.name || "Unknown repository"}
                              </span>
                              
                              <div className="w-px h-6 bg-green-600 dark:bg-green-700"></div>
                              
                              <span className="text-base">
                                👥 {issue.reporterTeam || "Unknown team"}
                              </span>
                              
                              {issue.reporter && (
                                <>
                                  <div className="w-px h-6 bg-green-600 dark:bg-green-700"></div>
                                  <span className="font-mono text-sm bg-green-700 dark:bg-green-800 px-2 py-1 rounded">
                                    @{issue.reporter}
                                  </span>
                                </>
                              )}
                              
                              {issue.createdAt && (
                                <>
                                  <div className="w-px h-6 bg-green-600 dark:bg-green-700"></div>
                                  <span className="text-sm">
                                    🕒 {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Image count indicator */}
                            {extractAllImagesFromContent(issue.body || issue.description || issue.content).length > 1 && (
                              <div className="inline-flex items-center text-sm text-green-200 dark:text-green-300 bg-green-700 dark:bg-green-800 px-3 py-1 rounded-full mb-3">
                                🖼️ {extractAllImagesFromContent(issue.body || issue.description || issue.content).length} images
                              </div>
                            )}
                            
                            <div className="text-sm text-green-300 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view full details and image gallery →
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
            <hr className="border-green-600 dark:border-green-700 border-2" />

            {/* Valid Issues Section */}
            <section>
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg px-8 py-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-green-100 dark:text-green-200">
                    ✅ Valid Issues
                  </h2>
                  <span className="text-lg text-green-200 dark:text-green-300 bg-green-700 dark:bg-green-800 px-4 py-2 rounded-full">
                    {validIssues.length} {validIssues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg overflow-hidden">
                {validIssues.length === 0 ? (
                  <div className="px-8 py-12 text-center text-green-300 dark:text-green-400">
                    <p>No valid issues yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-green-700 dark:divide-green-800">
                    {validIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="px-8 py-6 hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer transition-colors"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-center gap-6">
                          <NetworkImageWidget issue={issue} size="md" />
                          <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-green-100 dark:text-green-200 mb-2">
                              {issue.title || "(No title)"}
                            </div>
                            <div className="text-sm text-green-200 dark:text-green-300">
                              📁 {issue.repo || issue.name} • 👥 {issue.reporterTeam || "Unknown team"}
                            </div>
                            
                            {/* Image count for valid issues */}
                            {extractAllImagesFromContent(issue.body || issue.description || issue.content).length > 1 && (
                              <div className="text-xs text-green-300 dark:text-green-400 mt-1">
                                🖼️ {extractAllImagesFromContent(issue.body || issue.description || issue.content).length} images
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Horizontal Divider */}
            <hr className="border-green-600 dark:border-green-700 border-2" />

            {/* Invalid Issues Section */}
            <section>
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg px-8 py-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-green-100 dark:text-green-200">
                    ❌ Invalid Issues
                  </h2>
                  <span className="text-lg text-green-200 dark:text-green-300 bg-green-700 dark:bg-green-800 px-4 py-2 rounded-full">
                    {invalidIssues.length} {invalidIssues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg overflow-hidden">
                {invalidIssues.length === 0 ? (
                  <div className="px-8 py-12 text-center text-green-300 dark:text-green-400">
                    <p>No invalid issues yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-green-700 dark:divide-green-800">
                    {invalidIssues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="px-8 py-6 hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer transition-colors"
                        onClick={() => openIssueModal(issue)}
                      >
                        <div className="flex items-center gap-6">
                          <NetworkImageWidget issue={issue} size="md" />
                          <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-green-100 dark:text-green-200 mb-2">
                              {issue.title || "(No title)"}
                            </div>
                            <div className="text-sm text-green-200 dark:text-green-300">
                              📁 {issue.repo || issue.name} • 👥 {issue.reporterTeam || "Unknown team"}
                            </div>
                            
                            {/* Image count for invalid issues */}
                            {extractAllImagesFromContent(issue.body || issue.description || issue.content).length > 1 && (
                              <div className="text-xs text-green-300 dark:text-green-400 mt-1">
                                🖼️ {extractAllImagesFromContent(issue.body || issue.description || issue.content).length} images
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Horizontal Divider */}
            <hr className="border-green-600 dark:border-green-700 border-2" />

            {/* Clean Repositories Section */}
            <section>
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg px-8 py-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-green-100 dark:text-green-200">
                    🧹 Clean Repositories
                  </h2>
                  <span className="text-lg text-green-200 dark:text-green-300 bg-green-700 dark:bg-green-800 px-4 py-2 rounded-full">
                    {issuelessRepos.length} {issuelessRepos.length === 1 ? 'repository' : 'repositories'}
                  </span>
                </div>
              </div>
              
              <div className="bg-green-800 dark:bg-green-900 border border-green-700 dark:border-green-800 rounded-lg overflow-hidden">
                {issuelessRepos.length === 0 ? (
                  <div className="px-8 py-12 text-center text-green-300 dark:text-green-400">
                    <p>No clean repositories found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-green-700 dark:bg-green-800">
                    {issuelessRepos.map((repo) => (
                      <div 
                        key={repo.name} 
                        className="bg-green-800 dark:bg-green-900 p-6 hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📁</div>
                          <div className="font-semibold text-green-100 dark:text-green-200 text-sm mb-1">
                            {repo.name}
                          </div>
                          <div className="text-xs text-green-300 dark:text-green-400">
                            No issues
                          </div>
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
