import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#2C3E50] text-white border-t border-[#34495E]">
      <div className="container-narrow px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap className="h-7 w-7" />
              <span className="text-lg font-bold">Pratik Patil's Academy</span>
            </div>
            <p className="text-sm opacity-80">
              Premier Coaching Institute for 11th &amp; 12th Science Students.
              Preparing future engineers and doctors since years.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/enquiry"
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  Enquiry Form
                </Link>
              </li>
              <li>
                <Link
                  to="/admission"
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  Admission Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 opacity-80">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <Mail className="h-4 w-4" /> info@pratikpatilacademy.com
              </li>
              <li className="flex items-center gap-2 opacity-80">
                <MapPin className="h-4 w-4" /> Maharashtra, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Pratik Patil's Academy. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
