import React from "react";
import { useNavigate } from "react-router-dom";

export function ForTailorsSection() {
  const navigate = useNavigate();
  
  const benefits = [
    "Showcase your portfolio of designs to attract new clients",
    "Manage client measurements and order specifications in one place",
    "Process payments securely through integrated payment gateways",
    "Track the progress of orders from initial measurement to delivery",
    "Communicate directly with clients through built-in messaging",
    "Choose from flexible licensing options to suit your business"
  ];

  return (
    <section id="tailors" className="py-20 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">For Tailors and Couturiers</h2>
            <p className="text-xl text-gray-700 mb-8">
              Streamline your tailoring business with powerful tools designed specifically for clothing professionals.
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
              onClick={() => navigate("/register?role=tailor")} 
              className="mt-10 px-8 py-4 bg-primary text-white rounded-md hover:bg-primary/90 text-lg font-medium transition-colors shadow-lg"
            >
              Start Your Tailor Business
            </button>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Tailor working on a garment" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
