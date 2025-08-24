import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../ProposalComponents/JobCard";
import Loader from "../Loader";
// If your backend returns USDC in micro units (1e6), use this.
// Safe even if you pass a plain number/string budget.
const USDC_DECIMALS = 6;
function formatUsdcFromMicro(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return typeof value === "string" ? value : "$0.00";
  const usd = n / 10 ** USDC_DECIMALS;
  return `$${usd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const AcceptedProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "https://cryptolance-qgzz.onrender.com/api/proposals/user/accepted-proposals",
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(
          `Request failed: ${res.status} ${res.statusText}${
            detail ? ` — ${detail}` : ""
          }`
        );
      }

      const raw = await res.json();

      // Normalize array
      const items = Array.isArray(raw) ? raw : raw?.data ?? [];

      // Map backend fields into what <JobCard/> needs
      const normalized = items.map((p) => {
        const job = p.job || p.relatedJob || {}; // common nesting if proposal references a job
        const client = p.client ||
          job.client ||
          p.clientDetails ||
          job.clientDetails || {
            name: "Client",
            email: "client@example.com",
            avatar: "https://i.pravatar.cc/100",
          };

        const id = p._id || p.id || job._id || job.id;

        // Budget can be on proposal or job; format if it looks like micro-USDC
        const rawBudget =
          p.budget ?? job.budget ?? p.amount ?? job.amount ?? null;
        const budget =
          typeof rawBudget === "number" && rawBudget > 100000
            ? formatUsdcFromMicro(rawBudget)
            : typeof rawBudget === "number"
            ? `$${rawBudget.toLocaleString()}`
            : typeof rawBudget === "string"
            ? rawBudget
            : "$—";

        return {
          id, // used for key & routing
          title: p.title || job.title || "Untitled",
          description: p.description || job.description || "",
          budget,
          timeframe:
            p.project_duration || job.project_duration || p.timeframe || "—",
          skills:
            p.skills_requirement ||
            job.skills_requirement ||
            p.skills ||
            job.skills ||
            [],
          client: {
            name: client.name || "Client",
            email: client.email || "client@example.com",
            avatar:
              client.avatar ||
              client.photo ||
              client.image ||
              "https://i.pravatar.cc/100",
          },
          postedTime: new Date(
            p.createdAt || job.createdAt || Date.now()
          ).toLocaleDateString(),
          location: p.location || job.location || "Remote",
          featured: Boolean(p.featured || job.featured),
        };
      });

      setProposals(normalized);
      localStorage.setItem("proposals", JSON.stringify(normalized));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const handleJobClick = (job) => {
    // Adjust this route to your actual job/proposal detail page
    navigate(`/job/${job.id}`);
  };

  if (loading) return <Loader caption="Loading proposals" />;

  if (error)
    return (
      <div className="p-4 text-red-600">
        Failed to load proposals.
        <div className="text-xs mt-2 break-all">{error}</div>
        <button
          onClick={fetchProposals}
          className="mt-3 px-3 py-1 rounded bg-gray-900 text-white"
        >
          Try again
        </button>
      </div>
    );

  if (!proposals.length)
    return <div className="p-4">No accepted proposals found.</div>;

  return (
    <div className="grid grid-cols-1  gap-4 p-4">
      {proposals.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={savedJobs.has(job.id)}
          onToggleSave={(e) => {
            // Prevent the card onClick when clicking the bookmark
            e?.stopPropagation?.();
            toggleSaveJob(job.id);
          }}
          onClick={() => handleJobClick(job)}
        />
      ))}
    </div>
  );
};

export default AcceptedProposals;
