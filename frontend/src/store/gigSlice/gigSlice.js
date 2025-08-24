// store/gigSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const createInitialPackage = () => ({
  hourlyPay: "",
  duration: "",
  custom_ui: "no",
  code_reviews: "",
});

const initialState = {
  formData: {
    username: "",
    title: "",
    description: "",
    gigimage: "",
    images: [{ url: "" }],
    category: "",
    price: "",
    deliveryTime: "",
    faqs: [],
    about: "",
    tags: [],
    skills: [],
    badges: [],
    projects: undefined,
    status: "Available",
    location: "",
    responseTime: "",
    successRate: undefined,
    avatar: "",
  },
  packageData: {
    basic: createInitialPackage(),
    standard: createInitialPackage(),
    pro: createInitialPackage(),
  },
  currentStep: 1,
  loading: false,
  error: null,
  submissionStatus: "idle", // "idle", "pending", "succeeded", "failed"
  currentGigId: null,
};

export const fetchGig = createAsyncThunk(
  "gig/fetchGig",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `https://cryptolance-qgzz.onrender.com/api/gigs/${id}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

export const fetchGigs = createAsyncThunk(
  "gig/fetchGigs",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `https://cryptolance-qgzz.onrender.com/api/gigs${
        params ? `?${params}` : ""
      }`;
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

// ✅ Async thunk for submitting gig
export const submitGig = createAsyncThunk(
  "gig/submitGig",
  async ({ formData, packageData }, { rejectWithValue }) => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (!userToken) {
        return rejectWithValue("You are not logged in.");
      }

      const payload = {
        ...formData,
        deliveryTime: Number(formData.deliveryTime),
        images: formData.images.filter((img) => img.url),
        basic: {
          ...packageData.basic,
          hourlyPay: Number(packageData.basic.hourlyPay),
        },
        standard: {
          ...packageData.standard,
          hourlyPay: Number(packageData.standard.hourlyPay),
        },
        pro: {
          ...packageData.pro,
          hourlyPay: Number(packageData.pro.hourlyPay),
        },
      };
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      const { data } = await axios.post(
        "https://cryptolance-qgzz.onrender.com/api/gigs",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data.message : error.message
      );
    }
  }
);

export const updateGig = createAsyncThunk(
  "gig/updateGig",
  async ({ id, formData, packageData }, { rejectWithValue }) => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (!userToken) {
        return rejectWithValue("You are not logged in.");
      }

      const payload = {
        ...formData,
        deliveryTime: Number(formData.deliveryTime),
        images: Array.isArray(formData.images)
          ? formData.images.filter((img) => img?.url)
          : [],
        basic: {
          ...packageData.basic,
          hourlyPay: Number(packageData.basic.hourlyPay),
        },
        standard: {
          ...packageData.standard,
          hourlyPay: Number(packageData.standard.hourlyPay),
        },
        pro: {
          ...packageData.pro,
          hourlyPay: Number(packageData.pro.hourlyPay),
        },
      };
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      const { data } = await axios.put(
        `https://cryptolance-qgzz.onrender.com/api/gigs/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response ? err.response.data.message : err.message
      );
    }
  }
);

const gigSlice = createSlice({
  name: "gig",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    setPackageData: (state, action) => {
      const { pkgName, field, value } = action.payload;
      if (state.packageData[pkgName]) {
        state.packageData[pkgName] = {
          ...state.packageData[pkgName],
          [field]: value,
        };
      } else {
        console.warn(`Invalid package name: ${pkgName}`);
      }
    },
    nextStep: (state) => {
      if (state.currentStep < 3) state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },
    setCurrentGigId: (state, action) => {
      state.currentGigId = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    resetGig: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGig.fulfilled, (state, action) => {
        state.loading = false;
        state.formData = {
          ...state.formData,
          username: action.payload.username ?? state.formData.username,
          title: action.payload.title ?? state.formData.title,
          description: action.payload.description ?? state.formData.description,
          gigimage:
            action.payload.gigimage ??
            (Array.isArray(action.payload.images) &&
              action.payload.images[0]?.url) ??
            state.formData.gigimage,
          images:
            Array.isArray(action.payload.images) &&
            action.payload.images.length > 0
              ? action.payload.images
              : state.formData.images,
          category: action.payload.category ?? state.formData.category,
          price: action.payload.price ?? state.formData.price,
          deliveryTime:
            action.payload.deliveryTime ?? state.formData.deliveryTime,
          faqs: Array.isArray(action.payload.faqs)
            ? action.payload.faqs
            : state.formData.faqs,
          about: action.payload.about ?? state.formData.about,
          tags: Array.isArray(action.payload.tags)
            ? action.payload.tags
            : state.formData.tags,
          skills: Array.isArray(action.payload.skills)
            ? action.payload.skills
            : state.formData.skills,
          badges: Array.isArray(action.payload.badges)
            ? action.payload.badges
            : state.formData.badges,
          projects: action.payload.projects ?? state.formData.projects,
          status: action.payload.status ?? state.formData.status,
          location: action.payload.location ?? state.formData.location,
          responseTime:
            action.payload.responseTime ?? state.formData.responseTime,
          successRate: action.payload.successRate ?? state.formData.successRate,
          avatar: action.payload.avatar ?? state.formData.avatar,
        };
        state.packageData = {
          basic: {
            hourlyPay:
              action.payload.basic?.hourlyPay !== undefined
                ? String(action.payload.basic.hourlyPay)
                : "",
            duration: action.payload.basic?.duration ?? "",
            custom_ui: action.payload.basic?.custom_ui ?? "no",
            code_reviews: action.payload.basic?.code_reviews ?? "",
          },
          standard: {
            hourlyPay:
              action.payload.standard?.hourlyPay !== undefined
                ? String(action.payload.standard.hourlyPay)
                : "",
            duration: action.payload.standard?.duration ?? "",
            custom_ui: action.payload.standard?.custom_ui ?? "no",
            code_reviews: action.payload.standard?.code_reviews ?? "",
          },
          pro: {
            hourlyPay:
              action.payload.pro?.hourlyPay !== undefined
                ? String(action.payload.pro.hourlyPay)
                : "",
            duration: action.payload.pro?.duration ?? "",
            custom_ui: action.payload.pro?.custom_ui ?? "no",
            code_reviews: action.payload.pro?.code_reviews ?? "",
          },
        };
      })
      .addCase(fetchGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload; // Store the array of gigs
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitGig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submissionStatus = "pending";
      })
      .addCase(submitGig.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionStatus = "succeeded";
        state.currentGigId = action.payload._id;
      })
      .addCase(submitGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.submissionStatus = "failed";
      })
      .addCase(updateGig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submissionStatus = "pending";
      })
      .addCase(updateGig.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionStatus = "succeeded";
        state.currentGigId = action.payload._id; // Update with the edited gig ID
      })
      .addCase(updateGig.rejected, (state, action) => {
        state.loading = false;
        state.submissionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setPackageData,
  nextStep,
  prevStep,
  setCurrentGigId,
  setCurrentStep,
  resetGig,
} = gigSlice.actions;
export default gigSlice.reducer;
