import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">CoutureFusion</h3>
            <p className="text-gray-600 max-w-xs">
              Connecting tailors and clients for custom clothing creations.
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">Find a Tailor</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Manage Measurements</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Track Orders</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4">For Tailors</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">Showcase Designs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Manage Orders</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Subscription Plans</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Email: contact@couturefusion.com</li>
              <li className="text-gray-600">Support: support@couturefusion.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CoutureFusion. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
