import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Enquiry Form", to: "/enquiry" },
  { label: "Admission Form", to: "/admission" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container-narrow flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-lg font-bold text-primary">
            Pratik Patil's Academy
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-primary md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
