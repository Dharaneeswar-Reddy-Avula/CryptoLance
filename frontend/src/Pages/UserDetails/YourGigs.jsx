// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import MarketCard from "../../Components/main/marketSection/MarketCard";

// const YourGigs = ({ yourgigs = [] }) => {
//   const [gigs, setGigs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const API_BASE = process.env.REACT_APP_API_BASE || "https://cryptolance-qgzz.onrender.com";

//   useEffect(() => {
//     if (!Array.isArray(yourgigs) || yourgigs.length === 0) {
//       setGigs([]);
//       setError(null);
//       setLoading(false);
//       return;
//     }

//     let cancelled = false;
//     const controller = new AbortController();

//     const fetchGigs = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const requests = yourgigs.map((id) =>
//           axios.get(`${API_BASE}/api/gigs/${id}`, { signal: controller.signal })
//         );
//         const results = await Promise.allSettled(requests);

//         if (cancelled) return;

//         const successful = results
//           .filter((r) => r.status === "fulfilled" && r.value?.data)
//           .map((r) => r.value.data);

//         if (successful.length === 0) {
//           setGigs([]);
//           setError("No gigs found for the provided IDs.");
//         } else {
//           setGigs(successful);
//         }
//       } catch (err) {
//         if (err.name === "CanceledError" || axios.isCancel?.(err)) {
//           console.log("Request cancelled");
//         } else {
//           console.error("Error fetching gigs:", err);
//           setError("Failed to load gigs. Please try again later.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchGigs();

//     return () => {
//       cancelled = true;
//       controller.abort();
//     };
//   }, [yourgigs, API_BASE]);

//   if (loading) return <div className="p-4 text-cyan-300">Loading your gigs...</div>;
//   if (error) return <div className="p-4 text-red-400">{error}</div>;

//   return (
//     <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
//       <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
//         <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg mr-3 border border-cyan-500/30">
//           <Code className="w-5 h-5 text-cyan-400" />
//         </div>
//         Your Gigs
//       </h3>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
//         {gigs.length > 0 ? (
//           gigs.map((gig) => (
//             <MarketCard
//               key={gig._id || gig.id}
//               username={gig.username || "Unknown"}
//               gigId={gig._id || gig.id}
//               title={gig.title || "No title"}
//               description={gig.description || "No description"}
//               price={gig.price || 0}
//               gigimage={gig.gigimage}
//               images={gig.images || []}
//               avatar={gig.avatar}
//               rating={gig.rating || 0}
//               projects={gig.projects || []}
//               badges={gig.badges || []}
//               location={gig.location || "Unknown"}
//               tags={gig.tags || []}
//               skills={gig.skills || []}
//               category={gig.category || "Uncategorized"}
//               deliveryTime={gig.deliveryTime || "N/A"}
//               faqs={gig.faqs || []}
//               about={gig.about || "No details"}
//               createdAt={gig.createdAt || new Date().toISOString()}
//               basic={gig.basic || {}}
//               standard={gig.standard || {}}
//               pro={gig.pro || {}}
//             />
//           ))
//         ) : (
//           <div className="p-4 text-gray-400 col-span-full">No gigs to show.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default YourGigs;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MarketCard from "../../Components/main/marketSection/MarketCard";

const YourGigs = ({ yourgigs = [] }) => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]); // fetched gig objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_BASE || "https://cryptolance-qgzz.onrender.com";

  useEffect(() => {
    // If no IDs, clear state and exit early
    if (!Array.isArray(yourgigs) || yourgigs.length === 0) {
      setGigs([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const fetchGigs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build requests for each id
        const requests = yourgigs.map((id) =>
          axios.get(`${API_BASE}/api/gigs/${id}`, { signal: controller.signal })
        );

        const results = await Promise.allSettled(requests);

        if (cancelled) return;

        // Normalize different response shapes (resp.data, resp.data.data, resp)
        const extract = (resp) => {
          if (!resp) return null;
          // resp is an axios response when fulfilled: resp.value
          const candidate = resp.data ?? resp;
          // candidate may be { success: true, data: { ... } }
          if (
            candidate &&
            candidate.data &&
            typeof candidate.data === "object"
          ) {
            return candidate.data;
          }
          return candidate;
        };

        const successful = results
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => extract(r.value))
          .filter(Boolean);

        // If API returns wrapper { success: true, data: {...} } ensure we unwrap again
        const normalized = successful.map((item) =>
          // if the API still wrapped the gig in `data`, unwrap
          item && item.data ? item.data : item
        );

        if (normalized.length === 0) {
          setGigs([]);
          setError("No gigs found for the provided IDs.");
        } else {
          setGigs(normalized);
        }
      } catch (err) {
        if (err.name === "CanceledError" || axios.isCancel?.(err)) {
          console.log("Request cancelled");
        } else {
          console.error("Error fetching gigs:", err);
          setError("Failed to load gigs. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGigs();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [yourgigs, API_BASE]);

  // UI states
  if (loading)
    return <div className="p-4 text-cyan-300">Loading your gigs…</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Render fetched gig cards */}
        {gigs && gigs.length > 0
          ? gigs.map((gig) => (
              <MarketCard
                key={gig._id || gig.id}
                username={gig.username}
                gigId={gig._id || gig.id}
                title={gig.title}
                description={gig.description}
                price={gig.price}
                gigimage={gig.gigimage}
                images={gig.images}
                avatar={gig.avatar}
                rating={gig.rating}
                projects={gig.projects}
                badges={gig.badges}
                location={gig.location}
                tags={gig.tags}
                skills={gig.skills}
                category={gig.category}
                deliveryTime={gig.deliveryTime}
                faqs={gig.faqs}
                about={gig.about}
                createdAt={gig.createdAt}
                basic={gig.basic}
                standard={gig.standard}
                pro={gig.pro}
              />
            ))
          : // If no fetched gigs, and no IDs either, helpful message:
            (!yourgigs || yourgigs.length === 0) && (
              <div className="p-4 text-gray-400 col-span-full">
                No gigs to show.
              </div>
            )}
      </div>
    </>
  );
};

export default YourGigs;
