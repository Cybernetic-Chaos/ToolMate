import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500 from-0% to-white to-70%">
      {/* Radial gradient background */}
      <div className="absolute overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] aspect-[2/1]">
          <div className="absolute inset-0 bg-radial-gradient"></div>
        </div>
      </div>

      {/* Content container */}
      <div className="mx-auto px-4 relative z-10">
        <div className="flex flex-wrap justify-between">
          {/* Logo and dummy text */}
          <Logo />

          <div className="flex w-full md:w-3/6 justify-between flex-wrap">
            {/* Quick Links */}
            <div className="w-full mx-4 md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-left">
                {[
                  { name: "Home", path: "/" },
                  { name: "Pricing", path: "/pricing" },
                  { name: "Contact Us", path: "/contact" },
                  { name: "About Us", path: "/AboutUs" },
                  { name: "Privacy Policy", path: "/privacy-policy" },
                ].map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.path}
                      className="hover:font-semibold text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="w-full  mx-4 md:w-1/3">
              <h3 className="text-lg font-bold mb-4">Social Media</h3>
              <div className="space-y-2 text-left">
                {["Facebook", "X (formerly Twitter)", "Youtube", "Instagram"].map((item) => (
                  <div key={item}>
                    <Link
                      to="#"
                      className="hover:font-semibold transition-all text-gray-600 hover:text-gray-900"
                    >
                      {item}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-center mt-8">
          <p className="text-md text-gray-600 font-semibold">
            &copy;2024 Toolmate.tool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
