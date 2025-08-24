"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import WalletConnect from "./walletConnection/WalletConnect";
import { GiSettingsKnobs } from "react-icons/gi";
import { Settings2 } from "lucide-react";

import { FaEthereum } from "react-icons/fa6";

import {
  Search,
  Briefcase,
  Star,
  Globe,
  Menu,
  ChevronDown,
  ChevronRight,
  PocketIcon as Portfolio,
  TrendingUp,
  BarChart3,
  Users,
  Package,
  Coins,
  ArrowUpDown,
  Building2,
  MessageCircle,
  Zap,
  Shield,
  Smartphone,
  BookOpen,
  Award,
  Target,
  ShieldCheck,
  X,
  Home,
  Settings,
  HelpCircle,
  ExternalLink,
  Sparkles,
  User as UserIcon,
  Clock,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPortfolio } from "../store/portfolioSlice/portfolioSlice";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import {
  useClaimTokens,
  usePurchaseTokens,
} from "../interactions/HFTtoken__interactions";

export default function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedTheme, setTheme] = useState("Dark");
  const [hftTokenData, setHftTokenData] = useState(null);
  const [isLoadingTokenData, setIsLoadingTokenData] = useState(false);
  const [hasTriggeredAutoPurchase, setHasTriggeredAutoPurchase] = useState(
    false
  );
  const { address, isConnected, chain } = useAccount();
  const { portfolioData } = useSelector((state) => state.portfolio);
  const location = useLocation();

  // Ref for profile dropdown
  const profileDropdownRef = useRef(null);

  // HFT Token hooks
  const {
    claimTokens,
    isPending: isClaimPending,
    isConfirmed: isClaimConfirmed,
  } = useClaimTokens();
  const {
    approveUSDC,
    purchaseToken,
    isApprovePending,
    isPurchasePending,
    isPurchaseConfirmed,
    allowance,
    usdcBalance,
  } = usePurchaseTokens();

  const navigate = useNavigate();

  // Fetch HFT token data
  const fetchHftTokenData = async () => {
    if (!address) return;

    setIsLoadingTokenData(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `http://localhost:3001/api/hftToken/userHFTtokenDetails/${address}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHftTokenData(data);
      }
    } catch (error) {
      console.error("Error fetching HFT token data:", error);
    } finally {
      setIsLoadingTokenData(false);
    }
  };

  // Auto-purchase tokens (approve + purchase in sequence)
  const handlePurchaseTokens = async () => {
    try {
      // Reset the auto-purchase flag for new transactions
      setHasTriggeredAutoPurchase(false);

      // Check if we already have sufficient allowance
      if (allowance >= BigInt(10 * 10 ** 6)) {
        // 10 USDC in wei
        // Direct purchase if allowance is sufficient
        await purchaseToken();
      } else {
        // First approve USDC
        await approveUSDC();
        // Purchase will be handled automatically after approval
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Failed to purchase tokens");
    }
  };

  // Handle claim tokens
  const handleClaimTokens = async () => {
    try {
      await claimTokens();
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error("Failed to claim tokens");
    }
  };

  // Check if claim is available (30 days after last claim)
  const canClaim = () => {
    if (!hftTokenData?.lastClaimTime) return true;

    const lastClaimTime = parseInt(hftTokenData.lastClaimTime);
    const currentTime = Math.floor(Date.now() / 1000);
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

    return currentTime - lastClaimTime >= thirtyDaysInSeconds;
  };

  // Format last claim time
  const formatLastClaimTime = () => {
    if (!hftTokenData?.lastClaimTime) return "Never";

    const lastClaimTime = parseInt(hftTokenData.lastClaimTime);
    const date = new Date(lastClaimTime * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Format HFT balance (18 decimals)
  const formatHftBalance = () => {
    if (!hftTokenData?.userHFTBalance) return "0";

    const balance = BigInt(hftTokenData.userHFTBalance);
    const decimals = 18;
    const divisor = BigInt(10 ** decimals);

    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;

    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }

    // Format with up to 4 decimal places
    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "").slice(0, 4);

    return `${wholePart}.${trimmedFractional}`;
  };

  // Auto-purchase after approval
  useEffect(() => {
    if (isClaimConfirmed) {
      toast.success("Tokens claimed successfully!");
      fetchHftTokenData(); // Refresh data
    }
  }, [isClaimConfirmed]);

  // Success message and refresh data after purchase completion
  useEffect(() => {
    if (isPurchaseConfirmed) {
      toast.success("HFT tokens purchased successfully!");
      fetchHftTokenData(); // Refresh data
      setHasTriggeredAutoPurchase(false); // Reset for future purchases
    }
  }, [isPurchaseConfirmed]);

  // Fetch token data when address changes
  useEffect(() => {
    if (address) {
      fetchHftTokenData();
    }
  }, [address]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Auto-purchase after USDC approval - only once when allowance changes from 0 to > 0
  useEffect(() => {
    if (
      allowance > BigInt(0) &&
      !isPurchasePending &&
      !isPurchaseConfirmed &&
      !hasTriggeredAutoPurchase
    ) {
      // Only auto-purchase once after approval to prevent infinite loops
      setHasTriggeredAutoPurchase(true);
      purchaseToken();
    }
  }, [allowance]);

  const navigationItems = [
    {
      name: "Find talent",
      navlink: "/gigs",
      icon: Coins,
      description: "Discover skilled freelancers",
      gradient: "from-yellow-400 to-orange-500",
      badge: "Hot",
    },
    {
      name: "Find work",
      navlink: "/browse-jobs",
      icon: Users,
      description: "Browse available projects",
      gradient: "from-blue-400 to-cyan-500",
      badge: "New",
    },
    {
      name: "Why CryptoLance",
      navlink: "/help",
      icon: Package,
      description: "Learn about our platform",
      gradient: "from-purple-400 to-pink-500",
      subItems: [
        { name: "How to Use", link: "/help", icon: BookOpen },
        { name: "About", link: "/about", icon: Award },
      ],
    },
    {
      name: "Admin Dashboard",
      navlink: "/adminDashboard",
      icon: ShieldCheck,
      description: "Manage your platform",
      gradient: "from-green-400 to-emerald-500",
      badge: "Pro",
    },
  ];

  const quickActions = [
    {
      name: "Create Gig",
      icon: Zap,
      link: "/create-gig",
      gradient: "from-violet-500 to-purple-600",
      description: "Start earning today",
    },
    {
      name: "Post Job",
      icon: Briefcase,
      link: "/post-job",
      gradient: "from-indigo-500 to-blue-600",
      description: "Find the perfect freelancer",
    },
    {
      name: "Portfolio",
      icon: Portfolio,
      link: "/portfolio/me",
      gradient: "from-emerald-500 to-teal-600",
      description: "Showcase your work",
    },
  ];

  const handlePortfolioClick = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please Connect your wallet to view your portfolio");
        return;
      }

      const res = await fetch(
        "http://localhost:3001/api/portfolio/me",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result = null;
      try {
        result = await res.json();
      } catch (err) {
        toast.error("Failed to parse response. Please try again.");
      }

      if (res.ok && result?.success && result?.data) {
        navigate("/portfolio/me");
        return;
      }
      navigate("/portfolioForm");
    } catch (err) {
      console.error("Error checking portfolio:", err);
      toast.error("Unable to check portfolio. Please try again.");
      navigate("/portfolioForm");
    }
  };

  const handleMouseEnter = (itemName) => {
    setActiveDropdown(itemName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  // Split items into two columns
  const splitItemsIntoColumns = (items) => {
    const mid = Math.ceil(items.length / 2);
    return [items.slice(0, mid), items.slice(mid)];
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/5 text-white z-50">
      {/* Neon glow background effect */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20 opacity-50"></div> */}

      {/* Main Header */}
      <div className="relative flex items-center justify-between w-full px-4 py-3  backdrop-blur-lg">
        {/* Left Side - Logo and Navigation */}
        <div className="flex items-center w-full space-x-8">
          {/* Logo with neon effect */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative overflow-hidden rounded-full w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-orbitron hidden sm:block text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                CryptoLance
              </span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isOpen = activeDropdown === item.name;

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link to={item.navlink}>
                    <button
                      className={`flex items-center space-x-1 transition-all duration-300 py-2 rounded-lg group
                        ${
                          location.pathname === item.navlink
                            ? "text-cyan-400 bg-cyan-500/10 font-semibold px-2"
                            : "text-gray-300 hover:text-cyan-400"
                        }
                      `}
                    >
                      <IconComponent
                        className={`w-4 h-4 group-hover:text-cyan-400 transition-colors duration-300 ${
                          location.pathname === item.navlink
                            ? "text-cyan-400"
                            : ""
                        }`}
                      />
                      <span className="text-[14px]">{item.name}</span>
                      {item.subItems && (
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-cyan-400" : ""
                          }`}
                        />
                      )}
                    </button>
                  </Link>

                  {item.subItems && isOpen && (
                    <div className="absolute -left-2 top-[35px] w-32 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl shadow-cyan-500/10 z-50">
                      {item.subItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          to={subItem.link}
                          className={`block px-4 py-2 text-sm text-white hover:bg-gray-800/50 hover:text-cyan-400 transition-all duration-200 ${
                            idx === 0
                              ? "rounded-t-xl"
                              : idx === item.subItems.length - 1
                              ? "rounded-b-xl"
                              : ""
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Portfolio, Watchlist, Search, Login */}
        <div className="flex items-center md:gap-4">
          {/* Portfolio */}
          <button
            onClick={handlePortfolioClick}
            className="md:flex text-sm hidden items-center text-gray-300 hover:text-cyan-400 transition-all duration-300  py-2 rounded-lg  group"
          >
            <Portfolio className="w-4 h-4 mr-2  group-hover:text-cyan-400 transition-colors duration-300" />
            Portfolio
          </button>

          <div className="flex flex-row gap-1 items-center">
            {/* Log in Button with neon effect */}
            <WalletConnect onAuthSuccess={() => {}} />

            {/* Account / Settings dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full hover:bg-gray-800/50 transition-all duration-200 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 group"
                aria-expanded={showProfileMenu ? "true" : "false"}
              >
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-transparent hover:ring-cyan-500/30 transition-all duration-200 relative">
                  {/* <img
                    src={
                      portfolioData?.heroSection?.profile ||
                      "https://via.placeholder.com/36"
                    }
                    alt=""
                    className="rounded-full w-full h-full object-cover"
                  /> */}
                  <Settings2 className="w-4 h-4" />
                  {/* Dropdown indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 bg-gray-700 rounded-full border-2 border-gray-900 transition-all duration-200 ${
                      showProfileMenu
                        ? "bg-cyan-500 scale-110"
                        : "group-hover:bg-gray-600"
                    }`}
                  />
                </div>
              </button>

              <div
                ref={profileDropdownRef}
                className={`absolute right-0 top-[40px] w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-cyan-500/20 z-50 transition-all duration-300 ease-out transform origin-top-right ${
                  showProfileMenu
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                }`}
                role="menu"
              >
                <div className="p-4">
                  <div
                    className={`transition-all duration-300 delay-100 ${
                      showProfileMenu
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* <div className="flex flex-row gap-4">
                        <button className="w-auto bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                          Log In
                        </button>
                        <button className="w-auto border border-blue-600 text-blue-600 px-3 py-1 rounded-md text-sm">
                          Sign Up
                        </button>
                      </div> */}
                      {/* <div className="ml-3 flex items-start"> */}
                      {/* <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow"> */}
                      <div className="w-full flex items-center justify-between">
                        <div className="font-semibold">
                          Built On Base Layer 2
                        </div>
                        <FaEthereum className="w-4 h-4" />{" "}
                      </div>
                      {/* </div> */}
                      {/* </div> */}
                    </div>
                  </div>

                  <hr className="border-gray-800/40 my-2" />
                  <div
                    className={`transition-all duration-300 delay-150 ${
                      showProfileMenu
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <button className="w-full text-left text-[13px] text-blue-500 font-semibold px-1 py-2 rounded-md hover:bg-gray-800/50 flex items-center justify-between">
                      <span>💙 Help us improve by taking our survey</span>
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    </button>
                  </div>
                  <hr className="border-gray-800/40 my-2" />

                  {/* HFT Token Information */}
                  {address && (
                    <div
                      className={`mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg transition-all duration-300 delay-200 ${
                        showProfileMenu
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          HFT Token
                        </h4>
                        <button
                          onClick={fetchHftTokenData}
                          disabled={isLoadingTokenData}
                          className="p-1 hover:bg-purple-500/20 rounded transition-colors disabled:opacity-50"
                          title="Refresh token data"
                        >
                          <svg
                            className="w-3 h-3 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      </div>

                      {isLoadingTokenData ? (
                        <div className="text-xs text-gray-400">Loading...</div>
                      ) : hftTokenData ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Balance:</span>
                            <span className="text-white font-mono">
                              {formatHftBalance()} HFT
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Last Claim:</span>
                            <span className="text-white">
                              {formatLastClaimTime()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Bids Count:</span>
                            <span className="text-white">
                              {hftTokenData.bidInfo?.bidsCount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Claim Status:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                canClaim()
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {canClaim() ? "Available" : "30-day cooldown"}
                            </span>
                          </div>
                          <hr className="border-purple-500/20 my-2" />
                          <div className="text-xs text-purple-300 font-medium mb-2">
                            USDC Info:
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">USDC Balance:</span>
                            <span className="text-white font-mono">
                              {(Number(usdcBalance) / 10 ** 6).toFixed(2)} USDC
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                              USDC Allowance:
                            </span>
                            <span className="text-white font-mono">
                              {(Number(allowance) / 10 ** 6).toFixed(2)} USDC
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          No token data available
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`mt-3 space-y-2 text-sm transition-all duration-300 delay-300 ${
                      showProfileMenu
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <div className="flex items-center justify-between px-1 py-2 rounded-md hover:bg-gray-800/40">
                      <div className="text-gray-300">Language</div>
                      <div className="text-gray-200">English</div>
                    </div>
                    <div className="flex items-center justify-between px-1 py-2 rounded-md hover:bg-gray-800/40">
                      <div className="text-gray-300">Currency</div>
                      <div className="text-gray-200 flex items-center gap-1">
                        USD <span className="text-green-400">●</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1 py-2 rounded-md">
                      <div className="text-gray-300">Theme</div>
                      <div className="flex items-center bg-gray-800 py-1 px-1 rounded-lg">
                        {["Light", "Dark", "System"].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setTheme(theme)}
                            className={`px-2 py-1 text-[12px] rounded transition-colors duration-200 ${
                              selectedTheme === theme
                                ? "bg-gray-900 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-4 transition-all duration-300 delay-400 ${
                      showProfileMenu
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClaimTokens}
                        disabled={!canClaim() || isClaimPending}
                        className={`flex w-1/2 border border-gray-700 px-3 py-2 text-sm rounded-md text-gray-200 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                          canClaim()
                            ? "border-green-500 text-green-400 hover:bg-green-500/10"
                            : "border-gray-700 text-gray-400"
                        }`}
                        title={
                          !canClaim()
                            ? "Wait 30 days after last claim"
                            : "Claim your HFT tokens"
                        }
                      >
                        {isClaimPending
                          ? "Claiming..."
                          : canClaim()
                          ? "Claim HFT"
                          : "Claim Locked"}
                      </button>
                      <button
                        onClick={handlePurchaseTokens}
                        disabled={isApprovePending || isPurchasePending}
                        className={`px-3 w-1/2 py-2 bg-gray-800 border border-gray-700 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          isApprovePending || isPurchasePending
                            ? "opacity-50"
                            : "hover:bg-gray-700"
                        }`}
                        title="Purchase HFT tokens with USDC (10 USDC per transaction)"
                      >
                        {isApprovePending
                          ? "Approving USDC..."
                          : isPurchasePending
                          ? "Purchasing HFT..."
                          : allowance >= BigInt(10 * 10 ** 6)
                          ? "Purchase HFT (Approved)"
                          : "Purchase HFT"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          {/* <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("language")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="text-gray-300 hover:text-cyan-400 transition-all duration-300 p-2 rounded-lg hover:bg-gray-800/50 hover:shadow-lg hover:shadow-cyan-500/20">
              <Globe className="w-4 h-4" />
            </button>
            {activeDropdown === "language" && (
              <div className="absolute -right-2 top-[35px] w-32 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl shadow-cyan-500/10 z-50">
                <a
                  href="#"
                  className="block px-4 py-2 text-white hover:bg-gray-800/50 hover:text-cyan-400 transition-all duration-200 first:rounded-t-xl"
                >
                  English
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-white hover:bg-gray-800/50 hover:text-cyan-400 transition-all duration-200"
                >
                  Español
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-white hover:bg-gray-800/50 hover:text-cyan-400 transition-all duration-200 last:rounded-b-xl"
                >
                  Français
                </a>
              </div>
            )}
          </div> */}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden text-gray-300 hover:text-cyan-400 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Side Menu - OpenSea Style */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ease-in-out ${
          showMobileMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/80 transition-opacity duration-500 ${
            showMobileMenu ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileMenu}
        />

        {/* Side Menu */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-black transform transition-transform duration-500 ease-in-out ${
            showMobileMenu ? "translate-x-0" : "translate-x-full"
          } flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">CryptoLance</h2>
                <p className="text-xs text-gray-400">Web3 Freelancing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Icon in Mobile Menu */}
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  closeMobileMenu();
                }}
                className="flex items-center gap-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 group"
                aria-expanded={showProfileMenu ? "true" : "false"}
              >
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-transparent hover:ring-cyan-500/30 transition-all duration-200 relative">
                  <img
                    src={
                      portfolioData?.heroSection?.profile ||
                      "https://via.placeholder.com/36"
                    }
                    alt=""
                    className="rounded-full w-full h-full object-cover"
                  />
                  {/* Dropdown indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 bg-gray-700 rounded-full border-2 border-gray-900 transition-all duration-200 ${
                      showProfileMenu
                        ? "bg-cyan-500 scale-110"
                        : "group-hover:bg-gray-600"
                    }`}
                  />
                </div>
              </button>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, idx) => (
                  <Link
                    key={idx}
                    to={action.link}
                    onClick={closeMobileMenu}
                    className="group block"
                  >
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-900 transition-all duration-300 border border-transparent hover:border-gray-700">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300">
                          {action.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Navigation */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Navigation
              </h3>
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isOpen = activeDropdown === item.name;

                  return (
                    <div key={item.name} className="w-full">
                      <button
                        onClick={() =>
                          setActiveDropdown(isOpen ? null : item.name)
                        }
                        className="flex justify-between items-center w-full text-left p-3 rounded-xl hover:bg-gray-900 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                                {item.name}
                              </span>
                              {item.badge && (
                                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {item.subItems && (
                          <ChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                              isOpen ? "rotate-180 text-cyan-400" : ""
                            }`}
                          />
                        )}
                      </button>

                      {isOpen && item.subItems && (
                        <div className="ml-16 mt-2 space-y-1 bg-gray-900 rounded-lg p-3">
                          {item.subItems.map((subItem, idx) => (
                            <Link
                              key={idx}
                              to={subItem.link}
                              onClick={closeMobileMenu}
                              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-800 transition-all duration-200 group"
                            >
                              <subItem.icon className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
                                {subItem.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Actions */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-cyan-400" />
                Account
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handlePortfolioClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 transition-all duration-300 group border border-gray-800 hover:border-gray-700"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Portfolio className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                      Portfolio
                    </h4>
                    <p className="text-sm text-gray-400">Manage your work</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 transition-all duration-300 group border border-gray-800 hover:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                      Watchlist
                    </h4>
                    <p className="text-sm text-gray-400">Saved items</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 transition-all duration-300 group border border-gray-800 hover:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                      Settings
                    </h4>
                    <p className="text-sm text-gray-400">
                      Preferences & account
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 bg-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">♦</span>
                </div>
                <span className="text-sm text-gray-400">v2.0.0</span>
              </div>
              <Link
                to="/help"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Profile Dropdown */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 transition-opacity duration-300"
            onClick={() => setShowProfileMenu(false)}
          />

          {/* Mobile Profile Menu */}
          <div className="absolute right-4 top-20 w-80 max-w-[85vw] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-cyan-500/20 z-50 transition-all duration-300 ease-out transform origin-top-right">
            <div className="p-4">
              <div
                className={`transition-all duration-300 delay-100 ${
                  showProfileMenu
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex flex-row gap-4">
                    <button className="w-auto bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                      Log In
                    </button>
                    <button className="w-auto border border-blue-600 text-blue-600 px-3 py-1 rounded-md text-sm">
                      Sign Up
                    </button>
                  </div>
                  <div className="ml-3 flex items-start">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow">
                      <span className="text-white text-xs font-semibold">
                        ♦
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-800/40 my-2" />
              <div
                className={`transition-all duration-300 delay-150 ${
                  showProfileMenu
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <button className="w-full text-left text-[13px] text-blue-500 font-semibold px-1 py-2 rounded-md hover:bg-gray-800/50 flex items-center justify-between">
                  <span>💙 Help us improve by taking our survey</span>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>
              <hr className="border-gray-800/40 my-2" />

              {/* HFT Token Information */}
              {address && (
                <div
                  className={`mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg transition-all duration-300 delay-200 ${
                    showProfileMenu
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      HFT Token
                    </h4>
                    <button
                      onClick={fetchHftTokenData}
                      disabled={isLoadingTokenData}
                      className="p-1 hover:bg-purple-500/20 rounded transition-colors disabled:opacity-50"
                      title="Refresh token data"
                    >
                      <svg
                        className="w-3 h-3 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>

                  {isLoadingTokenData ? (
                    <div className="text-xs text-gray-400">Loading...</div>
                  ) : hftTokenData ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Balance:</span>
                        <span className="text-white font-mono">
                          {formatHftBalance()} HFT
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Claim:</span>
                        <span className="text-white">
                          {formatLastClaimTime()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Bids Count:</span>
                        <span className="text-white">
                          {hftTokenData.bidInfo?.bidsCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Claim Status:</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            canClaim()
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {canClaim() ? "Available" : "30-day cooldown"}
                        </span>
                      </div>
                      <hr className="border-purple-500/20 my-2" />
                      <div className="text-xs text-purple-300 font-medium mb-2">
                        USDC Info:
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">USDC Balance:</span>
                        <span className="text-white font-mono">
                          {(Number(usdcBalance) / 10 ** 6).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">USDC Allowance:</span>
                        <span className="text-white font-mono">
                          {(Number(allowance) / 10 ** 6).toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      No token data available
                    </div>
                  )}
                </div>
              )}

              <div
                className={`mt-3 space-y-2 text-sm transition-all duration-300 delay-300 ${
                  showProfileMenu
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex items-center justify-between px-1 py-2 rounded-md hover:bg-gray-800/40">
                  <div className="text-gray-300">Language</div>
                  <div className="text-gray-200">English</div>
                </div>
                <div className="flex items-center justify-between px-1 py-2 rounded-md hover:bg-gray-800/40">
                  <div className="text-gray-300">Currency</div>
                  <div className="text-gray-200 flex items-center gap-1">
                    USD <span className="text-green-400">●</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1 py-2 rounded-md">
                  <div className="text-gray-300">Theme</div>
                  <div className="flex items-center bg-gray-800 py-1 px-1 rounded-lg">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setTheme(theme)}
                        className={`px-2 py-1 text-[12px] rounded transition-colors duration-200 ${
                          selectedTheme === theme
                            ? "bg-gray-900 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`mt-4 transition-all duration-300 delay-400 ${
                  showProfileMenu
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClaimTokens}
                    disabled={!canClaim() || isClaimPending}
                    className={`flex w-1/2 border border-gray-700 px-3 py-2 text-sm rounded-md text-gray-200 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      canClaim()
                        ? "border-green-500 text-green-400 hover:bg-green-500/10"
                        : "border-gray-700 text-gray-400"
                    }`}
                    title={
                      !canClaim()
                        ? "Wait 30 days after last claim"
                        : "Claim your HFT tokens"
                    }
                  >
                    {isClaimPending
                      ? "Claiming..."
                      : canClaim()
                      ? "Claim HFT"
                      : "Claim Locked"}
                  </button>
                  <button
                    onClick={handlePurchaseTokens}
                    disabled={isApprovePending || isPurchasePending}
                    className={`px-3 w-1/2 py-2 bg-gray-800 border border-gray-700 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      isApprovePending || isPurchasePending
                        ? "opacity-50"
                        : "hover:bg-gray-700"
                    }`}
                    title="Purchase HFT tokens with USDC (10 USDC per transaction)"
                  >
                    {isApprovePending
                      ? "Approving USDC..."
                      : isPurchasePending
                      ? "Purchasing HFT..."
                      : allowance >= BigInt(10 * 10 ** 6)
                      ? "Purchase HFT (Approved)"
                      : "Purchase HFT"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for neon glow effects */}
      <style>{`
        .glow-text {
          text-shadow: 0 0 5px currentColor;
        }
        .glow-text-red {
          text-shadow: 0 0 5px #ef4444;
        }
        .glow-text-green {
          text-shadow: 0 0 5px #22c55e;
        }
        .glow-text-orange {
          text-shadow: 0 0 5px #f97316;
        }
        .glow-text-blue {
          text-shadow: 0 0 5px #3b82f6;
        }
        .glow-text-yellow {
          text-shadow: 0 0 5px #eab308;
        }
      `}</style>
    </header>
  );
}
