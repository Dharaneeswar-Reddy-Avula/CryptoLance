"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Bookmark,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import JobCard from "../Components/ProposalComponents/JobCard";
const API_BASE_URL =
  "http://localhost:3001/api/proposals/openBids";

// USDC uses 6 decimals; values from backend may be in micro-USDC
const USDC_DECIMALS = 6;
function formatUsdcFromMicro(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "$0";
  const usd = numeric / 10 ** USDC_DECIMALS;
  return `$${usd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "All",
    "Web Development",
    "Smart Contracts",
    "UI/UX Design",
    "Mobile Development",
    "Content Writing",
    "AI/ML",
  ];
  const priceRanges = [
    "All",
    "$0 - $1,000",
    "$1,000 - $5,000",
    "$5,000 - $10,000",
    "$10,000+",
  ];

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();

        const proposalsArray = Array.isArray(data) ? data : data.data || [];

        // Map backend proposal fields to match frontend job card structure
        const formattedJobs = proposalsArray.map((p) => ({
          id: p._id,
          title: p.title,
          description: p.description,
          // Convert micro-USDC (1e6) to human-readable USD
          budget: formatUsdcFromMicro(p.budget),
          budgetMicro: Number(p.budget ?? 0),
          budgetUsd:
            p.budget != null ? Number(p.budget) / 10 ** USDC_DECIMALS : null,
          timeframe: p.project_duration,
          skills: p.skills_requirement || [],
          client: {
            name: p?.userPortfolioDetails?.name || "Unknown Client", // adjust if stored differently
            rating: p.client_rating || 0,
            jobsPosted: p.client_jobs_posted || 0,
            avatar: p.client_avatar || "https://i.pravatar.cc/150",
            email: p?.userPortfolioDetails?.email || "example@example.com",
          },
          proposals: p.bids?.length || 0,
          postedTime: new Date(p.createdAt).toLocaleDateString(),
          location: p.location || "Remote",
          type: p.project_type || "Fixed Price",
          featured: p.featured || false,
        }));

        setJobs(formattedJobs);
      } catch (err) {
        console.error("Error fetching proposals:", err);
        setJobs([]);
      }
      setIsLoading(false);
    };

    fetchProposals();
  }, []);

  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === "All" ||
          job.skills.some((skill) =>
            skill
              .toLowerCase()
              .includes(
                selectedCategory
                  .toLowerCase()
                  .replace(" development", "")
                  .replace(" design", "")
              )
          );

        const matchesPrice =
          priceRange === "All" ||
          job.budget.includes(priceRange.split(" ")[0]) ||
          (priceRange === "$10,000+" &&
            parseInt(job.budget.split("-")[0].replace(/[^0-9]/g, "")) >= 10000);

        return matchesSearch && matchesCategory && matchesPrice;
      })
    : [];

  const toggleSaveJob = (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // For now, just show a message since we don't have more data
      console.log("Load more functionality can be implemented here");
    }, 1000);
  };

  const handleJobClick = (job) => {
    console.log("Navigating to job:", job.id);
    navigate(`/job/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      <div className=" pt-8 pb-6 px-4 sm:px-6 mt-[63px] lg:px-8 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-orbitron font-bold text-white mb-2">
              Browse Jobs
            </h1>
            <p className="text-sm text-gray-300 max-w-xl mx-auto">
              Discover amazing opportunities from clients around the world
            </p>
          </div>

          {/* Sticky Search and Filters */}
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl   rounded-2xl p-4 mb-4 shadow-2xl shadow-cyan-500/10">
            {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div> */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm w-full sm:w-auto"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-sm w-full sm:w-auto"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {/* Create Work Button */}
              <button
                onClick={() => navigate("/post-job")}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 text-sm w-full sm:w-auto"
              >
                + Create Work
              </button>
            </div>

            {/* Extended Filters with Animation */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                showFilters
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="mt-3 pt-3   grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                  >
                    {priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Job Type
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm">
                    <option>All Types</option>
                    <option>Fixed Price</option>
                    <option>Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Experience Level
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm">
                    <option>All Levels</option>
                    <option>Entry Level</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
            {/* <select className="px-3 py-2 bg-gray-900/50  -cyan-500/50 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <option>Most Recent</option>
              <option>Highest Budget</option>
              <option>Lowest Budget</option>
              <option>Most Proposals</option>
            </select> */}
          </div>

          {/* Job Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobs.has(job.id)}
                onToggleSave={() => toggleSaveJob(job.id)}
                onClick={() => handleJobClick(job)}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More Jobs"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseJobs;
