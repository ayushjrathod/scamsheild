import About from "./About";
import Hero from "./Hero";
import FloatingNav from "./ui/floating-navbar";

interface NavItem {
  name: string;
  link: string;
  icon?: JSX.Element;
}

export default function Landing() {
  const navItems: NavItem[] = [
    {
      name: "Home",
      link: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    { name: "About", link: "#about" },
    { name: "Upload", link: "/upload" },
    { name: "ChatBot", link: "/chat" },
  ];

  return (
    <div className="relative bg-[#F8F2E6] min-h-screen overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_#fde68a_0%,_transparent_60%)] opacity-30" />
      <FloatingNav className="backdrop-blur-lg bg-white/50" navItems={navItems} />
      <Hero />
      <div id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-lg">
        <About />
      </div>
    </div>
  );
}
