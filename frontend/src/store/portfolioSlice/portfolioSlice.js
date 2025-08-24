import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  portfolioData: {
    heroSection: {
      name: "",
      domains: [""],
      thoughtLine: "",
      aboutMe: "",
      expertise: [""],
      focusAreas: [""],
      profile: "",
    },
    contactInfo: {
      email: "",
      phoneNumber: "",
      linkedinProfile: "",
    },
    currentStatus: [
      {
        _id: Date.now().toString(),
        status: "",
        color: "purple",
        isActive: true,
      },
    ],
    techHighlights: [
      {
        technology: "",
        rating: 1,
        description: "",
      },
    ],
    projects: [],
    techStack: [],
    workExperience: [],
    education: [],
    userGigs: [], // Array of gig IDs
  },
  loading: false,
  error: null,
  activeTab: "overview",
  isSubmitting: false,
  submitMessage: "",
  portfolioId: null,
  otp: ["", "", "", "", "", ""],
  isVerifying: false,
  isResending: false,
  verificationMessage: "",
  email: "",
  isEditingStatus: false,
  editStatus: [],
  isSaving: false,
  isEditingHero: false,
  editHeroData: {},
  isEditingProjects: false,
  editProjects: [],
  gigs: [],
  gigsLoading: false,
  gigsError: null,
  isEditingTech: false,
  editTechHighlights: [],
  techSaving: false,
};

export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetchPortfolio",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }

      const response = await axios.get(
        "https://cryptolance-qgzz.onrender.com/api/portfolio/me",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch portfolio");
      }

      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

export const fetchGigs = createAsyncThunk(
  "portfolio/fetchGigs",
  async (gigIds, { rejectWithValue }) => {
    try {
      const API_BASE =
        process.env.REACT_APP_API_BASE ||
        "https://cryptolance-qgzz.onrender.com";
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }

      if (!Array.isArray(gigIds) || gigIds.length === 0) {
        return [];
      }

      const requests = gigIds.map((id) =>
        axios.get(`${API_BASE}/api/gigs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: new AbortController().signal,
        })
      );

      const results = await Promise.allSettled(requests);

      const extract = (resp) => {
        if (!resp) return null;
        const candidate = resp.data ?? resp;
        if (candidate && candidate.data && typeof candidate.data === "object") {
          return candidate.data;
        }
        return candidate;
      };

      const successful = results
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => extract(r.value))
        .filter(Boolean);

      const normalized = successful.map((item) =>
        item && item.data ? item.data : item
      );

      if (normalized.length === 0) {
        throw new Error("No gigs found for the provided IDs.");
      }

      return normalized;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

export const createPortfolio = createAsyncThunk(
  "portfolio/createPortfolio",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }

      const cleanedFormData = {
        ...formData,
        currentStatus: formData.currentStatus.map(({ _id, ...rest }) => rest),
      };

      const response = await axios.post(
        "https://cryptolance-qgzz.onrender.com/api/portfolio/otp/send",
        cleanedFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create portfolio");
      }

      return response.data;
    } catch (err) {
      console.error("Error in createPortfolio:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

export const updatePortfolio = createAsyncThunk(
  "portfolio/updatePortfolio",
  async ({ portfolioId, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }

      const response = await axios.put(
        `https://cryptolance-qgzz.onrender.com/api/portfolio`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update portfolio");
      }

      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "portfolio/verifyOtp",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { portfolio: state } = getState();
      const token = localStorage.getItem("authToken");
      const portfolioId = sessionStorage.getItem("portfolioId");

      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }
      if (!portfolioId) {
        throw new Error("Portfolio ID is missing");
      }

      const otpString = state.otp.join("");
      if (otpString.length !== 6) {
        throw new Error("Please enter all 6 digits");
      }

      const response = await axios.post(
        "https://cryptolance-qgzz.onrender.com/api/portfolio/otp/verify",
        { email: state.email, otp: otpString, portfolioId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "OTP verification failed");
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "portfolio/resendOtp",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { portfolio: state } = getState();
      const token = localStorage.getItem("authToken");
      const portfolioId = sessionStorage.getItem("portfolioId");

      if (!token) {
        throw new Error("No auth token found. Please log in.");
      }
      if (!portfolioId) {
        throw new Error("Portfolio ID is missing");
      }
      if (!state.email) {
        throw new Error("Email not found. Please go back and try again.");
      }

      const response = await axios.post(
        "https://cryptolance-qgzz.onrender.com/api/portfolio/otp/resend",
        { email: state.email, portfolioId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to resend OTP");
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setPortfolioData: (state, action) => {
      state.portfolioData = { ...state.portfolioData, ...action.payload };
    },
    updateArrayItem: (state, action) => {
      const { section, field, index, value } = action.payload;

      if (
        state.portfolioData &&
        state.portfolioData[section] &&
        Array.isArray(state.portfolioData[section][field])
      ) {
        state.portfolioData[section][field] = state.portfolioData[section][
          field
        ].map((item, i) => (i === index ? value : item));
      } else {
        console.error("Invalid state path or non-array field:", {
          section,
          field,
          state: state.portfolioData,
        });
      }
    },
    addArrayItem: (state, action) => {
      const { section, field, defaultValue } = action.payload;

      if (
        section === "portfolioData" &&
        Array.isArray(state.portfolioData[field])
      ) {
        state.portfolioData[field].push(defaultValue);
      } else if (
        state.portfolioData &&
        state.portfolioData[section] &&
        Array.isArray(state.portfolioData[section][field])
      ) {
        state.portfolioData[section][field].push(defaultValue);
      } else {
        console.error("Invalid state path or non-array field:", {
          section,
          field,
        });
      }
    },
    removeArrayItem: (state, action) => {
      const { section, field, index } = action.payload;

      if (
        section === "portfolioData" &&
        Array.isArray(state.portfolioData[field])
      ) {
        state.portfolioData[field].splice(index, 1);
      } else if (
        state.portfolioData &&
        state.portfolioData[section] &&
        Array.isArray(state.portfolioData[section][field])
      ) {
        state.portfolioData[section][field].splice(index, 1);
      } else {
        console.error("Invalid state path or non-array field:", {
          section,
          field,
        });
      }
    },
    updateNestedField: (state, action) => {
      const { section, field, value } = action.payload;
      if (state.portfolioData[section]) {
        state.portfolioData[section] = {
          ...state.portfolioData[section],
          [field]: value,
        };
      }
    },
    updateCurrentStatus: (state, action) => {
      const { index, field, value } = action.payload;

      if (Array.isArray(state.editStatus) && state.editStatus[index]) {
        state.editStatus[index] = {
          ...state.editStatus[index],
          [field]: value,
        };
      } else {
        console.error("Invalid editStatus array or index out of range:", {
          index,
          editStatus: state.editStatus,
        });
      }
    },
    updateCurrentStatusCreation: (state, action) => {
      const { index, field, value } = action.payload;

      if (
        state.portfolioData &&
        Array.isArray(state.portfolioData.currentStatus)
      ) {
        state.portfolioData.currentStatus[index] = {
          ...state.portfolioData.currentStatus[index],
          [field]: value,
        };
      } else {
        console.error("Invalid currentStatus array:", {
          state: state.portfolioData,
        });
      }
    },

    setEditStatus: (state, action) => {
      state.editStatus = action.payload.map((s) => ({ ...s }));
    },
    toggleEditingStatus: (state) => {
      state.isEditingStatus = !state.isEditingStatus;
      state.editStatus = state.portfolioData.currentStatus.map((s) => ({
        ...s,
        _id: s._id || Date.now().toString(),
      }));
    },
    addNewStatus: (state) => {
      if (state.editStatus.length >= 3) return;
      const newStatus = {
        _id: Date.now().toString(),
        status: "",
        color: "blue",
        isActive: true,
      };
      state.editStatus = [...state.editStatus, newStatus];
    },
    removeStatus: (state, action) => {
      const { id } = action.payload;
      state.editStatus = state.editStatus.filter((status) => status._id !== id);
    },
    saveCurrentStatus: (state) => {
      state.currentStatus = state.editStatus.map((item, index) => ({
        ...item,
        _id:
          item._id ||
          state.currentStatus[index]?._id ||
          Date.now().toString() + index,
      }));
      state.isEditingStatus = false;
    },
    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },

    toggleEditingHero: (state) => {
      state.isEditingHero = !state.isEditingHero;
      if (state.isEditingHero) {
        state.editHeroData = { ...state.portfolioData.heroSection };
      }
    },
    updateHeroField: (state, action) => {
      const { field, value } = action.payload;
      state.editHeroData = { ...state.editHeroData, [field]: value };
    },
    saveHeroSection: (state) => {
      state.portfolioData.heroSection = { ...state.editHeroData };
      state.isEditingHero = false;
      state.editHeroData = { ...state.portfolioData.heroSection };
    },
    toggleEditingProjects: (state) => {
      state.isEditingProjects = !state.isEditingProjects;
      if (!state.isEditingProjects) {
        state.editProjects = state.portfolioData.projects.map((p) => ({
          ...p,
        }));
      } else {
        state.editProjects = state.portfolioData.projects.map((p) => ({
          ...p,
        }));
      }
    },
    updateProjectField: (state, action) => {
      const { id, field, value } = action.payload;
      state.editProjects = state.editProjects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      );
    },
    addNewProject: (state) => {
      const newProject = {
        id: Date.now(),
        name: "New Project",
        description: "Project description here...",
        technologies: ["React"],
        liveUrl: "",
        githubUrl: "",
        icon: "🚀",
        category: "Web App",
      };
      state.editProjects = [...state.editProjects, newProject];
    },
    removeProject: (state, action) => {
      const { id } = action.payload;
      state.editProjects = state.editProjects.filter(
        (project) => project.id !== id
      );
    },
    saveProjects: (state) => {
      state.portfolioData.projects = state.editProjects.map((project) => ({
        ...project,
        id: project.id || Date.now().toString(),
      }));
      state.isEditingProjects = false;
    },
    toggleEditingTech: (state) => {
      state.isEditingTech = !state.isEditingTech;
      if (!state.isEditingTech) {
        state.editTechHighlights = state.portfolioData.techHighlights.map(
          (t) => ({ ...t })
        );
      } else {
        state.editTechHighlights = state.portfolioData.techHighlights.map(
          (t) => ({ ...t })
        );
      }
    },
    updateTechHighlight: (state, action) => {
      const { index, field, value } = action.payload;
      if (
        Array.isArray(state.editTechHighlights) &&
        index >= 0 &&
        index < state.editTechHighlights.length
      ) {
        state.editTechHighlights[index] = {
          ...state.editTechHighlights[index],
          [field]: value,
        };
      } else {
        console.error(
          "Invalid editTechHighlights array or index out of range:",
          {
            index,
            editTechHighlights: state.editTechHighlights,
          }
        );
      }
    },
    updateTechHighlightCreation: (state, action) => {
      const { index, field, value } = action.payload;
      if (Array.isArray(state.portfolioData.techHighlights)) {
        state.portfolioData.techHighlights = state.portfolioData.techHighlights.map(
          (item, i) => (i === index ? { ...item, [field]: value } : item)
        );
      }
    },

    addNewTechHighlight: (state) => {
      if (state.editTechHighlights.length >= 4) return;
      const newTech = {
        technology: "",
        rating: 3,
        description: "",
      };
      state.editTechHighlights = [...state.editTechHighlights, newTech];
    },
    removeTechHighlight: (state, action) => {
      const { index } = action.payload;
      state.editTechHighlights = state.editTechHighlights.filter(
        (_, i) => i !== index
      );
    },
    saveTechHighlights: (state) => {
      state.portfolioData.techHighlights = state.editTechHighlights.map(
        (tech) => ({ ...tech })
      );
      state.isEditingTech = false;
    },
    setTechSaving: (state, action) => {
      state.techSaving = action.payload;
    },
    updateOtpDigit: (state, action) => {
      const { index, value } = action.payload;
      state.otp[index] = value;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    resetOtp: (state) => {
      state.otp = ["", "", "", "", "", ""];
    },
    resetPortfolio: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchGigs.pending, (state) => {
        state.gigsLoading = true;
        state.gigsError = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.gigsLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.gigsLoading = false;
        state.gigsError = action.payload || "Failed to load gigs";
      })
      .addCase(createPortfolio.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.submitMessage = "";
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitMessage =
          "Portfolio created successfully! Redirecting for OTP verification.";
        state.portfolioId = action.payload.portfolioId;
      })
      .addCase(createPortfolio.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitMessage = `Error: ${
          action.payload || "Failed to create portfolio"
        }`;
      })
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolioData = {
          ...state.portfolioData,
          ...action.payload,
          heroSection: action.payload.heroSection || {},
          projects: action.payload.projects || [],
          currentStatus: action.payload.currentStatus || [],
          techHighlights: action.payload.techHighlights || [],
          techStack: action.payload.techStack || [],
          workExperience: action.payload.workExperience || [],
          education: action.payload.education || [],
          userGigs: action.payload.userGigs || [],
        };
        state.editStatus =
          action.payload.currentStatus || initialState.currentStatus;
        state.editTechHighlights =
          action.payload.techHighlights || initialState.techHighlights;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolioData = {
          ...state.portfolioData,
          ...action.payload,
        };
        state.currentStatus =
          action.payload.currentStatus || state.currentStatus;
        state.editStatus = action.payload.currentStatus || state.editStatus;
        state.techHighlights =
          action.payload.techHighlights || state.techHighlights;
        state.editTechHighlights =
          action.payload.techHighlights || state.editTechHighlights;
      })
      .addCase(updatePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isVerifying = true;
        state.verificationMessage = "";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isVerifying = false;
        state.verificationMessage =
          "Verification successful! Redirecting to your portfolio...";
        state.portfolioId = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isVerifying = false;
        state.verificationMessage = `Error: ${
          action.payload || "OTP verification failed"
        }`;
        state.otp = ["", "", "", "", "", ""];
      })
      .addCase(resendOtp.pending, (state) => {
        state.isResending = true;
        state.verificationMessage = "";
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isResending = false;
        state.verificationMessage = "New OTP sent to your email!";
        state.otp = ["", "", "", "", "", ""];
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isResending = false;
        state.verificationMessage = `Error: ${
          action.payload || "Failed to resend OTP"
        }`;
      });
  },
});

export const {
  setActiveTab,
  setPortfolioData,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  updateNestedField,
  updateCurrentStatus,
  updateCurrentStatusCreation,

  setEditStatus,
  toggleEditingStatus,
  addNewStatus,
  removeStatus,
  saveCurrentStatus,
  setIsSaving,
  toggleEditingHero,
  updateHeroField,
  saveHeroSection,
  toggleEditingProjects,
  updateProjectField,
  addNewProject,
  removeProject,
  saveProjects,
  toggleEditingTech,
  updateTechHighlight,
  updateTechHighlightCreation,

  addNewTechHighlight,
  removeTechHighlight,
  saveTechHighlights,
  setTechSaving,
  updateOtpDigit,
  setEmail,
  resetOtp,
  resetPortfolio,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
