"use client";

import { useState, useEffect } from "react";
import StatsCard from "../../Components/admin/StatsCard";
import Navbar from "../../Components/Navbar";
import { RiCoinsFill } from "react-icons/ri";
import { GiOpenTreasureChest } from "react-icons/gi";
import { BiNotepad } from "react-icons/bi";
import { MdGeneratingTokens } from "react-icons/md";
import Footer from "../../Components/Footer";
import Loader from "../../Components/Loader";
const Dashboard = () => {
  const [escrowData, setEscrowData] = useState(null);
  const [hftData, setHftData] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [treasuryData, setTreasuryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          escrowRes,
          hftRes,
          proposalRes,
          treasuryRes,
        ] = await Promise.all([
          fetch(
            "http://localhost:3001/api/admin/escrow-data"
          ),
          fetch(
            "http://localhost:3001/api/admin/hft-token-data"
          ),
          fetch(
            "http://localhost:3001/api/admin/proposal-manager-data"
          ),
          fetch(
            "http://localhost:3001/api/admin/treasury-data"
          ),
        ]);

        const escrow = await escrowRes.json();
        const hft = await hftRes.json();
        const proposal = await proposalRes.json();
        const treasury = await treasuryRes.json();

        setEscrowData(escrow.data);
        setHftData(hft.data);
        setProposalData(proposal.data);
        setTreasuryData(treasury.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (rawValue) => {
    const scaledValue = (rawValue || 0) / 1000000; // 1 dollar = 1,000,000 in raw data
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(scaledValue);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      // <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center relative overflow-hidden">
      //   {/* Animated background particles */}
      //   <div className="absolute inset-0">
      //     <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      //     <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      //     <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      //   </div>

      //   {/* Premium loading spinner */}
      //   <div className="relative z-10 flex flex-col items-center space-y-8">
      //     <div className="relative">
      //       <div className="w-24 h-24 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin"></div>
      //       <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-blue-400 border-l-pink-400 rounded-full animate-spin animate-reverse"></div>
      //       <div className="absolute inset-4 w-8 h-8 border-4 border-transparent border-t-green-400 rounded-full animate-spin"></div>
      //     </div>
      //     <div className="text-center">
      //       <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
      //         Loading Dashboard
      //       </h2>
      //       <div className="flex space-x-1">
      //         <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
      //         <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
      //         <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      <Loader caption="Admin Dashboard" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <Navbar />

      <div className="relative z-10  mt-[75px] space-y-8">
        {/* Dashboard Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time insights and control center for your decentralized
            platform
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 px-2 md:px-8 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard
            title="Total Contract Balance"
            value={formatCurrency(
              escrowData?.escrow?.totalContractBalance || 0
            )}
            subtitle="Escrow Contract"
            icon={<RiCoinsFill />}
            trend="+2.5%"
            trendUp={true}
          />
          <StatsCard
            title="HFT Token Balance"
            value={formatCurrency(hftData?.hftToken?.totalUSDCBalance || 0)}
            subtitle="USDC Balance"
            icon={<MdGeneratingTokens />}
            trend="+5.2%"
            trendUp={true}
          />
          <StatsCard
            title="Treasury Balance"
            value={formatCurrency(
              treasuryData?.treasury?.totalTreasureBalance || 0
            )}
            subtitle="Total Treasury"
            icon={<GiOpenTreasureChest />}
            trend="-1.2%"
            trendUp={false}
          />
          <StatsCard
            title="Active Proposals"
            value={proposalData?.proposalManager?.proposalCount || 0}
            subtitle="Total Proposals"
            icon={<BiNotepad />}
            trend="+8.1%"
            trendUp={true}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-8">
          {/* Escrow Details */}
          <div className="lg:col-span-2">
            <div className="group relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/25 transition-all duration-500 hover:border-cyan-400/40">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Escrow Contract Details
                </h3>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">
                        Total Locked Funds
                      </span>
                      <span className="font-bold text-lg text-purple-400 drop-shadow-lg">
                        {formatCurrency(
                          escrowData?.escrow?.totalLockedFunds || 0
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">
                        Available Balance
                      </span>
                      <span className="font-bold text-lg text-cyan-400 drop-shadow-lg">
                        {formatCurrency(
                          escrowData?.escrow?.availableBalance || 0
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">
                        Escrow USDC Balance
                      </span>
                      <span className="font-bold text-lg text-blue-400 drop-shadow-lg">
                        {formatCurrency(escrowData?.usdc?.escrowBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <span className="text-gray-400 block text-sm font-medium mb-2">
                        USDC Token
                      </span>
                      <span className="text-cyan-400 text-sm font-medium px-3 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 inline-block font-mono">
                        {formatAddress(escrowData?.escrow?.usdcToken || "")}
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <span className="text-gray-400 block text-sm font-medium mb-2">
                        Treasury
                      </span>
                      <span className="text-purple-400 text-sm font-medium px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20 inline-block font-mono">
                        {formatAddress(escrowData?.escrow?.treasury || "")}
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/15">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <span className="text-gray-400 block text-sm font-medium mb-2">
                        Governance
                      </span>
                      <span className="text-blue-400 text-sm font-medium px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 inline-block font-mono">
                        {formatAddress(
                          escrowData?.escrow?.governanceContract || ""
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HFT Token Info */}
          <div>
            <div className="group relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/25 transition-all duration-500 hover:border-purple-400/40">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  HFT Token
                </h3>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              </div>

              <div className="space-y-6">
                {/* Featured metric */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/40 rounded-2xl p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse"></div>
                  <div className="relative">
                    <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {formatCurrency(
                        hftData?.hftToken?.totalHFTtokensPurchasedWithUSDC || 0
                      )}
                    </div>
                    <div className="text-purple-300 font-medium">
                      Tokens Purchased
                    </div>
                  </div>
                </div>

                {/* Token details */}
                <div className="space-y-3">
                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">
                        Claim Interval
                      </span>
                      <span className="font-bold text-purple-400">
                        {Math.floor(
                          (hftData?.hftToken?.claimInterval || 0) / 86400
                        )}{" "}
                        days
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Bid Fee</span>
                      <span className="font-bold text-pink-400">
                        {(hftData?.hftToken?.bidFee / 1e18).toFixed(2)} ETH
                      </span>
                    </div>
                  </div>

                  <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex justify-between items-center">
                      <span className="text-gray-300 font-medium">
                        Transfers
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-bold shadow-lg ${
                          hftData?.hftToken?.transfersEnabled
                            ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/40 text-white "
                            : "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/30"
                        }`}
                      >
                        {hftData?.hftToken?.transfersEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Manager & DAO Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 md:px-8">
          {/* Proposal Manager */}
          <div className="group relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/25 transition-all duration-500 hover:border-blue-400/40">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Proposal Manager
              </h3>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            </div>

            {/* Payment percentages */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/30 via-blue-600/30 to-cyan-600/30 backdrop-blur-sm border border-cyan-500/40 rounded-xl p-4 text-center group/payment hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover/payment:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {proposalData?.proposalManager?.firstPaymentPercent}%
                  </div>
                  <div className="text-xs text-cyan-300 font-medium">
                    1st Payment
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-blue-600/30 backdrop-blur-sm border border-blue-500/40 rounded-xl p-4 text-center group/payment hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover/payment:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {proposalData?.proposalManager?.secondPaymentPercent}%
                  </div>
                  <div className="text-xs text-blue-300 font-medium">
                    2nd Payment
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/30 backdrop-blur-sm border border-purple-500/40 rounded-xl p-4 text-center group/payment hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover/payment:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {proposalData?.proposalManager?.thirdPaymentPercent}%
                  </div>
                  <div className="text-xs text-purple-300 font-medium">
                    3rd Payment
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="space-y-3">
              <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex justify-between items-center">
                  <span className="text-gray-300 font-medium">
                    Platform Fee
                  </span>
                  <span className="font-bold text-blue-400">
                    {(
                      proposalData?.proposalManager?.platformFeeBasisPoints /
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>

              <div className="group/item relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex justify-between items-center">
                  <span className="text-gray-300 font-medium">
                    Proposal Count
                  </span>
                  <span className="font-bold text-cyan-400">
                    {proposalData?.proposalManager?.proposalCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DAO Members */}
          <div className="group relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/25 transition-all duration-500 hover:border-purple-400/40">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DAO Members
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 font-medium">
                  {proposalData?.proposalManager?.daoMembers?.length || 0}{" "}
                  members
                </span>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {proposalData?.proposalManager?.daoMembers?.map(
                (member, index) => (
                  <div
                    key={index}
                    className="group/member relative overflow-hidden bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/50 transition-all duration-300 hover:shadow-md hover:shadow-purple-500/15"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 to-cyan-500/3 opacity-0 group-hover/member:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div
                            className={`w-4 h-4 rounded-full shadow-lg ${
                              member.role === "1"
                                ? "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-cyan-400/50"
                                : "bg-gradient-to-r from-purple-400 to-cyan-400 shadow-purple-400/50"
                            } animate-pulse`}
                          ></div>
                          {member.role === "1" && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full animate-ping"></div>
                          )}
                        </div>
                        <span className="text-cyan-400 text-sm font-medium px-3 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 inline-block font-mono">
                          {formatAddress(member.member)}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-lg border inline-block ${
                          member.role === "1"
                            ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                            : "text-purple-400 bg-purple-500/10 border-purple-500/20"
                        }`}
                      >
                        {member.role === "1" ? "Admin" : "Member"}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Treasury Overview */}
        <div className="px-2 md:px-8 mb-12">
          <div className="group relative bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-800/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/25 transition-all duration-500 hover:border-purple-400/40 mx-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Treasury Overview
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Financial ecosystem management
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-green-400 text-sm font-medium">
                    Live
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="text-gray-400 text-sm">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Treasury Balance */}
              <div className="group/treasury relative overflow-hidden bg-gradient-to-br from-purple-600/15 via-purple-500/10 to-cyan-600/15 backdrop-blur-sm border border-purple-500/40 rounded-xl p-4 hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/15">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover/treasury:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                    <span className="text-lg">🏦</span>
                  </div>
                </div>
                <div className="relative pt-2">
                  <div className="text-2xl font-bold text-purple-400 mb-2 drop-shadow-lg">
                    {formatCurrency(
                      treasuryData?.treasury?.totalTreasureBalance || 0
                    )}
                  </div>
                  <div className="text-purple-300 font-semibold text-base mb-1">
                    Treasury Balance
                  </div>
                  <div className="text-gray-400 text-xs">
                    Total funds in treasury
                  </div>
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* USDC Balance */}
              <div className="group/usdc relative overflow-hidden bg-gradient-to-br from-cyan-600/15 via-blue-500/10 to-cyan-600/15 backdrop-blur-sm border border-cyan-500/40 rounded-xl p-4 hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/15">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover/usdc:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
                    <span className="text-lg">💰</span>
                  </div>
                </div>
                <div className="relative pt-2">
                  <div className="text-2xl font-bold text-cyan-400 mb-2 drop-shadow-lg">
                    {formatCurrency(treasuryData?.usdc?.treasuryBalance || 0)}
                  </div>
                  <div className="text-cyan-300 font-semibold text-base mb-1">
                    USDC Balance
                  </div>
                  <div className="text-gray-400 text-xs">
                    Stablecoin reserves
                  </div>
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 text-xs font-medium">
                      Stable
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced treasury metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-500/10 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-purple-400 text-sm font-semibold">
                      Total Assets
                    </div>
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-sm">📊</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {formatCurrency(
                      (treasuryData?.treasury?.totalTreasureBalance || 0) +
                        (treasuryData?.usdc?.treasuryBalance || 0)
                    )}
                  </div>
                  <div className="text-purple-300/70 text-xs">
                    Combined portfolio
                  </div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-cyan-500/10 via-cyan-400/5 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-cyan-400 text-sm font-semibold">
                      Growth Rate
                    </div>
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-cyan-400 text-sm">📈</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    +12.5%
                  </div>
                  <div className="text-cyan-300/70 text-xs">
                    Monthly increase
                  </div>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-500/10 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-blue-400 text-sm font-semibold">
                      Utilization
                    </div>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-sm">⚡</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    78.3%
                  </div>
                  <div className="text-blue-300/70 text-xs">
                    Active deployment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Real-time data • Last updated: {new Date().toLocaleTimeString()}
            </span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
