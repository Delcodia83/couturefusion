import React from "react";
import { useNavigate } from "react-router-dom";

export function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Tailoring Business or Find Your Perfect Fit?
        </h2>
        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
          Join CoutureFusion today and experience the future of custom clothing creation.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button 
            onClick={() => navigate("/register?role=client")} 
            className="px-8 py-4 bg-white text-primary rounded-md hover:bg-gray-100 text-lg font-medium transition-colors shadow-lg"
          >
            Join as Client
          </button>
          <button 
            onClick={() => navigate("/register?role=tailor")} 
            className="px-8 py-4 border-2 border-white text-white rounded-md hover:bg-white hover:text-primary text-lg font-medium transition-colors shadow-lg"
          >
            Join as Tailor
          </button>
        </div>
      </div>
    </section>
  );
}
