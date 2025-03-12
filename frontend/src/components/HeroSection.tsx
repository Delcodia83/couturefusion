import React from "react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[90vh] bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516762689617-e1cffcef479d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2344&q=80')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Where Tailors and Clients <span className="text-primary">Connect</span> for Perfect Fits
          </h1>
          
          <p className="mt-6 text-xl text-gray-700 max-w-2xl">
            CoutureFusion brings together skilled tailors and clients seeking custom clothing. Manage measurements, showcase designs, and streamline the ordering process.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate("/register?role=client")} 
              className="px-8 py-4 bg-primary text-white rounded-md hover:bg-primary/90 text-lg font-medium transition-colors shadow-lg"
            >
              Join as Client
            </button>
            <button 
              onClick={() => navigate("/register?role=tailor")} 
              className="px-8 py-4 border-2 border-primary text-primary rounded-md hover:bg-primary hover:text-white text-lg font-medium transition-colors shadow-lg"
            >
              Join as Tailor
            </button>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-2/5 h-4/5">
        <div className="relative h-full w-full">
          <div className="absolute rounded-l-2xl overflow-hidden shadow-2xl h-3/4 w-full right-0">
            <img 
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Tailor measuring fabric" 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
