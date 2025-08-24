// const axios = require("axios");

// // Cloudinary image URLs

// const imageUrls = [
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1708471137/catalog/1552364677838041088/rvqbvwquyk4x39epw62i.webp",--social media
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1747725594/catalog/1882743427529191059/ndv0jyvlhn0b1ayolit6.jpg",--video editing
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709863439/catalog/1406217628538023936/rkn2utrigzlfgls4bjwo.webp",--apis
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1718192578/catalog/1800855874619910922/thbtvi6nwcdvxiugkb7v.jpg",--mern stack dev
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1726046448/catalog/1767818726276960256/tdmkn4kpzo4hweqtxl29.jpg",--mern
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1685648546/catalog/1664352322587869184/kvqo0y0eh2bimipfetoa.jpg",--vid3o editing
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709160115/catalog/1608794882825756672/vhojuudksjbe3hwnbiin.webp",--video
//   "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709826135/catalog/1319284315255795712/odnk1a94v5npf75b1lqz.webp",--videoediting
// ];


// // List of usernames
// const usernames = [
//   "Sribabu",
//   "Nakshatra",
//   "Nandeesh",
//   "Rakesh",
//   "Dharaneeshwar",
//   "Sireesha",
//   "Bindu",
//   "Bhanu",
//   "Divya",
//   "Sailaja",
//   "Yagna",
//   "Harry Potter",
//   "Hermione Granger",
//   "Ben Tenisoon",
// ];

// // Bearer token - REPLACE WITH A VALID TOKEN
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhjOTBjYTIxNzlhNGI1MmM4ZGQ1NTZjOTI4NzM0MGZjMmE3Nzg0YmI1IiwiaWF0IjoxNzU2MDE3NTI5LCJleHAiOjE3NTYxMDM5Mjl9.XbqSocrrqDd7N8W3jIVt97vaVz5SKe11BsTUfRYTQTQ"; // TODO: Replace with new token

// // API endpoint
// const apiUrl = "http://localhost:3001/api/gigs/";

// // Predefined data for randomization
// const categories = [
//   "Web Development",
//   "Graphic Design",
//   "Digital Marketing",
//   "Content Writing",
//   "Video Editing",
//   "Mobile App Development",
//   "SEO Services",
//   "UI/UX Design",
// ];

// const titles = [
//   "{category} for Your Business",
//   "Professional {category}",
//   "High-Quality {category} Solutions",
//   "Custom {category} for Your Needs",
//   "Expert {category} to Boost Your Brand",
// ];

// const descriptions = [
//   "I offer professional {category} services tailored to your needs. With years of experience, I ensure high-quality results delivered on time.",
//   "Looking for top-notch {category}? I'm here to help with customized solutions to meet your business goals.",
//   "Get expert {category} services with a focus on quality, creativity, and efficiency. Let's bring your vision to life!",
//   "Specializing in {category}, I provide reliable and innovative solutions to help your business grow.",
// ];

// const tags = [
//   ["web", "development", "coding"],
//   ["graphic", "design", "branding"],
//   ["marketing", "digital", "ads"],
//   ["writing", "content", "blog"],
//   ["video", "editing", "production"],
//   ["app", "mobile", "development"],
//   ["seo", "optimization", "search"],
//   ["ui", "ux", "design"],
// ];

// const skills = [
//   ["JavaScript", "React", "Node.js"],
//   ["Photoshop", "Illustrator", "Figma"],
//   ["Google Ads", "SEO", "Social Media"],
//   ["Copywriting", "Editing", "SEO Writing"],
//   ["Premiere Pro", "After Effects", "Color Grading"],
//   ["Flutter", "React Native", "Swift"],
//   ["On-page SEO", "Off-page SEO", "Keyword Research"],
//   ["Wireframing", "Prototyping", "User Testing"],
// ];

// const faqs = [
//   {
//     question: "What is included in the service?",
//     answer:
//       "The service includes a complete {category} package tailored to your requirements.",
//   },
//   {
//     question: "How long will it take to complete?",
//     answer:
//       "The delivery time is specified in the gig details, typically {deliveryTime} days.",
//   },
//   {
//     question: "Do you offer revisions?",
//     answer:
//       "Yes, revisions are included in all packages to ensure your satisfaction.",
//   },
// ];

// // Helper function to generate random number
// const getRandomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1)) + min;

// // Helper function to pick random element from array
// const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// // Helper function to generate random package
// const generatePackage = (basePrice, multiplier) => ({
//   hourlyPay: basePrice * multiplier,
//   duration: `${getRandomInt(1, 4)} weeks`,
//   custom_ui: getRandomElement(["yes", "no", "client_choice"]),
//   code_reviews: getRandomElement(["Included", "Optional", "Not Included"]),
// });

// // Generate a single gig payload
// const generateGigPayload = () => {
//   const category = getRandomElement(categories);
//   const titleTemplate = getRandomElement(titles);
//   const descriptionTemplate = getRandomElement(descriptions);
//   const basePrice = getRandomInt(50, 500);
//   const selectedUsername = getRandomElement(usernames);

//   const payload = {
//     username: selectedUsername,
//     title: titleTemplate.replace("{category}", category),
//     description: descriptionTemplate.replace("{category}", category),
//     gigimage: getRandomElement(imageUrls),
//     images: [
//       { url: getRandomElement(imageUrls) },
//       { url: getRandomElement(imageUrls) },
//     ],
//     price: basePrice.toString(),
//     category,
//     deliveryTime: getRandomInt(3, 10),
//     faqs,
//     about: `Experienced professional in ${category} with a passion for delivering high-quality work.`,
//     tags: tags[categories.indexOf(category)],
//     skills: skills[categories.indexOf(category)],
//     basic: generatePackage(basePrice, 1),
//     standard: generatePackage(basePrice, 2),
//     pro: generatePackage(basePrice, 3),
//     badges: ["Top Rated", "Fast Delivery"],
//     rating: getRandomInt(3, 5),
//     projects: getRandomInt(10, 100),
//     status: getRandomElement(["Available", "Unavailable"]),
//     location: getRandomElement(["New York", "London", "Tokyo", "Remote"]),
//     responseTime: `${getRandomInt(1, 24)} hours`,
//     successRate: getRandomInt(80, 100),
//     avatar: getRandomElement(imageUrls),
//   };

//   console.log(
//     `Generated payload: username=${payload.username}, title=${payload.title}`
//   );
//   console.log(`Basic package:`, payload.basic);
//   console.log(`Standard package:`, payload.standard);
//   console.log(`Pro package:`, payload.pro);
//   return payload;
// };

// // Function to create a single gig
// const createGig = async (payload) => {
//   try {
//     const response = await axios.post(apiUrl, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     console.log(
//       `✅ Gig created: ${payload.title} (Sent Username: ${payload.username}, Response Username: ${response.data.username})`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       `❌ Error creating gig "${payload.title}" (Sent Username: ${payload.username}):`,
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// // Main function to create 20 gigs
// const createMultipleGigs = async (count = 20) => {
//   console.log(`Starting to create ${count} gigs...`);
//   const gigs = [];

//   for (let i = 0; i < count; i++) {
//     const payload = generateGigPayload();
//     try {
//       const result = await createGig(payload);
//       gigs.push(result);
//     } catch (error) {
//       console.error(`Failed to create gig ${i + 1}`);
//       if (error.response?.data?.message === "Invalid token") {
//         console.error(
//           "🛑 Stopping due to invalid token. Please update the token and retry."
//         );
//         break;
//       }
//     }
//   }

//   console.log(`🎉 Successfully created ${gigs.length} gigs.`);
//   return gigs;
// };

// // Run the script
// createMultipleGigs(20)
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error("Script failed:", err);
//     process.exit(1);
//   });


/**
 * Seed 20 gigs where the chosen image determines category-specific data.
 * Usage: node seed_gigs_by_image.js
 * - Works with Node 18+.
 */

import axios from "axios";

// ====== CONFIG ======
const apiUrl = "https://cryptolance-qgzz.onrender.com/api/gigs/"; // <-- change if needed
const token =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhjOTBjYTIxNzlhNGI1MmM4ZGQ1NTZjOTI4NzM0MGZjMmE3Nzg0YmI1IiwiaWF0IjoxNzU2MDQyMDQ5LCJleHAiOjE3NTYxMjg0NDl9.7xAmCZHaQnQWrv6xBmlOUPI4lv9L8HiAYMHrq-R3n1c"
// ====== IMAGE→PROFILE MAPPING ======
// Each entry binds an image to a domain with titles/descriptions/tags/skills tailored to it.
const imageProfiles = [
  {
    // Social Media Marketing
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1708471137/catalog/1552364677838041088/rvqbvwquyk4x39epw62i.webp",
    label: "social-media",
    category: "Digital Marketing",
    sampleTitles: [
      "High-Impact Social Media Marketing for Your Brand",
      "Result-Driven Social Media Strategy & Management",
      "Social Media Growth: Content, Calendar & Analytics",
      "Instagram, Facebook & LinkedIn Organic Growth",
      "Paid Social Campaigns to Boost Conversions"
    ],
    sampleDescriptions: [
      "I plan & execute social media strategies tailored to your niche, focusing on content calendars, creatives, and audience growth with measurable KPIs.",
      "Get end-to-end social media management: strategy, content, scheduling, community engagement, and performance reports.",
      "I create conversion-focused ad funnels and data-backed content that builds trust and drives action across platforms."
    ],
    tags: ["social-media", "ads", "growth", "content", "analytics"],
    skills: ["Meta Ads", "Google Analytics", "Canva", "Copywriting"]
  },
  {
    // Video Editing
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1747725594/catalog/1882743427529191059/ndv0jyvlhn0b1ayolit6.jpg",
    label: "video-editing-1",
    category: "Video Editing",
    sampleTitles: [
      "Cinematic Video Editing & Color Grading",
      "YouTube Video Editing with Thumbnails",
      "Shorts/Reels Editing with Captions & Hooks",
      "Event Highlights & Montage Editing",
      "Corporate Explainer Video Editing"
    ],
    sampleDescriptions: [
      "I craft engaging edits with pacing, transitions, color grading, captions, and sound design optimized for YouTube/Shorts.",
      "From raw footage to polished stories—intros, motion graphics, music sync, and export presets for every platform."
    ],
    tags: ["video", "editing", "reels", "shorts", "color"],
    skills: ["Premiere Pro", "After Effects", "DaVinci Resolve"]
  },
  {
    // APIs / Back-end
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709863439/catalog/1406217628538023936/rkn2utrigzlfgls4bjwo.webp",
    label: "api-integration",
    category: "Backend / API Development",
    sampleTitles: [
      "Secure REST/GraphQL API Design & Integration",
      "Node.js API with Auth, Rate Limiting & Docs",
      "Microservices & Third-Party API Integrations",
      "Payment & Webhook Integrations (Stripe, Razorpay)",
      "Scalable Backend with Caching & Queues"
    ],
    sampleDescriptions: [
      "I build secure, well-documented APIs with validation, auth, caching, and observability. Ready for production.",
      "I integrate third-party APIs (payments, email, CRM) with robust error handling and retries."
    ],
    tags: ["api", "node", "graphql", "integration", "backend"],
    skills: ["Node.js", "Express/Nest", "MongoDB", "Redis", "Swagger"]
  },
  {
    // MERN Stack Dev
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1718192578/catalog/1800855874619910922/thbtvi6nwcdvxiugkb7v.jpg",
    label: "mern-stack-1",
    category: "Web Development",
    sampleTitles: [
      "MERN Stack App: Auth, Dashboards & CRUD",
      "Full-Stack MERN with Role-Based Access",
      "Next.js/React + Node.js + MongoDB MVP",
      "Scalable MERN App with CI/CD",
      "SaaS Starter with Billing & Analytics"
    ],
    sampleDescriptions: [
      "I deliver production-ready MERN apps: clean architecture, JWT auth, RBAC, testing, and deployment.",
      "From landing to dashboard—responsive UI, APIs, state management, and DB modeling with best practices."
    ],
    tags: ["mern", "fullstack", "react", "node", "mongodb"],
    skills: ["React/Next.js", "Node.js", "MongoDB", "Tailwind", "JWT"]
  },
  {
    // MERN (alt)
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1726046448/catalog/1767818726276960256/tdmkn4kpzo4hweqtxl29.jpg",
    label: "mern-stack-2",
    category: "Web Development",
    sampleTitles: [
      "Admin Dashboards & Analytics (MERN)",
      "E-commerce MERN with Cart & Payments",
      "Real-time Apps with WebSockets (MERN)",
      "SEO-Ready Next.js Websites",
      "PWA with Offline Support (MERN)"
    ],
    sampleDescriptions: [
      "Feature-rich MERN builds: admin dashboards, charts, audit logs, and exports.",
      "E-commerce flows: product catalog, cart, checkout, payments, and order tracking."
    ],
    tags: ["mern", "ecommerce", "dashboard", "charts", "websocket"],
    skills: ["Next.js", "Express", "MongoDB", "Stripe", "Socket.IO"]
  },
  {
    // Video Editing (alt)
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1685648546/catalog/1664352322587869184/kvqo0y0eh2bimipfetoa.jpg",
    label: "video-editing-2",
    category: "Video Editing",
    sampleTitles: [
      "Short-Form Video Editing for Growth",
      "Travel & Event Montages with Sound Design",
      "Branded Video Edits with Motion Graphics",
      "Educational/Explainer Video Editing",
      "Product Promo Video Editing"
    ],
    sampleDescriptions: [
      "Hook-driven edits for higher watch time: subtitles, zooms, SFX, transitions, and brand consistency.",
      "I handle pacing, storyboard alignment, and platform-specific exports (9:16, 1:1, 16:9)."
    ],
    tags: ["motion", "captions", "promo", "shorts", "branding"],
    skills: ["After Effects", "Premiere Pro", "Motion Graphics"]
  },
  {
    // Video Editing (alt)
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709160115/catalog/1608794882825756672/vhojuudksjbe3hwnbiin.webp",
    label: "video-editing-3",
    category: "Video Editing",
    sampleTitles: [
      "YouTube Edits: Story, Thumbnails & Chapters",
      "TikTok/IG Reels with Auto-Captions",
      "Corporate Interviews: Clean Cut & Color",
      "Podcast Video Editing & Repurposing",
      "UGC Editing for Ads"
    ],
    sampleDescriptions: [
      "YT-focused edits: hooks, retention tactics, motion, and eye-catching thumbnails.",
      "Batch editing for shorts/reels with caption styles and music sync."
    ],
    tags: ["youtube", "reels", "ugc", "thumbnail", "chapters"],
    skills: ["Premiere Pro", "CapCut", "Audition"]
  },
  {
    // Video Editing (alt)
    url: "https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_400/v1709826135/catalog/1319284315255795712/odnk1a94v5npf75b1lqz.webp",
    label: "video-editing-4",
    category: "Video Editing",
    sampleTitles: [
      "Ad-Ready Video Editing with Motion Titles",
      "Vertical Content Editing for DTC Brands",
      "Course/Edu Video Editing & Cleanup",
      "Event Recap Videos with Highlights",
      "Music Sync & Beat Cuts Editing"
    ],
    sampleDescriptions: [
      "Polished edits for ads and promos: titles, lower-thirds, color grading, and clean audio.",
      "Vertical-first deliverables optimized for TikTok/IG with fast turnarounds."
    ],
    tags: ["ads", "vertical", "titles", "grading", "audio"],
    skills: ["Premiere Pro", "After Effects", "Audio Cleanup"]
  }
];

// Also keep a plain list if you want to pick random URLs elsewhere
const imageUrls = imageProfiles.map(p => p.url);

// Users
const usernames = [
  "Sribabu","Nakshatra","Nandeesh","Rakesh","Dharaneeshwar",
  "Sireesha","Bindu","Bhanu","Divya","Sailaja","Yagna",
  "Harry Potter","Hermione Granger","Ben Tenisoon"
];

// ====== HELPERS ======
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Build a FAQ list with category-aware answers
const buildFaqs = (category, deliveryTime) => ([
  {
    question: "What is included in the service?",
    answer: `The service includes a complete ${category} package tailored to your requirements.`
  },
  {
    question: "How long will it take to complete?",
    answer: `Delivery typically takes ${deliveryTime} days depending on scope and revisions.`
  },
  {
    question: "Do you offer revisions?",
    answer: "Yes, revisions are included across all packages to ensure your satisfaction."
  }
]);

// Generate tiered packages
const generatePackage = (basePrice, multiplier) => ({
  hourlyPay: basePrice * multiplier,
  duration: `${getRandomInt(1, 4)} weeks`,
  custom_ui: getRandomElement(["yes", "no", "client_choice"]),
  code_reviews: getRandomElement(["Included", "Optional", "Not Included"])
});

// Core: generate payload FROM IMAGE PROFILE
const generateGigPayload = () => {
  const profile = getRandomElement(imageProfiles);
  const title = getRandomElement(profile.sampleTitles);
  const description = getRandomElement(profile.sampleDescriptions);
  const basePrice = getRandomInt(50, 500);
  const deliveryTime = getRandomInt(3, 10);
  const username = getRandomElement(usernames);

  // create 2 more images, possibly duplicates, but shuffled
  const imgA = getRandomElement(imageUrls);
  const imgB = getRandomElement(imageUrls);

  const payload = {
    username,
    title,
    description,
    gigimage: profile.url, // primary image maps the domain
    images: [{ url: imgA }, { url: imgB }],
    price: String(basePrice),
    category: profile.category,
    deliveryTime,
    faqs: buildFaqs(profile.category, deliveryTime),
    about: `Experienced professional in ${profile.category} delivering high-quality, on-time results.`,
    tags: profile.tags,
    skills: profile.skills,
    basic: generatePackage(basePrice, 1),
    standard: generatePackage(basePrice, 2),
    pro: generatePackage(basePrice, 3),
    badges: ["Top Rated", "Fast Delivery"],
    rating: getRandomInt(4, 5),
    projects: getRandomInt(10, 100),
    status: getRandomElement(["Available", "Unavailable"]),
    location: getRandomElement(["New York", "London", "Tokyo", "Remote"]),
    responseTime: `${getRandomInt(1, 24)} hours`,
    successRate: getRandomInt(80, 100),
    avatar: profile.url // keep avatar coherent with the main image theme
  };

  // Debug logs (optional)
  console.log(
    `Generated payload: [${profile.label}] username=${payload.username}, title=${payload.title}`
  );
  return payload;
};

// API call
const createGig = async (payload) => {
  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log(
      `✅ Gig created: ${payload.title} (User: ${payload.username})`
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error creating gig "${payload.title}" (User: ${payload.username}):`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Main
const createMultipleGigs = async (count = 20) => {
  console.log(`Starting to create ${count} gigs...`);
  const gigs = [];

  for (let i = 0; i < count; i++) {
    const payload = generateGigPayload();
    try {
      const result = await createGig(payload);
      gigs.push(result);
    } catch (error) {
      console.error(`Failed to create gig ${i + 1}`);
      if (error.response?.data?.message === "Invalid token") {
        console.error("🛑 Stopping due to invalid token. Update the token and retry.");
        break;
      }
    }
  }

  console.log(`🎉 Successfully created ${gigs.length} gigs.`);
  return gigs;
};

// Run
createMultipleGigs(20)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
