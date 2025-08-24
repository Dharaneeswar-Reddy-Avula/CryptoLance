import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { usePurchaseTokens } from "../../interactions/HFTtoken__interactions";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";
import { fetchData } from "../../hooks/api";

function PurchaseTokens() {
  const { address, isConnected, chain } = useAccount();
  const [userTokenMetaData, setUserTokenMetaData] = useState({
    userHFTBalance: "0",
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch user token data when address changes or purchase is confirmed
  const fetchUserTokenData = async () => {
    if (!isConnected || !address) return;
    setIsLoadingData(true);
    try {
      const response = await fetchData(
        `https://cryptolance-qgzz.onrender.com/api/hftToken/userHFTtokenDetails/${address}`
      );
      if (response.success) {
        setUserTokenMetaData({
          userHFTBalance: response.userHFTBalance,
        });
      } else {
        toast.error("Failed to fetch token data.");
      }
    } catch (error) {
      console.error("Error fetching user token data:", error);
      toast.error("Error fetching token data: " + error.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUserTokenData();
  }, [address, isConnected]);

  // Use purchaseTokens hook
  const {
    approveUSDC,
    purchaseToken,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    isPurchasePending,
    isPurchaseConfirming,
    isPurchaseConfirmed,
    purchaseError,
    allowance,
    usdcBalance,
    allowanceError,
    usdcBalanceError,
  } = usePurchaseTokens();

  // Refetch HFT balance after purchase confirmation
  useEffect(() => {
    if (isPurchaseConfirmed) {
      fetchUserTokenData();
    }
  }, [isPurchaseConfirmed]);

  // Check ETH balance for gas (0.001 ETH threshold)
  const { data: balanceData } = useBalance({ address });
  const hasEnoughGas = balanceData && balanceData.value >= 0.001 * 10 ** 18;

  // Check USDC balance (10 USDC required, 6 decimals)
  const USDC_AMOUNT = BigInt(10 * 10 ** 6); // 10 USDC
  const hasEnoughUSDC = usdcBalance >= USDC_AMOUNT;

  // Check USDC allowance
  const hasEnoughAllowance = allowance >= USDC_AMOUNT;

  // Check if on correct network
  const isCorrectNetwork = chain && chain.id === baseSepolia.id;

  // Handle USDC approval
  const handleApproveUSDC = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to approve USDC.");
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Base Sepolia network.");
      return;
    }
    if (!hasEnoughGas) {
      toast.error("Insufficient ETH for gas fees (minimum 0.001 ETH).");
      return;
    }
    if (!hasEnoughUSDC) {
      toast.error("Insufficient USDC balance (minimum 10 USDC).");
      return;
    }
    if (allowanceError) {
      toast.error("Error checking USDC allowance: " + allowanceError.message);
      return;
    }
    if (usdcBalanceError) {
      toast.error("Error checking USDC balance: " + usdcBalanceError.message);
      return;
    }

    try {
      console.log("Calling approveUSDC...");
      await approveUSDC();
    } catch (err) {
      console.error("Approval error:", err);
      // Toast handled in useEffect
    }
  };

  // Handle purchase tokens
  const handlePurchaseTokens = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to purchase tokens.");
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Base Sepolia network.");
      return;
    }
    if (!hasEnoughGas) {
      toast.error("Insufficient ETH for gas fees (minimum 0.001 ETH).");
      return;
    }
    if (!hasEnoughUSDC) {
      toast.error("Insufficient USDC balance (minimum 10 USDC).");
      return;
    }
    if (!hasEnoughAllowance) {
      toast.error("Please approve USDC first.");
      return;
    }
    if (allowanceError) {
      toast.error("Error checking USDC allowance: " + allowanceError.message);
      return;
    }
    if (usdcBalanceError) {
      toast.error("Error checking USDC balance: " + usdcBalanceError.message);
      return;
    }

    try {
      console.log("Calling purchaseToken...");
      await purchaseToken();
    } catch (err) {
      console.error("Purchase error:", err);
      // Toast handled in useEffect
    }
  };

  // Update toast notifications for transaction states and loading
  useEffect(() => {
    let toastId;
    if (isLoadingData) {
      toastId = toast.loading("Loading token data...");
    } else if (isPurchasePending) {
      toastId = toast.loading("Purchasing tokens...");
    } else if (isApprovePending) {
      toastId = toast.loading("Approving USDC...");
    } else if (isPurchaseConfirming) {
      toastId = toast.loading("Confirming token purchase...");
    } else if (isApproveConfirming) {
      toastId = toast.loading("Confirming USDC approval...");
    } else if (isPurchaseConfirmed) {
      toastId = toast.success("Tokens purchased successfully!");
    } else if (isApproveConfirmed) {
      toastId = toast.success("USDC approved successfully!");
    } else if (purchaseError) {
      const isCancelled =
        purchaseError.code === 4001 ||
        /rejected|denied|cancelled/i.test(purchaseError.message);
      toastId = toast.error(
        isCancelled
          ? "Transaction cancelled"
          : `Purchase error: ${purchaseError.message}`
      );
    } else if (approveError) {
      const isCancelled =
        approveError.code === 4001 ||
        /rejected|denied|cancelled/i.test(approveError.message);
      toastId = toast.error(
        isCancelled
          ? "Transaction cancelled"
          : `Approval error: ${approveError.message}`
      );
    }
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [
    isLoadingData,
    isApprovePending,
    isPurchasePending,
    isApproveConfirming,
    isPurchaseConfirming,
    isApproveConfirmed,
    isPurchaseConfirmed,
    approveError,
    purchaseError,
  ]);

  return (
    <div className="p-5 max-w-md mx-auto bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">
        Purchase HFT Tokens
      </h3>
      <p className="text-gray-200 mb-2">
        Current HFT Balance: {userTokenMetaData.userHFTBalance} HFT
      </p>
      <p className="text-gray-200 mb-2">
        Purchase Cost: 10 USDC (plus gas fees in ETH)
      </p>
      {!hasEnoughAllowance ? (
        <button
          onClick={handleApproveUSDC}
          disabled={
            isApprovePending ||
            isApproveConfirming ||
            !hasEnoughUSDC ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            allowanceError ||
            usdcBalanceError
          }
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isApprovePending ||
            isApproveConfirming ||
            !hasEnoughUSDC ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            allowanceError ||
            usdcBalanceError
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isApprovePending || isApproveConfirming
            ? "Processing Approval..."
            : "Approve USDC"}
        </button>
      ) : (
        <button
          onClick={handlePurchaseTokens}
          disabled={
            isPurchasePending ||
            isPurchaseConfirming ||
            !hasEnoughUSDC ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            allowanceError ||
            usdcBalanceError
          }
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isPurchasePending ||
            isPurchaseConfirming ||
            !hasEnoughUSDC ||
            !hasEnoughGas ||
            !isConnected ||
            !isCorrectNetwork ||
            allowanceError ||
            usdcBalanceError
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPurchasePending || isPurchaseConfirming
            ? "Processing Purchase..."
            : "Purchase Tokens"}
        </button>
      )}
    </div>
  );
}

export default PurchaseTokens;
