import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineMail, MdCheckCircle } from 'react-icons/md';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Mock API call since backend for forgot password isn't specified in requirements
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl tracking-tighter">HR</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 tracking-tight">
          Reset Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10">
          
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <MdCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent a password reset link to <span className="font-medium text-gray-800">{email}</span>. 
                Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdOutlineMail className="text-gray-400 text-lg" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                      placeholder="admin@hirate.in"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all ${
                      (loading || !email) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Sending link...' : 'Send reset link'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors">
                  &larr; Back to login
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
