import React from "react";
import { useNavigate } from "react-router-dom";

export function ForClientsSection() {
  const navigate = useNavigate();
  
  const benefits = [
    "Store your measurements securely for future orders",
    "Browse through tailor portfolios to find the perfect match",
    "Communicate directly with tailors about your requirements",
    "Track the progress of your orders in real-time",
    "Receive notifications about order updates and completion",
    "Review tailors and share your experience with others"
  ];

  return (
    <section id="clients" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">For Clients Seeking Custom Clothing</h2>
            <p className="text-xl text-gray-700 mb-8">
              Find talented tailors, share your measurements, and order custom-made clothing that fits perfectly.
            </p>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-6 w-6 text-primary mt-0.5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate("/register?role=client")} 
              className="mt-10 px-8 py-4 bg-primary text-white rounded-md hover:bg-primary/90 text-lg font-medium transition-colors shadow-lg"
            >
              Find Your Perfect Tailor
            </button>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1548234979-9517574cb43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Client getting measurements taken" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
