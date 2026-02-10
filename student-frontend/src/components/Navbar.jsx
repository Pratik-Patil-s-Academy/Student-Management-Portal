import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Enquiry Form", to: "/enquiry" },
  { label: "Admission Form", to: "/admission" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const filteredLinks = navLinks.filter(
    (l) => !(location.pathname === "/" && l.label === "Home")
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-lg shadow-primary/5">
      <div className="container-narrow flex h-20 items-center justify-between px-4">
        {/* Logo Section */}
        <Link to="/" className="group flex items-center gap-3 relative">
          {/* Icon with modern styling */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
            <GraduationCap className="h-7 w-7 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-gold animate-pulse" />
            </div>
          </div>

          {/* Brand Name - Using solid primary for clarity */}
          <div className="flex flex-col">
            <span className="text-xl font-black text-primary group-hover:text-gold transition-colors duration-300">
              Pratik Patil's Academy
            </span>
            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
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
                ${location.pathname === l.to
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
                }
              `}
            >
              {/* Animated background on hover */}
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Active indicator */}
              {location.pathname === l.to && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
              )}

              {/* Text with hover effect */}
              <span className="relative z-10 group-hover:scale-105 inline-block transition-transform duration-300">
                {l.label}
              </span>

              {/* Underline animation */}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-gold group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
          ))}
        </div>

        {/* Mobile toggle with modern design */}
        <button
          onClick={() => setOpen(!open)}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-gold/10 text-primary transition-all duration-300 hover:from-primary/20 hover:to-gold/20 hover:scale-110 md:hidden shadow-md"
          aria-label="Toggle menu"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-gold opacity-0 hover:opacity-10 transition-opacity duration-300" />
          {open ? <X className="h-6 w-6 relative z-10" /> : <Menu className="h-6 w-6 relative z-10" />}
        </button>
      </div>

      {/* Mobile menu with slide-in animation */}
      {open && (
        <div className="border-t border-primary/20 bg-gradient-to-b from-background to-primary/5 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1 px-4 py-4">
            {filteredLinks.map((l, index) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`
                  group relative rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300
                  ${location.pathname === l.to
                    ? 'bg-gradient-to-r from-primary/20 to-gold/20 text-primary shadow-md'
                    : 'text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-gold/10 hover:text-primary'
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInLeft 0.3s ease-out forwards'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {location.pathname === l.to && (
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-gold animate-pulse" />
                  )}
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
