import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromURL = new URLSearchParams(window.location.search).get("token");
    const savedToken = localStorage.getItem("token");

    if (tokenFromURL) {
      // console.log("🔑 Token from URL:", tokenFromURL);

      try {
        localStorage.setItem("token", tokenFromURL);
        const decoded = jwtDecode(tokenFromURL);
        // console.log("✅ Decoded User from token:", decoded);

        if (decoded && typeof decoded === "object" && decoded.userId) {
          localStorage.setItem("user", JSON.stringify(decoded));
          // console.log("✅ User stored, redirecting to dashboard...");
          navigate("/dashboard");
        } else {
          // console.error("❌ Invalid decoded user format:", decoded);
          navigate("/");
        }
      } catch (err) {
        // console.error("❌ JWT decoding failed:", err);
        navigate("/");
      }

    } else if (savedToken) {
      console.log("📦 Token found in localStorage, trying to decode...");
      try {
        const decoded = jwtDecode(savedToken);
        if (decoded && decoded.userId) {
          navigate("/dashboard");
        } else {
          console.warn("⚠️ Invalid local user token, redirecting to /");
          navigate("/");
        }
      } catch (err) {
        console.error("❌ Decoding saved token failed:", err);
        navigate("/");
      }
    } else {
      // console.log("🚫 No token found anywhere, going to home");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-gray-700">
      <h2 className="text-lg font-semibold mb-2">Processing authentication...</h2>
      <p className="text-sm text-gray-500">Please wait while we redirect you to your dashboard.</p>
    </div>
  );
};

export default Welcome;
