import Spline from "@splinetool/react-spline";
import { useState } from "react";
import Search from "./Search";
import HoverBorderGradient from "./ui/hover-border-gradient";

const Hero = () => {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => setShowSearch(!showSearch);

  return (
    <main className="h-screen relative grid grid-cols-1 lg:grid-cols-2 items-center px-4 sm:px-6 lg:px-8">
      {/* Left column with text content */}
      <div className="text-left max-w-2xl lg:ml-8 relative z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-4 animate-fade-in-up">
          <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            Welcome to ScamSheild
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl text-amber-900/80 leading-relaxed mb-8 
                    transition-all duration-300 hover:tracking-wide"
        >
          The solution is an AI-powered tool that helps you identify and report scam calls.
        </p>

        <div className="flex pt-4">
          <HoverBorderGradient
            containerClassName="rounded-full transition-transform duration-300 hover:scale-105"
            as="button"
            onClick={toggleSearch}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xl 
                      font-semibold px-8 py-3 flex items-center space-x-2 shadow-lg 
                      hover:shadow-amber-200/40"
          >
            <span>Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </HoverBorderGradient>
        </div>
      </div>

      {/* Right column with Spline component */}
      <div className="hidden lg:block relative h-screen w-full">
        <Spline scene="https://prod.spline.design/C6bXa4xnIEU3ce52/scene.splinecode" />
      </div>

      {/* Search popup */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
          <div className="p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[80vh] overflow-y-auto">
            <button onClick={toggleSearch} className="float-right text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Search />
          </div>
        </div>
      )}
    </main>
  );
};

export default Hero;
