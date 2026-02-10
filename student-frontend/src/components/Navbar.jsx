import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Sparkles } from "lucide-react";
import logo from "../assets/logo.jpeg";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Enquiry Form", to: "/enquiry" },
  { label: "Admission Form", to: "/admission" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredLinks = navLinks.filter(
    (l) => !(location.pathname === "/" && l.label === "Home"),
  );

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-[#34495E] shadow-lg transition-colors duration-300 ${scrolled ? "bg-[#2C3E50]/80 backdrop-blur-md" : "bg-[#2C3E50]"}`}
    >
      <div className="container-narrow flex h-20 items-center justify-between px-4">
        {/* Logo Section */}
        <Link to="/" className="group flex items-center gap-3 relative">
          <img
            src={logo}
            alt="Logo"
            className="h-12 w-12 rounded-full object-cover bg-transparent"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors duration-300">
              Pratik Patil's Academy
            </span>
            <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
              Excellence in Education
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with modern styling */}
        <div className="hidden items-center gap-2 md:flex">
          {filteredLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`
                group relative px-5 py-2.5 text-sm font-semibold transition-all duration-300
                ${
                  location.pathname === l.to
                    ? "bg-[#34495E] text-white font-semibold"
                    : "text-gray-300 hover:bg-[#34495E] hover:text-white"
                }
                rounded
              `}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle with modern design */}
        <button
          onClick={() => setOpen(!open)}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#34495E] text-white transition-all duration-300 hover:bg-[#22313A] md:hidden shadow-md"
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-6 w-6 relative z-10" />
          ) : (
            <Menu className="h-6 w-6 relative z-10" />
          )}
        </button>
      </div>
      {open && (
        <div className="border-t border-[#34495E] bg-[#2C3E50] md:hidden animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1 px-4 py-4">
            {filteredLinks.map((l, index) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`
                  group relative rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300
                  ${
                    location.pathname === l.to
                      ? "bg-[#34495E] text-white font-semibold shadow-md"
                      : "text-gray-300 hover:bg-[#34495E] hover:text-white"
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "slideInLeft 0.3s ease-out forwards",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
