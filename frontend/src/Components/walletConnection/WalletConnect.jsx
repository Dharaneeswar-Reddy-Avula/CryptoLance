import { useEffect, useState, useRef } from "react";
import { useAccount, useSignMessage, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import {
  verifyWalletAuth,
  logout,
  validateStoredToken,
} from "../../store/authSlice/authSlice";
import { useDispatch, useSelector } from "react-redux";

function WalletConnect({ onAuthSuccess }) {
  const { address, isConnected, chain, status } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChain } = useSwitchChain();
  const [authStatus, setAuthStatus] = useState(null);
  const [chainError, setChainError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // Use refs to track previous values and prevent unnecessary re-authentication
  const prevAddressRef = useRef(null);
  const prevChainRef = useRef(null);
  const hasAuthenticatedRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Initialize authentication state on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      console.log("=== WalletConnect: Initializing authentication state ===");

      // Try to restore authentication from stored data
      const storedToken = localStorage.getItem("authToken");
      const storedAddress = localStorage.getItem("authAddress");

      console.log("Stored token exists:", !!storedToken);
      console.log("Stored address exists:", !!storedAddress);
      console.log("Stored address:", storedAddress);

      if (storedToken && storedAddress) {
        console.log("Found stored authentication data, validating...");
        dispatch(validateStoredToken())
          .then((result) => {
            console.log("Token validation result:", result);
            if (result.meta.requestStatus === "fulfilled") {
              console.log("Stored token validated successfully");
              hasAuthenticatedRef.current = true;
              // Call onAuthSuccess with stored data
              onAuthSuccess(
                result.payload.token,
                result.payload.userExists,
                result.payload.user
              );
            } else {
              console.log(
                "Stored token validation failed, will require re-authentication"
              );
              // Don't clear localStorage here - let the auth slice handle it
              // Only clear if it's an actual authentication error
            }
          })
          .catch((error) => {
            console.error("Error during token validation:", error);
            // Don't clear localStorage for network errors
          });
      } else {
        console.log("No stored authentication data found");
      }
    }
  }, [dispatch, onAuthSuccess]);

  useEffect(() => {
    // Only run when wallet connection or address changes
    if (!isConnected || !address || status !== "connected") {
      console.log(
        "Wallet not properly connected, skipping authentication effect"
      );
      return;
    }

    console.log("=== WalletConnect: Wallet connection effect running ===");
    console.log("Address:", address);
    console.log("Chain:", chain?.id);
    console.log("Status:", status);

    // Check if we're already authenticated for this address
    const storedToken = localStorage.getItem("authToken");
    const storedAddress = localStorage.getItem("authAddress");

    console.log("Stored token exists:", !!storedToken);
    console.log("Stored address:", storedAddress);
    console.log("Current address:", address);
    console.log("Addresses match:", storedAddress === address);
    console.log("Auth state authenticated:", authState.isAuthenticated);

    if (storedToken && storedAddress === address && authState.isAuthenticated) {
      console.log(
        "Already authenticated for this address, skipping re-authentication"
      );
      hasAuthenticatedRef.current = true;
      return;
    }

    // If we have a stored token but it's for a different address, clear it
    if (storedToken && storedAddress !== address) {
      console.log("Address changed, clearing old authentication data");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authAddress");
      hasAuthenticatedRef.current = false;
    }

    // Prevent re-authentication if we already have a valid token for this address
    if (
      storedToken &&
      storedAddress === address &&
      !hasAuthenticatedRef.current
    ) {
      console.log(
        "Found valid stored token, attempting to validate instead of re-authenticating"
      );
      dispatch(validateStoredToken())
        .then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            console.log("Stored token validation successful");
            hasAuthenticatedRef.current = true;
            onAuthSuccess(
              result.payload.token,
              result.payload.userExists,
              result.payload.user
            );
          } else {
            console.log(
              "Stored token validation failed, proceeding with new authentication"
            );
            hasAuthenticatedRef.current = false;
          }
        })
        .catch((error) => {
          console.error("Error during stored token validation:", error);
          hasAuthenticatedRef.current = false;
        });
      return;
    }

    if (hasAuthenticatedRef.current) {
      console.log("Already authenticated, skipping authentication");
      return;
    }

    // Chain check
    if (chain && ![base.id, baseSepolia.id].includes(chain.id)) {
      setChainError("Please switch to Base Mainnet or Base Sepolia");
      return;
    }
    setChainError(null);

    console.log("Proceeding with authentication...");

    const authenticate = async () => {
      if (hasAuthenticatedRef.current) {
        console.log(
          "Authentication already in progress or completed, skipping"
        );
        return;
      }

      setIsAuthenticating(true);
      try {
        console.log("Getting nonce for address:", address);
        const nonceResponse = await fetch(
          "https://cryptolance-qgzz.onrender.com/api/auth/get-nonce",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          }
        );
        if (!nonceResponse.ok) {
          setAuthStatus("Failed to get nonce");
          return;
        }
        const { success, nonce, message } = await nonceResponse.json();
        if (!success) {
          setAuthStatus(message || "Failed to get nonce");
          return;
        }
        console.log("Got nonce, signing message...");
        const signature = await signMessageAsync({ message: nonce });
        console.log("Message signed, verifying wallet auth...");
        const resultAction = await dispatch(
          verifyWalletAuth({ address, signature, nonce })
        );
        const verifyResult = resultAction.payload;
        if (verifyResult?.token) {
          setAuthStatus("Authentication successful");
          hasAuthenticatedRef.current = true;
          localStorage.setItem("authToken", verifyResult.token);
          localStorage.setItem("authAddress", address);
          console.log("Authentication successful, calling onAuthSuccess");
          onAuthSuccess(
            verifyResult.token,
            verifyResult.userExists,
            verifyResult.user
          );
        } else {
          setAuthStatus("Authentication failed");
          hasAuthenticatedRef.current = false;
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthStatus(`Authentication failed: ${error.message}`);
        hasAuthenticatedRef.current = false;
      } finally {
        setIsAuthenticating(false);
      }
    };
    authenticate();
    prevAddressRef.current = address;
    prevChainRef.current = chain?.id;
  }, [isConnected, address, chain, status, authState.isAuthenticated]);

  // Clear auth state when wallet disconnects
  useEffect(() => {
    console.log("=== WalletConnect: Wallet connection status changed ===");
    console.log("isConnected:", isConnected);
    console.log("status:", status);
    console.log("address:", address);

    // Only clear auth state if we're actually disconnected, not just unmounting
    if (!isConnected && status === "disconnected") {
      console.log("Wallet actually disconnected, clearing auth state");
      dispatch(logout());
      setAuthStatus("Please connect your wallet");
      hasAuthenticatedRef.current = false;
      hasInitializedRef.current = false;
      // Clear stored auth data only when actually disconnecting
      localStorage.removeItem("authToken");
      localStorage.removeItem("authAddress");
    } else if (!isConnected && status !== "disconnected") {
      console.log(
        "Component unmounting or wallet connecting, preserving authentication data"
      );
      // Don't clear localStorage here - this might be a temporary state during route changes
      // Only clear the Redux state, not localStorage
      dispatch(logout());
      setAuthStatus("Please connect your wallet");
      hasAuthenticatedRef.current = false;
      hasInitializedRef.current = false;
      console.log("Current localStorage state:");
      console.log("authToken:", localStorage.getItem("authToken"));
      console.log("authAddress:", localStorage.getItem("authAddress"));
    } else {
      console.log("Wallet connected, preserving authentication data");
    }
  }, [isConnected, status, dispatch]);

  return (
    <div>
      {/* <h2>Connect Wallet</h2> */}
      <w3m-button />
      {chainError && <p style={{ color: "red" }}>{chainError}</p>}
      {/* {authStatus && <p>{authStatus}</p>} */}
    </div>
  );
}

export default WalletConnect;
