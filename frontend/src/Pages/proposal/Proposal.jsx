import { useState, useEffect } from "react";
import BasicInfoStep from "../../Components/proposal/BasicInfo";
import ProjectDetailsStep from "../../Components/proposal/ProjectDetails";
import BudgetTimelineStep from "../../Components/proposal/BudgetTimeline";
import SkillsTagsStep from "../../Components/proposal/SkillTags";
import ReviewSubmitStep from "../../Components/proposal/ReviewSubmit";
import ProgressIndicator from "./ProgressIndicator";
import Navbar from "../../Components/Navbar";
import { toast } from "react-hot-toast";
import { Wallet, Upload, X, Image as ImageIcon } from "lucide-react";

// USDC uses 6 decimals; 1 USD = 1_000_000 micro-USDC
const USDC_DECIMALS = 6;
function scaleToUsdcMicro(usdValue) {
  const numeric = Number(usdValue);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 10 ** USDC_DECIMALS);
}

const steps = [
  { id: 1, title: "Basic Info", component: BasicInfoStep },
  { id: 2, title: "Project Details", component: ProjectDetailsStep },
  { id: 3, title: "Budget & Timeline", component: BudgetTimelineStep },
  { id: 4, title: "Skills & Tags", component: SkillsTagsStep },
  { id: 5, title: "Review & Submit", component: ReviewSubmitStep },
];

export default function Proposal() {
  const [proposals, setProposals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    budget: "",
    project_duration: "",
    tags: [],
    skills_requirement: [],
    isEditable: true,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Get auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      toast.error("Please connect your wallet first");
      // Redirect to home or wallet connection page
    }
  }, []);

  const handleImageUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
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

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async () => {
    if (!authToken) {
      toast.error("Authentication required. Please connect your wallet.");
      return;
    }

    if (isSubmitting) {
      toast.error("Submission already in progress. Please wait.");
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

    setIsSubmitting(true);
    setLoading(true);
    setError("");
    setSuccess(false);
    console.log("hi submit");

    try {
      // Handle image upload if a file is selected
      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await handleImageUpload(selectedFile);
        if (!imageUrl) {
          setLoading(false);
          setIsSubmitting(false);
          return;
        }
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      }

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
        setSuccess(true);
        toast.success("Proposal created successfully!");
        console.log("Proposal created:", result);

        // Reset form after success
        setFormData({
          title: "",
          description: "",
          image: "",
          budget: "",
          project_duration: "",
          tags: [],
          skills_requirement: [],
          isEditable: true,
        });
        setCurrentStep(1);
        setSelectedFile(null);
      } else {
        const errorMessage =
          result?.message || `HTTP ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("API Error:", result);
      }
    } catch (err) {
      const errorMessage =
        err.message === "Invalid response format from server"
          ? "Server returned invalid response. Please try again."
          : err.message || "Network error. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating proposal:", err);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // const fetchProposals = async () => {
  //   try {
  //     const res = await fetch("https://cryptolance-qgzz.onrender.com/api/proposals");
  //     const data = await res.json();
  //     setProposals(data);
  //   } catch (err) {
  //     console.error("Error fetching proposals:", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchProposals();
  // }, []);

  const CurrentStepComponent = steps.find((step) => step.id === currentStep)
    ?.component;

  // Show authentication required message if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="mx-auto px-4 py-8 w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] mt-[70px] md:mt-[50px]">
        <Navbar />
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            You need to connect your wallet to create a proposal. Please connect
            your wallet first and then return to this page.
          </p>
          <button
            onClick={() => (window.location.href = "/connect")}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 w-[95%] md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] mt-[70px] md:mt-[50px]">
      <Navbar />
      <div className="mb-4"></div>
      {/* Header */}
      <div className="text-center md:mb-8 mb-4">
        <h1 className="md:text-5xl text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
          Create Your Proposal
        </h1>
        <p className="text-gray-300 md:text-lg text-sm">
          Tell us about your project and find the perfect Web3 developer
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        steps={steps}
        currentStep={currentStep}
        className="mb-8"
      />

      {/* Main Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isAnimating
              ? "opacity-0 transform translate-x-4"
              : "opacity-100 transform translate-x-0"
          }`}
        >
          {CurrentStepComponent && (
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
              currentStep={currentStep}
              totalSteps={steps.length}
              handleSubmit={handleSubmit}
              loading={loading}
              success={success}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleImageUpload={handleImageUpload}
              isSubmitting={isSubmitting}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileSelect={handleFileSelect}
              removeImage={removeImage}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-400">
        <p>
          Step {currentStep} of {steps.length}
        </p>
        {error && <p className="text-red-400 mt-2">{error}</p>}
        {/* {success && <p className="text-green-400 mt-2">✅ Proposal created successfully!</p>} */}
      </div>
    </div>
  );
}
