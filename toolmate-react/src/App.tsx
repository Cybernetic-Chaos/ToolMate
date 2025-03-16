import { Route, Routes } from "react-router-dom";
import "./App.css";
import OpenLayout from "./_open/OpenLayout";
import Landing from "./_open/pages/Landing";
import PreviewChat from "./_open/pages/PreviewChat";
import Signin from "./_open/pages/Signin";
import Signup from "./_open/pages/Signup";
import DashaboardLayout from "./_private/DashboardLayout";
import Dashboard from "./_private/pages/Dashboard";
import { ChatPage } from "./_private/socket/pages/ChatPage";
import { ChatPageNew } from "./_private/socket/pages/ChatPageNew";
import SocketProvider from "./context/socketContext";
import { SocketLayout } from "./_private/socket/SocketLayout";
import { Toaster } from "./components/ui/toaster";
import { ExploreCommunity } from "./_private/pages/ExploreCommunity";
import { MyCommunity } from "./_private/pages/MyCommunity";
import { CommunityCreationForm } from "./components/custom/CommunityCreationForm";
import { useUser } from "@clerk/clerk-react";
import MyInventory from "./_private/pages/MyInventory";
import Pricing from "./_open/pages/Pricing";
import SuccessPayment from "./_private/pages/SuccessPayment";
import Refundpolicy from "./_open/pages/legalDocs/RefundPolicy";
import AboutUs from "./_open/pages/legalDocs/AboutUs";
import CommunityGuideline from "./_open/pages/legalDocs/CommunityGuideline";
import TermsOfService from "./_open/pages/legalDocs/TermAndCon";
import PrivacyPolicy from "./_open/pages/legalDocs/PrivacyPolicy";
import SafetyPolicy from "./_open/pages/legalDocs/SafetyPolicy";
import ManageSub from "./_private/pages/ManageSub";
import SubscriptionLayout from "./_private/pages/subscription/SubscriptionLayout";
import Entry from "./_private/pages/Entry";
import OverDue from "./components/custom/OverDue";

function App() {
  const { user } = useUser()
  console.log(user, "user")
  return (
    <main className="h-screen w-full font-roboto">
      <Routes>
        {/* Routes with standard navigation bar inside Open layout component */}
        <Route element={<OpenLayout />}>
          <Route index path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success" element={<SuccessPayment />} />
        </Route>
        {/* legal pages */}
        <Route path="/refund-policy" element={<Refundpolicy />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/community-guideline" element={<CommunityGuideline />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/safety-policy" element={<SafetyPolicy />} />

        {/* Preview page can be accessed without authentication but without standard navigation */}
        <Route element={<SocketLayout />}>
          <Route path="/preview" element={<PreviewChat />} />
        </Route>
        {/* Private pages */}
        <Route element={<DashaboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore-community" element={<ExploreCommunity />} />
          <Route path="/my-community" element={<MyCommunity />} />
          <Route path="/createCommunity" element={<CommunityCreationForm />} />
          <Route path="/my-inventory" element={<MyInventory />} />
          {/* Wrap the routes that need the SocketProvider */}
          <Route element={<SocketLayout />}>
            <Route path="/matey/:sessionId" element={<ChatPage />} />
            <Route path="/c" element={<ChatPageNew />} />
          </Route>
          <Route path="/manage-subscription" element={<SubscriptionLayout />} />
        </Route>
        <Route path="/entry" element={<Entry />} />
        <Route path="/overdue" element={<OverDue />} />
      </Routes>

      <Toaster />

    </main>
  );
}

export default App;
