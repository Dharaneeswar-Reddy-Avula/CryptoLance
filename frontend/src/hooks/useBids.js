import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export const useBids = (proposalId) => {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBids = useCallback(async () => {
    if (!proposalId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://cryptolance-qgzz.onrender.com/api/bids`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }

      const data = await response.json();
      // Filter bids for this specific proposal
      const proposalBids = data.filter((bid) => bid.proposal_id === proposalId);
      setBids(proposalBids);
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId]);

  const createBid = useCallback(
    async (bidData) => {
      try {
        const authToken = localStorage.getItem("authToken");

        const response = await fetch(
          "https://cryptolance-qgzz.onrender.com/api/bids",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              cover_letter: bidData.cover_letter.trim(),
              bid_amount: parseFloat(bidData.bid_amount),
              proposal_id: proposalId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to submit bid");
        }

        const newBid = await response.json();
        setBids((prev) => [...prev, newBid]);
        toast.success("Bid submitted successfully!");
        return newBid;
      } catch (error) {
        console.error("Error creating bid:", error);
        toast.error(error.message || "Failed to submit bid");
        throw error;
      }
    },
    [proposalId]
  );

  const updateBid = useCallback(async (bidId, updateData) => {
    try {
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `https://cryptolance-qgzz.onrender.com/api/bids/${bidId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            cover_letter: updateData.cover_letter.trim(),
            bid_amount: parseFloat(updateData.bid_amount),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bid");
      }

      const updatedBid = await response.json();
      setBids((prev) =>
        prev.map((bid) => (bid._id === bidId ? updatedBid : bid))
      );
      toast.success("Bid updated successfully!");
      return updatedBid;
    } catch (error) {
      console.error("Error updating bid:", error);
      toast.error(error.message || "Failed to update bid");
      throw error;
    }
  }, []);

  const deleteBid = useCallback(async (bidId) => {
    try {
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `https://cryptolance-qgzz.onrender.com/api/bids/${bidId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bid");
      }

      setBids((prev) => prev.filter((bid) => bid._id !== bidId));
      toast.success("Bid deleted successfully!");
    } catch (error) {
      console.error("Error deleting bid:", error);
      toast.error(error.message || "Failed to delete bid");
      throw error;
    }
  }, []);

  const refreshBids = useCallback(() => {
    if (!proposalId) return;

    setIsLoading(true);
    setError(null);

    fetch(`https://cryptolance-qgzz.onrender.com/api/bids`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bids");
        }
        return response.json();
      })
      .then((data) => {
        const proposalBids = data.filter(
          (bid) => bid.proposal_id === proposalId
        );
        setBids(proposalBids);
      })
      .catch((err) => {
        console.error("Error refreshing bids:", err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [proposalId]);

  return {
    bids,
    isLoading,
    error,
    fetchBids,
    createBid,
    updateBid,
    deleteBid,
    refreshBids,
  };
};
