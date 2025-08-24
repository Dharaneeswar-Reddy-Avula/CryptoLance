import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProposalDetails from "./proposalDetails/ProposalDetails";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { toast } from "react-hot-toast";
import Loader from "../Components/Loader";
const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://cryptolance-qgzz.onrender.com/api/proposals/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched job data:", data);
      console.log("Data structure check:", {
        hasSkills: !!data.skills_requirement,
        skillsType: typeof data.skills_requirement,
        skillsIsArray: Array.isArray(data.skills_requirement),
        hasTags: !!data.tags,
        tagsType: typeof data.tags,
        tagsIsArray: Array.isArray(data.tags),
        hasContractData: !!data.contractData,
      });
      setJobData(data);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError(err.message);
      toast.error("Failed to load job details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id, fetchJobDetails]);

  const handleBackToJobs = () => {
    navigate("/browse-jobs");
  };

  const handleChainSuccess = useCallback(() => {
    toast.success(
      "New on-chain updates available. Click Refresh to see changes.",
      {
        id: "chain-success-toast",
        duration: 5000,
      }
    );
    setNeedsRefresh(true);
  }, []);

  const handleManualRefresh = useCallback(() => {
    fetchJobDetails();
    setNeedsRefresh(false);
    toast.dismiss("chain-success-toast");
  }, [fetchJobDetails]);

  const handleHardReload = useCallback(() => {
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <Loader caption="Job Details" />

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-red-400 mb-4">
                  Error Loading Job
                </h2>
                <p className="text-gray-300 mb-6">{error}</p>
                <button
                  onClick={handleBackToJobs}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                  Job Not Found
                </h2>
                <p className="text-gray-300 mb-6">
                  The job you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={handleBackToJobs}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Validate that required data fields exist
  if (!jobData.title || !jobData.description) {
    console.error("Invalid job data:", jobData);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-red-400 mb-4">
                  Invalid Job Data
                </h2>
                <p className="text-gray-300 mb-6">
                  The job data received is incomplete or malformed.
                </p>
                <button
                  onClick={handleBackToJobs}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log("About to render ProposalDetails with jobData:", jobData);
  console.log("JobData structure check:", {
    hasTitle: !!jobData.title,
    hasDescription: !!jobData.description,
    hasSkills: !!jobData.skills_requirement,
    hasTags: !!jobData.tags,
    hasContractData: !!jobData.contractData,
    contractState: jobData.contractData?.state,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="">
        <div className=" mx-auto">
          {/* {true && (
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3 text-center flex items-center justify-between mb-4">
              <span className="text-blue-300 font-medium text-sm">
                New on‑chain updates available.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleHardReload}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-semibold transition-colors"
                  title="Reload page"
                >
                  Reload
                </button>
              </div>
            </div>
          )} */}
          <ProposalDetails
            job={jobData}
            onBack={handleBackToJobs}
            setJobs={() => {}} // Not needed for this page
            setIsLoading={() => {}} // Not needed for this page
            onChainSuccess={handleChainSuccess}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetails;
