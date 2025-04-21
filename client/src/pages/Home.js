import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Kullanıcı giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 text-white p-8 md:p-12 mb-12 shadow-elevated">
        <div className="max-w-4xl mx-auto">
          <div className="md:flex items-center">
            <div className="md:w-7/12 md:pr-8 mb-8 md:mb-0">
              <span className="inline-block bg-primary text-navy-800 font-medium px-4 py-1 rounded-full text-sm mb-4">
                Secure Solution for Rental Properties
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tenant Deposit Protection System
              </h1>
              <p className="text-xl mb-8 text-white">
                Secure your deposits by digitally documenting the condition of your property during move-in and move-out.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Get Started
                </Link>
                <Link to="/login" className="btn-outline bg-navy-600 border-white text-white hover:bg-navy-500 inline-flex items-center justify-center px-6 py-3 text-base font-medium">
                  Login
                </Link>
              </div>
            </div>
            <div className="w-full md:w-5/12 mt-4 md:mt-0">
              <div className="bg-navy-600 p-3 md:p-4 rounded-lg shadow-card">
                <div className="aspect-w-4 aspect-h-3 bg-cream rounded-lg overflow-hidden shadow-inner">
                  <svg className="w-full h-full text-navy-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="mb-10 md:mb-16 px-4 md:px-0">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="heading-primary">Why Tenant Deposit?</h2>
          <p className="text-navy-600 text-base md:text-lg max-w-3xl mx-auto">
            A digital solution developed to prevent deposit disputes between landlords and tenants.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="card-elevated text-center p-4 md:p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-100 text-amber-600 mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2">Secure Documentation</h3>
            <p className="text-navy-600 text-sm md:text-base">
              Your information and photos are securely stored and shared only with people you authorize.
            </p>
          </div>
          
          <div className="card-elevated text-center p-4 md:p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-100 text-amber-600 mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2">Photo Documentation</h3>
            <p className="text-navy-600 text-sm md:text-base">
              Document the condition of your property with photos to provide strong evidence in case of disputes.
            </p>
          </div>
          
          <div className="card-elevated text-center p-4 md:p-6">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-100 text-amber-600 mb-3 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2">Time-Stamped Reports</h3>
            <p className="text-navy-600 text-sm md:text-base">
              All your reports are automatically dated and securely stored throughout the rental period.
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-cream rounded-xl p-5 md:p-8 mb-10 md:mb-16 shadow-card mx-4 md:mx-0">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="heading-primary">How It Works</h2>
          <p className="text-navy-600 text-base md:text-lg max-w-3xl mx-auto">
            Document your property condition in just 3 simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white rounded-lg shadow-soft p-5 relative">
            <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-navy-800 font-bold text-lg md:text-xl shadow-md">
              1
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2 mt-1 md:mt-2">Create an Account</h3>
            <p className="text-navy-600 text-sm md:text-base">
              Register quickly and easily with just your name, email, and password.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-5 relative">
            <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-navy-800 font-bold text-lg md:text-xl shadow-md">
              2
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2 mt-1 md:mt-2">Add Property Information</h3>
            <p className="text-navy-600 text-sm md:text-base">
              Enter the address and details of your rented property into the system.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-5 relative">
            <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-navy-800 font-bold text-lg md:text-xl shadow-md">
              3
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-navy-700 mb-2 mt-1 md:mt-2">Create a Report</h3>
            <p className="text-navy-600 text-sm md:text-base">
              Take photos of the property condition, add notes, and securely share the report with your landlord.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center bg-navy-700 text-white rounded-xl p-6 md:p-10 shadow-elevated mx-4 md:mx-0">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Secure Your Deposits</h2>
        <p className="text-lg md:text-xl mb-5 md:mb-6 text-white max-w-3xl mx-auto">
          Join millions of renters who use our digital solution to protect their security deposits.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/register" className="btn-primary inline-flex items-center justify-center px-6 md:px-8 py-3 text-base md:text-lg font-medium">
            Start Free
          </Link>
          <Link to="/login" className="btn-outline inline-flex items-center justify-center px-6 md:px-8 py-3 text-base md:text-lg font-medium border-white bg-navy-600 hover:bg-navy-500 text-white">
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;