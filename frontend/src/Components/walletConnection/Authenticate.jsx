import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

function Authenticate({ onAuthSuccess }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authStatus, setAuthStatus] = useState(null);

  const authenticate = async () => {
    if (!isConnected) {
      setAuthStatus("Please connect your wallet first");
      return;
    }

    try {
      const nonceResponse = await fetch(
        "https://cryptolance-qgzz.onrender.com/api/auth/get-nonce",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        }
      );
      const { success, nonce, message } = await nonceResponse.json();
      if (!success) {
        setAuthStatus(message || "Failed to get nonce");
        return;
      }

      const signature = await signMessageAsync({ message: nonce });

      const verifyResponse = await fetch(
        "https://cryptolance-qgzz.onrender.com/api/auth/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, nonce }),
        }
      );
      const verifyResult = await verifyResponse.json();

      if (verifyResult.success) {
        setAuthStatus("Authentication successful");
        onAuthSuccess(
          verifyResult.token,
          verifyResult.userExists,
          verifyResult.user
        );
      } else {
        setAuthStatus(verifyResult.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus("Authentication failed");
    }
  };

  return (
    <div>
      <h2>Authenticate</h2>
      {isConnected && (
        <button onClick={authenticate}>Sign Message to Authenticate</button>
      )}
      {authStatus && <p>{authStatus}</p>}
    </div>
  );
}

export default Authenticate;
