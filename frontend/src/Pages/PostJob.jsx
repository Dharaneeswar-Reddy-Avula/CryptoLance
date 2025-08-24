"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  DollarSign,
  Clock,
  Wallet,
  Tag,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { toast } from "react-hot-toast";

// USDC uses 6 decimals; 1 USD = 1_000_000 micro-USDC
const USDC_DECIMALS = 6;
function scaleToUsdcMicro(usdValue) {
  const numeric = Number(usdValue);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 10 ** USDC_DECIMALS);
}

export default function PostCryptoProject() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    budget: "",
    project_duration: "",
    tags: [],
    skills_requirement: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Get auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(authToken);
    if (token) {
      setAuthToken(token);
    } else {
      toast.error("Please connect your wallet first");
      // Redirect to home or wallet connection page
    }
  }, []);

  const handleImageUpload = async (file) => {
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", "Freelance_Website"); // Replace with your Cloudinary upload preset
    data.append("cloud_name", "dd33ovgv1"); // Replace with your Cloudinary cloud name

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dd33ovgv1/image/upload`, // Replace with your Cloudinary cloud name
        {
          method: "POST",
          body: data,
        }
      );
      const result = await response.json();
      return result.secure_url; // Returns the Cloudinary URL
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authToken) {
      toast.error("Authentication required. Please connect your wallet.");
      return;
    }

    if (formData.skills_requirement.length === 0) {
      toast.error("At least one skill is required");
      return;
    }

    const scaledBudget = scaleToUsdcMicro(formData.budget);
    if (scaledBudget === null) {
      toast.error("Please enter a valid budget amount in USD");
      return;
    }

    setIsLoading(true);

    try {
      // Handle image upload if a file is selected
      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await handleImageUpload(selectedFile);
        if (!imageUrl) {
          setIsLoading(false);
          return;
        }
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      }
      console.log("Image URL after upload:", imageUrl);
      const submissionData = {
        ...formData,
        // Send scaled budget in micro-USDC (6 decimals)
        budget: scaledBudget,
      };

      console.log("Submitting proposal with data:", submissionData);
      console.log("Using auth token:", authToken ? "Token exists" : "No token");

      // Try both relative and absolute URLs
      const apiUrl = "https://cryptolance-qgzz.onrender.com";
      const endpoint = `${apiUrl}/api/proposals`;

      console.log("Making request to:", endpoint);
      console.log("Environment VITE_API_URL:", import.meta.env.VITE_API_URL);

      // First check if backend is accessible
      try {
        const healthCheck = await fetch(`${apiUrl}/health`, { method: "GET" });
        console.log("Backend health check status:", healthCheck.status);
      } catch (healthError) {
        console.warn("Backend health check failed:", healthError);
        // Try relative URL as fallback
        console.log("Trying relative URL as fallback...");
      }

      // Also try to check if the proposals endpoint exists
      try {
        const proposalsCheck = await fetch(`${apiUrl}/api/proposals`, {
          method: "GET",
        });
        console.log("Proposals endpoint check status:", proposalsCheck.status);
      } catch (proposalsCheckError) {
        console.warn("Proposals endpoint check failed:", proposalsCheckError);
      }

      // Test basic connectivity to root endpoint
      try {
        const rootCheck = await fetch(`${apiUrl}/`, { method: "GET" });
        const rootText = await rootCheck.text();
        console.log(
          "Root endpoint check status:",
          rootCheck.status,
          "Response:",
          rootText
        );
      } catch (rootCheckError) {
        console.warn("Root endpoint check failed:", rootCheckError);
      }

      let response;
      try {
        console.log("Attempting request to:", endpoint);
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
          body: JSON.stringify(submissionData),
        });
        console.log("Request successful to:", endpoint);
      } catch (fetchError) {
        console.error("Fetch error to absolute URL:", fetchError);
        // Try relative URL as fallback
        console.log("Trying relative URL as fallback...");
        try {
          response = await fetch("/api/proposals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              Accept: "application/json",
            },
            body: JSON.stringify(submissionData),
          });
          console.log("Request successful to relative URL");
        } catch (relativeFetchError) {
          console.error("Fetch error to relative URL:", relativeFetchError);
          throw new Error(
            "Failed to connect to both absolute and relative URLs"
          );
        }
      }

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response has content
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let result;
      try {
        // Try to parse as JSON if there's content
        if (responseText.trim()) {
          result = JSON.parse(responseText);
        } else {
          result = null;
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw response:", responseText);
        throw new Error("Invalid response format from server");
      }

      if (response.ok) {
        toast.success("Proposal created successfully!");
        console.log("Proposal created:", result);
        // Reset form or redirect
        setFormData({
          title: "",
          description: "",
          image: "",
          budget: "",
          project_duration: "",
          tags: [],
          skills_requirement: [],
        });
        setCurrentStep(1);
      } else {
        const errorMessage =
          result?.message || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(errorMessage);
        console.error("API Error:", result);
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      if (error.message === "Invalid response format from server") {
        toast.error("Server returned invalid response. Please try again.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !formData.skills_requirement.includes(newSkill.trim())
    ) {
      setFormData({
        ...formData,
        skills_requirement: [...formData.skills_requirement, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills_requirement: formData.skills_requirement.filter(
        (skill) => skill !== skillToRemove
      ),
    });
  };

  const stepTitles = ["Basic Info", "Requirements", "Review"];
  const stepIcons = [FileText, Tag, CheckCircle];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.description &&
          formData.budget &&
          formData.project_duration
        );
      case 2:
        return formData.skills_requirement.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-2 md:mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-6xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Post Your Project
            </h1>
            <p className="text-md md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Submit a detailed proposal for your blockchain project and connect
              with top-tier developers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 md:space-x-8">
              {[1, 2, 3].map((step) => {
                const Icon = stepIcons[step - 1];
                const isActive = currentStep >= step;
                const isCompleted = currentStep > step;

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-semibold text-sm md:text-lg transition-all duration-300 ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                            : isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                            : "bg-slate-700 text-gray-400 border border-slate-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                        ) : (
                          <Icon className="w-6 h-6 md:w-8 md:h-8" />
                        )}
                      </div>
                      <span
                        className={`text-xs md:text-sm mt-2 font-medium transition-colors ${
                          isActive ? "text-blue-400" : "text-gray-500"
                        }`}
                      >
                        {stepTitles[step - 1]}
                      </span>
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 md:w-16 h-1 mx-2 md:mx-4 transition-all duration-300 ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Project Details
                    </h2>
                    <p className="text-gray-400">Tell us about your project</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-white mb-3">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., DeFi Trading Dashboard with Smart Contracts"
                        className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all duration-200 hover:border-slate-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">
                        Budget (USD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: e.target.value })
                          }
                          placeholder="5000"
                          min="100"
                          className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all duration-200 hover:border-slate-500/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">
                        Project Duration *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                        <select
                          value={formData.project_duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              project_duration: e.target.value,
                            })
                          }
                          className="w-[100%] pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base appearance-none transition-all duration-200 hover:border-slate-500/50 cursor-pointer"
                          required
                        >
                          <option value="">Select duration</option>
                          <option value="1-2 weeks">1-2 weeks</option>
                          <option value="3-4 weeks">3-4 weeks</option>
                          <option value="1-2 months">1-2 months</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6+ months">6+ months</option>
                        </select>
                        <ArrowRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-white mb-3">
                        Project Image
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all duration-200 hover:border-slate-500/50"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-white mb-3">
                        Project Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your blockchain project requirements, goals, and technical specifications in detail..."
                        rows={4}
                        className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none text-base transition-all duration-200 hover:border-slate-500/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Requirements */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Project Requirements
                    </h2>
                    <p className="text-gray-400">
                      Define the skills and tags needed
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">
                        Required Skills *
                      </label>
                      <div className="flex  gap-3 mb-4">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="e.g., Solidity, React, Web3.js"
                          className="flex-1 w-[70%] sm:w-full px-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base transition-all duration-200 hover:border-slate-500/50"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSkill())
                          }
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-6 py-4  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {formData.skills_requirement.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {formData.skills_requirement.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-lg shadow-blue-500/25"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="hover:bg-blue-700 rounded-full p-1 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">
                            At least one skill is required
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">
                        Project Tags
                      </label>
                      <div className="flex gap-3 mb-4">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="e.g., DeFi, NFT, DAO"
                          className="flex-1 px-4 py-4 w-[70%] sm:w-full bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-base transition-all duration-200 hover:border-slate-500/50"
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center gap-2 font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg shadow-purple-500/25"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:bg-purple-700 rounded-full p-1 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Review & Submit
                    </h2>
                    <p className="text-gray-400">
                      Double-check your project details
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Project Title
                          </span>
                        </div>
                        <p className="text-white font-semibold text-lg">
                          {formData.title}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">Budget</span>
                        </div>
                        <p className="text-white font-semibold text-lg">
                          ${formData.budget}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Duration</span>
                        </div>
                        <p className="text-white font-semibold text-lg">
                          {formData.project_duration}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Skills Required
                          </span>
                        </div>
                        <p className="text-white font-semibold text-lg">
                          {formData.skills_requirement.length} skills
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Description</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {formData.description}
                      </p>
                    </div>

                    {formData.skills_requirement.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Required Skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills_requirement.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Project Tags
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.image && (
                    <div className="bg-slate-700/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Project Image
                        </span>
                      </div>
                      <img
                        src={formData.image}
                        alt="Project preview"
                        className="w-full h-32 object-cover rounded-xl border border-slate-600/50"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='128' viewBox='0 0 400 128'%3E%3Crect width='400' height='128' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='system-ui' font-size='14'%3EImage Preview%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      Blockchain Escrow Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Smart contract security</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Automatic payments</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Dispute resolution</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Zero platform fees</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-blue-500 rounded border-slate-600 bg-slate-700"
                        required
                      />
                      <span className="text-sm text-gray-300">
                        I agree to the terms and conditions
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-slate-700/50">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors text-base font-medium bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600/50 hover:border-slate-500/50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || !canProceed()}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:shadow-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 " />
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
