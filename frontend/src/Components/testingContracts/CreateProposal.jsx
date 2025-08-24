import { useEffect, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { useCreateProposal } from "../../interactions/ProposalManager_interactions";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";

function CreateProposalButton({ deadline, budget, dbId, onCreated }) {
  const { address, isConnected, chain } = useAccount();
  const {
    createProposal,
    isPending,
    isConfirming,
    isConfirmed,
    receipt,
    error,
    hash,
    proposalEvent,
  } = useCreateProposal();

  // Check ETH balance for gas (0.001 ETH threshold)
  const { data: balanceData } = useBalance({ address });
  const hasEnoughGas = balanceData && balanceData.value >= 0.001 * 10 ** 18;

  // Convert inputs to numbers for validation
  const deadlineTimestamp = parseInt(deadline) || 0;
  const budgetValue = parseInt(budget) || 0;
  const isCorrectNetwork = chain && chain.id === baseSepolia.id;

  // Ref to track toast IDs for each state
  const toastIdRef = useRef(null);

  // Handle button click
  const handleCreateProposal = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet.");
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Base Sepolia network.");
      return;
    }
    if (!hasEnoughGas) {
      toast.error("Insufficient ETH for gas fees (minimum 0.001 ETH).");
      return;
    }
    if (!deadline || deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
      toast.error(
        "Please provide a valid deadline in the future (Unix timestamp)."
      );
      return;
    }
    if (!budget || budgetValue <= 0) {
      toast.error("Please provide a valid budget greater than 0 (in Wei).");
      return;
    }

    try {
      console.log("Calling createProposal with:", {
        deadline: deadlineTimestamp,
        budget: budgetValue,
      });
      await createProposal(BigInt(deadlineTimestamp), BigInt(budgetValue));
    } catch (err) {
      console.error("Create proposal error:", err);
      // Toast handled in useEffect
    }
  };

  // Toast notifications for transaction states and event
  useEffect(() => {
    // Dismiss previous toast if it exists
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    if (isPending) {
      toastIdRef.current = toast.loading("Creating proposal...");
    } else if (isConfirming) {
      toastIdRef.current = toast.loading("Confirming proposal creation...");
    } else if (isConfirmed && proposalEvent) {
      toastIdRef.current = toast.success(
        `Proposal created successfully! Proposal ID: ${Number(
          proposalEvent.proposalId
        )}`
      );
      // After success, PATCH proposalId to backend
      (async () => {
        try {
          if (!dbId) return;
          const token = localStorage.getItem("authToken");
          const res = await fetch(
            `http://localhost:3001/api/proposals/${dbId}/proposalId`,
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
          if (typeof onCreated === "function") {
            onCreated(Number(proposalEvent.proposalId));
          }
        }
      })();
    } else if (isConfirmed && !proposalEvent) {
      toastIdRef.current = toast.error(
        `Proposal created, but failed to fetch Proposal ID. Transaction hash: ${hash}. Check Base Sepolia explorer at https://sepolia.basescan.org/tx/${hash}.`
      );
    } else if (error) {
      const isCancelled =
        error.code === 4001 || /rejected|denied|cancelled/i.test(error.message);
      toastIdRef.current = toast.error(
        isCancelled ? "Transaction cancelled" : `Error: ${error.message}`
      );
    }

    // Cleanup on unmount
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [isPending, isConfirming, isConfirmed, error, hash, proposalEvent]);

  return (
    <button
      onClick={handleCreateProposal}
      // disabled={
      //   isPending ||
      //   isConfirming ||
      //   !hasEnoughGas ||
      //   !isConnected ||
      //   !isCorrectNetwork ||
      //   !deadline ||
      //   deadlineTimestamp <= Math.floor(Date.now() / 1000) ||
      //   !budget ||
      //   budgetValue <= 0
      // }
      className={`
        relative w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300
        bg-gradient-to-r from-cyan-600 to-blue-600
        text-white
        border border-cyan-500/30
        shadow-lg shadow-cyan-500/20
        hover:from-cyan-500 hover:to-blue-500
        hover:shadow-xl hover:shadow-cyan-500/30
        active:from-cyan-700 active:to-blue-700
        disabled:bg-gray-700
        disabled:text-gray-400
        disabled:border-gray-600
        disabled:shadow-none
        disabled:cursor-not-allowed
        overflow-hidden
        group
      `}
    >
      <span className="relative z-10">
        {isPending || isConfirming ? "Processing..." : "Create Proposal"}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
}

export default CreateProposalButton;
