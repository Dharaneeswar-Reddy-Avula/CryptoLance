"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar";
import BackgroundEffects from "../../Components/ProposalDetails/BackgroundEffects";
import BackButton from "../../Components/ProposalDetails/BackButton";
import ProposalHeader from "../../Components/ProposalDetails/ProposalHeader";
import ProjectDescription from "../../Components/ProposalDetails/ProjectDescription";
import RequirementsDeliverables from "../../Components/ProposalDetails/RequirementsDeliverables";
import TabNavigation from "../../Components/ProposalDetails/TabNavigation";
import TabContent from "../../Components/ProposalDetails/TabContent";
import ProjectStats from "../../Components/ProposalDetails/ProjectStats";
import ClientInfo from "../../Components/ProposalDetails/ClientInfo";
import LocationMap from "../../Components/ProposalDetails/LocationMap";
// New efficient proposal flow components
import StateBadge from "../../Components/ProposalComponents/StateBadge";
import ContractSummary from "../../Components/ProposalComponents/ContractSummary";
import CreateProposalCard from "../../Components/ProposalComponents/CreateProposalCard";
import ActionBar from "../../Components/ProposalComponents/ActionBar";
import FundingCard from "../../Components/ProposalComponents/FundingCard";
import BiddingPanel from "../../Components/ProposalComponents/BiddingPanel";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
    {/* <BackgroundEffects /> */}
    <div className="relative z-10 text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-400 border-r-purple-500 mb-4"></div>
      <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-xl font-semibold">
        Loading proposal details...
      </div>
    </div>
  </div>
);
import Loader from "../../Components/Loader";
// Loading Spinner Component

// Error Component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
    {/* <BackgroundEffects /> */}
    <div className="relative z-10 text-center max-w-md mx-auto px-4">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 text-2xl font-bold mb-4">
        Failed to Load Proposal
      </h2>
      <p className="text-gray-300 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default function ProposalDetails({ job, onBack }) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposalState, setProposalState] = useState(0);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Handle retry for error cases
  const handleRetry = useCallback(() => {
    setError(null);
    if (job) {
      processJobData(job);
    } else if (id) {
      fetchProposal();
    }
  }, [job, id]);

  // Contract state mapping
  const contractStates = {
    0: "Draft",
    1: "Open",
    2: "Awarded",
    3: "Funded",
    4: "InProgress",
    5: "MilestonePayout_ONE",
    6: "MilestonePayout_TWO",
    7: "MilestonePayout_THREE",
    8: "Completed",
    9: "Disputed",
    10: "Cancelled",
    11: "Refunded",
  };

  const fetchProposal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If we have job data passed as prop, use it directly
      if (job) {
        console.log("Using job data from props:", job);
        processJobData(job);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await fetch(
        `http://localhost:3001/api/proposals/${id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch proposal: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched proposal data from API:", data);
      processJobData(data);
      toast.success("Proposal loaded successfully!");
    } catch (err) {
      console.error("Error fetching proposal:", err);
      setError(err.message);
      toast.error("Failed to load proposal details");
    } finally {
      setIsLoading(false);
    }
  }, [id, job]);

  const processJobData = useCallback((data) => {
    console.log("Processing job data:", data);
    console.log("Skills requirement:", data.skills_requirement);
    console.log("Skills:", data.skills);
    console.log("Tags:", data.tags);
    console.log("Contract data:", data.contractData);

    // Determine current state:
    // - If no proposalId in DB, no on-chain state exists yet -> null (shows Create Proposal)
    // - If proposalId exists: use contractData.state if present, else default to 0 (Draft)
    let currentState = null;
    if (data.proposalId) {
      if (data.contractData && data.contractData.state !== undefined) {
        currentState = parseInt(data.contractData.state);
      } else {
        currentState = 0;
      }
    }

    console.log(
      "Contract state:",
      currentState,
      "State name:",
      contractStates[currentState]
    );
    setProposalState(currentState);

    // Get current user's wallet address from localStorage or context
    const currentUserAddress =
      localStorage.getItem("authAddress") ||
      "0x0000000000000000000000000000000000000000";

    // Format the data to ensure compatibility with existing components
    // Normalize budget: backend stores micro‑USDC (6 decimals). Create readable USD and retain micro value
    const budgetMicro = data?.budget != null ? Number(data.budget) : null;
    const budgetUsd = budgetMicro != null ? budgetMicro / 1_000_000 : null;

    const formattedJob = {
      ...data,
      // Use the actual description from API
      fullDescription: data.description || "No description provided",

      // Map requirements based on API data structure
      requirements: Array.isArray(data.requirements)
        ? data.requirements
        : [
            "3+ years of experience in relevant technologies",
            "Strong portfolio of previous work",
            "Excellent communication skills",
            "Ability to work independently",
            "Experience with agile development",
          ],

      // Map deliverables based on API data structure
      deliverables: Array.isArray(data.deliverables)
        ? data.deliverables
        : [
            "Complete project documentation",
            "Source code with comments",
            "Testing and deployment",
            "Post-launch support for 30 days",
          ],

      // Map client information
      client: data.client || {
        name: "Client Name",
        avatar: "/placeholder.svg?height=48&width=48",
        rating: 4.8,
        jobsPosted: 23,
      },

      // Map skills from API data
      skills: Array.isArray(data.skills_requirement)
        ? data.skills_requirement
        : Array.isArray(data.skills)
        ? data.skills
        : [],

      // Map location and other fields
      location: data.location || "Remote",
      budgetMicro,
      budgetUsd,
      timeframe: data.project_duration || data.timeframe || "To be discussed",
      type: data.type || "Fixed Price",
      proposals: data.bids?.length || data.proposals || 0,
      postedTime:
        data.postedTime || new Date(data.createdAt).toLocaleDateString(),

      // Contract data from API with current user info
      contractData: data.contractData
        ? {
            ...data.contractData,
            currentUser: currentUserAddress,
          }
        : null,
      proposalId: data.proposalId || data.id,
      userWalletAddress: data.userWalletAddress,

      // Tags from API data
      tags: Array.isArray(data.tags) ? data.tags : [],
      isEditable: data.isEditable || false,

      // Additional fields that might be needed
      image: data.image || null,
      accepted_bidder: data.accepted_bidder || null,
      bids: Array.isArray(data.bids) ? data.bids : [],
    };

    console.log("Formatted job data:", formattedJob);
    setJobDetails(formattedJob);
  }, []);

  const fetchAndProcessJob = useCallback(async () => {
    if (job) {
      console.log("Job data provided via props, processing...");
      setIsLoading(true);
      // Small delay to ensure smooth loading experience
      setTimeout(() => {
        processJobData(job);
        setIsLoading(false);
      }, 100);
    } else if (id) {
      fetchProposal();
    } else {
      setError("No proposal ID or job data provided");
      setIsLoading(false);
    }
  }, [id, job, fetchProposal, processJobData]);

  // After any chain action completes, show a refresh option to refetch data
  const handleChainSuccess = useCallback(() => {
    // Give backend a brief moment to persist, then enable refresh CTA
    setTimeout(() => {
      setNeedsRefresh(true);
      toast.success("On‑chain change detected. Click Refresh to update.");
    }, 800);
  }, []);

  const handleManualRefresh = useCallback(async () => {
    await fetchProposal();
    setNeedsRefresh(false);
    toast.success("Data refreshed");
  }, [fetchProposal]);

  useEffect(() => {
    fetchAndProcessJob();
  }, [fetchAndProcessJob]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  if (!jobDetails) {
    return (
      <ErrorDisplay error="No proposal data found" onRetry={handleRetry} />
    );
  }

  // Safety check: ensure required arrays exist and component is ready to render
  if (!jobDetails.skills || !Array.isArray(jobDetails.skills)) {
    console.log("Skills not ready, showing loading...");
    return <Loader />;
  }

  // Additional safety check for other required arrays
  if (
    !Array.isArray(jobDetails.requirements) ||
    !Array.isArray(jobDetails.deliverables)
  ) {
    console.log("Requirements or deliverables not ready, showing loading...");
    return <Loader />;
  }

  // Safety check: ensure required arrays exist
  if (!Array.isArray(jobDetails.tags)) {
    jobDetails.tags = [];
  }
  if (!Array.isArray(jobDetails.requirements)) {
    jobDetails.requirements = [];
  }
  if (!Array.isArray(jobDetails.deliverables)) {
    jobDetails.deliverables = [];
  }
  if (!Array.isArray(jobDetails.bids)) {
    jobDetails.bids = [];
  }

  // Final validation: ensure all required fields are present
  if (!jobDetails.title || !jobDetails.description) {
    console.error("Missing required job details:", jobDetails);
    return (
      <ErrorDisplay
        error="Job data is incomplete. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  console.log("Rendering ProposalDetails with:", {
    jobDetails,
    proposalState,
    activeTab,
    hasContractData: !!jobDetails.contractData,
    contractState: jobDetails.contractData?.state,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* <BackgroundEffects /> */}

      <Navbar />

      <div className="pt-8 mt-12 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <BackButton onBack={onBack} />

          <ProposalHeader jobDetails={jobDetails} />

          {needsRefresh && (
            <div className="mt-4 mb-2 p-3 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-sm flex items-center justify-between">
              <div className="text-sm text-cyan-200">
                New on‑chain updates available.
              </div>
              <button
                onClick={handleManualRefresh}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          )}

          <div className="space-y-6 mb-6">
            <ProjectDescription jobDetails={jobDetails} />
            <RequirementsDeliverables jobDetails={jobDetails} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <TabNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {activeTab === "details" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Contract summary + state badge */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                      On‑chain Proposal
                    </h2>
                    <StateBadge state={proposalState} />
                  </div>

                  {jobDetails?.contractData ? (
                    <ContractSummary contractData={jobDetails.contractData} />
                  ) : (
                    <CreateProposalCard
                      dbId={jobDetails?._id}
                      budget={jobDetails?.budgetUsd}
                      projectDuration={jobDetails?.project_duration}
                      onCreated={() => toast.success("Proposal created")}
                      onChainSuccess={handleChainSuccess}
                    />
                  )}

                  {proposalState !== null && (
                    <ActionBar
                      dbId={jobDetails?._id}
                      proposalId={
                        jobDetails?.contractData?.contractProposalId ||
                        jobDetails?.proposalId
                      }
                      state={proposalState}
                      onChainSuccess={handleChainSuccess}
                    />
                  )}

                  {proposalState === 2 && (
                    <FundingCard
                      proposalId={
                        jobDetails?.contractData?.contractProposalId ||
                        jobDetails?.proposalId
                      }
                      bidAmount={jobDetails?.contractData?.bidAmount}
                      onChainSuccess={handleChainSuccess}
                    />
                  )}

                  {/* Bids: create and list */}
                  <BiddingPanel
                    proposalDbId={jobDetails?._id}
                    currentState={proposalState}
                    contractProposalId={
                      jobDetails?.contractData?.contractProposalId ||
                      jobDetails?.proposalId
                    }
                    clientAddress={
                      jobDetails?.contractData?.client ||
                      jobDetails?.userWalletAddress
                    }
                    onChainSuccess={handleChainSuccess}
                  />
                </div>
              )}

              <TabContent
                activeTab={activeTab}
                proposalId={id || jobDetails?._id}
                proposalState={proposalState}
                proposalData={jobDetails}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* <ProjectStats jobDetails={jobDetails} /> */}
              <ClientInfo client={jobDetails.client} />
              {/* <LocationMap location={jobDetails.location} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
