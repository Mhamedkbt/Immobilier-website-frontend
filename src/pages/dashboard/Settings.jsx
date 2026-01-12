import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import API_URL from "../../config/api"; 

export default function Settings() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Store original username to check if it has changed
  const [originalUsername, setOriginalUsername] = useState(""); 
  
  // State to manage the success message display related to password change
  const [isPasswordChangedSuccessfully, setIsPasswordChangedSuccessfully] = useState(false);

  // --- 1. Fetch Admin Data on Load ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Assuming the logged-in admin is always ID 1 for this dashboard
    api
      .get("/admins/1", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const loadedUsername = res.data.username;
        setUsername(loadedUsername);
        setOriginalUsername(loadedUsername);
      })
      .catch(() => {
        console.error("Failed to load admin data. Token may be invalid.");
      });
  }, []);

  // --- 2. Handle Update Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsPasswordChangedSuccessfully(false); // Reset message state

    const newUsernameTrim = username.trim();
    const oldPasswordTrim = oldPassword.trim();
    const newPasswordTrim = newPassword.trim();
    const confirmPasswordTrim = confirmPassword.trim();
    
    const isUsernameChanged = newUsernameTrim !== originalUsername;
    const isPasswordChangeAttempt = newPasswordTrim || oldPasswordTrim || confirmPasswordTrim;
    
    // Determine if any secure fields are being updated
    const isSecureUpdate = isUsernameChanged || newPasswordTrim; // Only newPassword requires oldPassword for the API

    // Check if anything was actually submitted
    if (!isUsernameChanged && !isPasswordChangeAttempt) {
      setError("No changes were made to save.");
      return;
    }

    // --- NEW SECURITY CHECK ---
    // If the username is changed OR a new password is set, the current password IS REQUIRED.
    if (isUsernameChanged || newPasswordTrim) {
      if (!oldPasswordTrim) {
        setError("Current password is required to confirm your identity for this change.");
        return;
      }
    }
    // --- END NEW SECURITY CHECK ---

    // --- Password Validation (only runs if newPasswordTrim is set) ---
    let willChangePassword = false;
    
    if (newPasswordTrim) {
      // The oldPasswordTrim check is now handled above, so we only check confirmation here.
      if (newPasswordTrim !== confirmPasswordTrim) {
        setError("New passwords do not match.");
        return;
      }
      willChangePassword = true;
    } else if (oldPasswordTrim) {
      // If current password is provided but no new password, throw error
      setError("New password cannot be empty if current password is provided.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // 1. Construct the payload (Request Body)
      const payload = { username: newUsernameTrim };
      
      // 2. Construct Query Parameters (Your backend expects oldPassword as a param)
      let queryParams = '';
      
      // Send the old password ONLY if it was provided (required for any sensitive change)
      // The backend will use this param for password change AND to confirm user identity for username change.
      if (oldPasswordTrim) {
        queryParams = `?oldPassword=${oldPasswordTrim}`;
      }
      
      // If we are changing the password, add it to the body
      if (willChangePassword) {
        payload.password = newPasswordTrim;
      }

      // Send the PUT request
      const response = await api.put(`/admins/1${queryParams}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // NOTE: Your backend will still require a fix to enforce oldPassword
      // when ONLY the username is updated. The frontend fix is necessary but not sufficient.

      // Reset state on success
      setMessage("Settings updated successfully ✅");
      setOriginalUsername(newUsernameTrim); // Update original username
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);

      // Redirect if password changed
      if (willChangePassword) {
        setIsPasswordChangedSuccessfully(true);
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.replace("/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Current password is incorrect. Please try again.");
        } else if (err.response.status === 400) {
          setError(err.response.data || "Invalid request. Check your fields.");
        } else {
          // General server error
          setError(err.response.data?.message || "Update failed. Please check your information and try again.");
        }
      } else {
        setError("Network error: Could not reach the server.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate derived state for the disabled button logic
  const isUsernameChanged = username.trim() !== originalUsername;
  const isAnyPasswordFilled = oldPassword.trim() || newPassword.trim() || confirmPassword.trim();
  const canSubmit = isUsernameChanged || isAnyPasswordFilled;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          <i className="fas fa-cog text-indigo-600"></i> Admin Settings
        </h1>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
              <i className="fas fa-check-circle mr-2"></i>
              {message} {isPasswordChangedSuccessfully && "You will be redirected to login page..."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="oldPassword"
                type={showPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={showPassword} 
                  onChange={() => setShowPassword(!showPassword)} 
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Show Passwords</span>
              </label>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
}


