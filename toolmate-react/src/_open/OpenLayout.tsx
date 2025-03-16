import Footer from "@/components/custom/FooterOpen";
import Navbar from "@/components/custom/Navbar";
import { Outlet } from "react-router-dom";
// this layout is used for pages where authanication is not needed
export default function OpenLayout() {
  return (
    <>
      <div className="w-full h-full">
        <Navbar />

        <Outlet />
        <Footer />
      </div>
    </>
  );
}
