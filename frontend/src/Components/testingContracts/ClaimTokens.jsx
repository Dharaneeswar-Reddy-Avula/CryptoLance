import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useClaimTokens } from "../../interactions/HFTtoken__interactions";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";
import { fetchData } from "../../hooks/api";

function ClaimTokens() {
  const { address, isConnected, chain } = useAccount();
  const [errorMessage, setErrorMessage] = useState(null);
  const [userTokenMetaData, setUserTokenMetaData] = useState({
    lastClaimTime: "0",
    userHFTBalance: "0",
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch user token data when address changes
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchUserTokenData = async () => {
      setIsLoadingData(true);
      try {
        const response = await fetchData(
          `https://cryptolance-qgzz.onrender.com/api/hftToken/userHFTtokenDetails/${address}`
        );
        if (response.success) {
          setUserTokenMetaData({
            lastClaimTime: response.lastClaimTime,
            userHFTBalance: response.userHFTBalance,
          });
        } else {
          setErrorMessage("Failed to fetch token data.");
        }
      } catch (error) {
        console.error("Error fetching user token data:", error);
        setErrorMessage("Error fetching token data: " + error.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserTokenData();
  }, [address, isConnected]);

  // Use hooks
  const {
    claimTokens,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useClaimTokens();

  // Check ETH balance for gas (0.001 ETH threshold)
  const { data: balanceData } = useBalance({ address });
  const hasEnoughGas = balanceData && balanceData.value >= 0.001 * 10 ** 18;

  // Check if user can claim tokens (once every 30 days)
  const canClaim = () => {
    const lastClaim = Number(userTokenMetaData.lastClaimTime);
    if (lastClaim === 0) return true;
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= lastClaim + thirtyDaysInSeconds;
  };

  // Check if on correct network
  const isCorrectNetwork = chain && chain.id === baseSepolia.id;

  // Handle claim tokens
  const handleClaimTokens = async () => {
    setErrorMessage(null);
    if (!isCorrectNetwork) {
      setErrorMessage("Please switch to Base Sepolia network.");
      return;
    }
    if (!hasEnoughGas) {
      setErrorMessage("Insufficient ETH for gas fees (minimum 0.001 ETH).");
      return;
    }
    if (!canClaim()) {
      setErrorMessage("You can only claim tokens once every 30 days.");
      return;
    }
    // const toastId = toast.loading("Please sign the transaction in your wallet...");
    try {
      await claimTokens();
      // toast.success("Tokens claimed successfully! ", { id: toastId });
    } catch (err) {
      toast.error(`Failed to claim tokens: ${err.message}`, { id: toastId });
    }
  };

  // Update toast notifications for transaction states
  useEffect(() => {
    let toastId;
    if (isPending) {
      toastId = toast.loading("Transaction is pending...");
    } else if (isConfirming) {
      toastId = toast.loading("Transaction is confirming...");
    } else if (isConfirmed) {
      toast.success("Tokens claimed successfully!");
    } else if (error) {
      toast.error(`Error: ${error.message}`);
    }
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [isPending, isConfirming, isConfirmed, error]);

  return (
    <div className="p-5 max-w-md mx-auto bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">
        Claim HFT Tokens
      </h3>
      {!isConnected ? (
        <p className="text-red-500">
          Please connect your wallet to claim tokens.
        </p>
      ) : !isCorrectNetwork ? (
        <p className="text-red-500">Please switch to Base Sepolia network.</p>
      ) : isLoadingData ? (
        <p className="text-gray-400">Checking eligibility...</p>
      ) : (
        <>
          <p className="text-gray-200 mb-2">
            Current HFT Balance: {userTokenMetaData.userHFTBalance} HFT
          </p>
          <button
            onClick={handleClaimTokens}
            disabled={isPending || isConfirming || !canClaim() || !hasEnoughGas}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isPending || isConfirming || !canClaim() || !hasEnoughGas
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending || isConfirming ? "Processing..." : "Claim Tokens"}
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {!canClaim() && !errorMessage && (
            <p className="text-red-500 mt-2">
              You can claim again after{" "}
              {new Date(
                (Number(userTokenMetaData.lastClaimTime) + 30 * 24 * 60 * 60) *
                  1000
              ).toLocaleDateString()}
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ClaimTokens;
