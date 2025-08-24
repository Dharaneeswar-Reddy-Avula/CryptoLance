import React, { useEffect, useMemo, useRef, useState } from "react";
import { toUSDC6 } from "../../utils/units";
import { toast } from "react-hot-toast";
import { useCreateProposal } from "../../interactions/ProposalManager_interactions";

function formatDateFromUnix(unix) {
  if (!unix) return "—";
  const ms = Number(unix) * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return String(unix);
  return d.toLocaleString();
}

function formatDateToUnix(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 0;
  return Math.floor(date.getTime() / 1000);
}

export default function CreateProposalCard({
  dbId,
  budget,
  projectDuration,
  onCreated,
  onChainSuccess,
}) {
  const {
    createProposal,
    isPending,
    isConfirming,
    isConfirmed,
    receipt,
    error,
    proposalEvent,
  } = useCreateProposal();
  const [deadlineOverride, setDeadlineOverride] = useState("");
  const [usdBudget, setUsdBudget] = useState(Number(budget || 0));
  const toastIdRef = useRef("create-proposal-toast");
  const hasPersistedRef = useRef(false);

  const inferredDeadline = useMemo(() => {
    // Fallback simple inference: if projectDuration contains "month" assume 30/60/90 days
    const text = (projectDuration || "").toLowerCase();
    let days = 30;
    if (text.includes("1-2")) days = 60;
    else if (text.includes("2-3")) days = 90;
    else if (text.includes("1")) days = 30;
    else if (text.includes("2")) days = 60;
    else if (text.includes("3")) days = 90;
    const seconds = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
    return seconds;
  }, [projectDuration]);

  // Convert inferred deadline to datetime-local format for display
  const inferredDeadlineDate = useMemo(() => {
    const ms = inferredDeadline * 1000;
    const date = new Date(ms);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    return date.toISOString().slice(0, 16);
  }, [inferredDeadline]);

  const uiDeadline = deadlineOverride
    ? formatDateToUnix(deadlineOverride)
    : inferredDeadline;
  const minorUnits = (() => {
    try {
      return Number(toUSDC6(usdBudget));
    } catch {
      return Math.round(Number(usdBudget || 0) * 1_000_000);
    }
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProposal(BigInt(uiDeadline), BigInt(minorUnits));
      // Toasts will be handled via effect below
    } catch (err) {
      toast.error(err?.message || "Failed to create proposal");
    }
  };

  // Surface tx states and persist proposalId to backend once confirmed
  useEffect(() => {
    if (isPending) {
      hasPersistedRef.current = false;
      toast.loading("Creating proposal...", { id: toastIdRef.current });
      return;
    }
    if (isConfirming) {
      toast.loading("Confirming proposal creation...", {
        id: toastIdRef.current,
      });
      return;
    }
    if (isConfirmed && proposalEvent) {
      toast.success(
        `Proposal created successfully! Proposal ID: ${String(
          proposalEvent.proposalId
        )}`,
        { id: toastIdRef.current }
      );
      // Persist to backend only once per confirmed tx
      if (!hasPersistedRef.current) {
        hasPersistedRef.current = true;
        (async () => {
          try {
            if (!dbId) return;
            const token = localStorage.getItem("authToken");
            const res = await fetch(
              `https://cryptolance-qgzz.onrender.com/api/proposals/${dbId}/proposalId`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  proposalId: Number(proposalEvent.proposalId),
                }),
              }
            );
            if (!res.ok) {
              const msg = await res.text();
              console.error("Failed to update proposalId:", msg);
              toast.error("Failed to sync proposalId to backend");
            }
          } catch (e) {
            console.error("Error updating proposalId:", e);
            toast.error("Error syncing proposalId to backend");
          } finally {
            onCreated?.({
              proposalId: String(proposalEvent.proposalId),
              dbId,
            });
            onChainSuccess?.();
          }
        })();
      }
      return;
    }
    if (isConfirmed && !proposalEvent) {
      toast.error(
        `Proposal created, but failed to fetch Proposal ID. Check tx on BaseScan.`,
        { id: toastIdRef.current }
      );
      return;
    }
    if (error) {
      const isCancelled =
        error.code === 4001 || /rejected|denied|cancelled/i.test(error.message);
      toast.error(
        isCancelled ? "Transaction cancelled" : `Error: ${error.message}`,
        { id: toastIdRef.current }
      );
      return;
    }
    return undefined;
  }, [
    isPending,
    isConfirming,
    isConfirmed,
    error,
    proposalEvent,
    dbId,
    onCreated,
    onChainSuccess,
  ]);

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900/80 to-black/70 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.12)]">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-3">
        Create On‑Chain Proposal
      </h3>
      <p className="text-gray-300 text-sm mb-4">
        No contract found for this listing. Create one to enable bidding and
        milestones.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Budget (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={usdBudget}
              onChange={(e) => setUsdBudget(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500/60"
            />
            <div className="text-xs text-cyan-300 mt-1">
              Will send {minorUnits.toLocaleString()} (USDC 6 decimals)
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Deadline</label>
            <input
              type="datetime-local"
              placeholder={inferredDeadlineDate}
              value={deadlineOverride || inferredDeadlineDate}
              onChange={(e) => setDeadlineOverride(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-fuchsia-500/60"
            />
            <div className="text-xs text-fuchsia-300 mt-1">
              {formatDateFromUnix(uiDeadline)}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold disabled:opacity-60"
        >
          {isPending
            ? "Confirm in wallet..."
            : isConfirming
            ? "Waiting for confirmations..."
            : "Create Proposal"}
        </button>
        {error && <div className="text-sm text-red-400">{error.message}</div>}
        {isConfirmed && proposalEvent && (
          <div className="text-sm text-emerald-400">
            Proposal created with ID {String(proposalEvent.proposalId || "?")}
          </div>
        )}
      </form>
    </div>
  );
}
