import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, clearMessages } from '../features/authSlice'; // Ensure you have a clearMessages action

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');  // State for email validation error
  const dispatch = useDispatch();
  const { loading, message, error } = useSelector((state) => state.auth);

  // Clear message and error when component mounts
  useEffect(() => {
    dispatch(clearMessages()); // Clear any existing messages when the component mounts
  }, [dispatch]);

  // Email validation function
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required.';  // Check if email is empty
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    return '';  // No error
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email before submitting
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setEmailError('');  // Clear error if valid
    dispatch(requestPasswordReset(email));  // Dispatch action to request password reset
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">TalkStream</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>} {/* Show error if validation fails */}
          </div>
          {loading && <p className="text-blue-500 text-center">Sending reset link...</p>}
          {message && <p className="text-green-500 text-center">{message} Please check your email to reset your password.</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50 transition-all"
            disabled={loading}
          >
            {loading ? 'Requesting Reset...' : 'Request Password Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
