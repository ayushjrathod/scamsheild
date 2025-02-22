import { Link } from "react-router-dom";
import HoverBorderGradient from "./ui/hover-border-gradient";
const Hero = () => {
  return (
    <main className="relative flex items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl space-y-8">
        {/* Animated heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-4 animate-fade-in-up">
          <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            Welcome to ScamSheild
          </span>
        </h1>

        {/* Enhanced paragraph styling */}
        <p
          className="text-lg sm:text-xl text-amber-900/80 leading-relaxed max-w-3xl mx-auto 
                        transition-all duration-300 hover:tracking-wide"
        >
          The solution is an AI-powered tool that helps you identify and report scam calls.
        </p>

        {/* Enhanced button container */}
        <div className="flex justify-center pt-8">
          <Link to="/upload">
            <HoverBorderGradient
              containerClassName="rounded-full transition-transform duration-300 hover:scale-105"
              as="button"
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
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Hero;
