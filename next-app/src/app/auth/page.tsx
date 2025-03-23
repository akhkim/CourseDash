'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const AuthPage = () => {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
    
    // Trigger animation after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className={`m-auto w-full max-w-6xl p-8 grid md:grid-cols-2 gap-8 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left side - App info */}
        <div className="flex flex-col justify-center">
          <div className={`transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-indigo-600 p-3 rounded-lg inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Study Dash</h1>
            <p className="text-xl text-gray-600 mb-6">Elevate your learning experience</p>
            
            <div className="space-y-6">
              <div className={`transition-all duration-700 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Collaborative Learning</h3>
                    <p className="text-gray-600">Connect with study partners in real-time</p>
                  </div>
                </div>
              </div>
              
              <div className={`transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Smart Notes</h3>
                    <p className="text-gray-600">Organize and access your notes from anywhere</p>
                  </div>
                </div>
              </div>
              
              <div className={`transition-all duration-700 delay-600 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Time Management</h3>
                    <p className="text-gray-600">Track study sessions and optimize your schedule</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login */}
        <div className={`transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="rounded-xl bg-white shadow-2xl overflow-hidden">
            {/* Login content */}
            <div className="p-6">
              {/* Logo and app name - REDUCED SIZE */}
              <div className="text-center mb-6 mt-2">
                <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
                <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
              </div>
              
              {/* Additional content above button - MADE MORE COMPACT */}
              <div className="mb-6 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <h3 className="font-medium text-indigo-700 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Why Google Sign-In?
                </h3>
                <p className="text-xs text-gray-700 mt-1">We use Google authentication to provide a secure, seamless login experience without the need for another password.</p>
              </div>
              
              {/* Google sign-in button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              
              {/* Note about only supporting Google */}
              <p className="text-xs text-center text-gray-500 mt-2 mb-6">
                Study Dash currently only supports Google authentication
              </p>
              
              {/* Additional content below button - MADE MORE COMPACT */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <h4 className="font-medium text-gray-700 text-sm mb-2">What you'll get access to:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Personalized study dashboard
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Progress tracking analytics
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Cloud-synced study materials
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Testimonial - MADE MORE COMPACT */}
              <div className="border-t border-gray-100 pt-4 pb-2">
                <blockquote className="italic text-gray-600 text-xs">
                  "Study Dash transformed how I prepare for exams. The productivity features helped me improve my grades significantly."
                </blockquote>
                <div className="flex items-center mt-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs">JD</div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-800">Jane Doe</p>
                    <p className="text-xs text-gray-500">Computer Science Student</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                By signing in, you agree to our <span className="text-indigo-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;