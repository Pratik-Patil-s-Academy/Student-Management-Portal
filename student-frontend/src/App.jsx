
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import { MessageLoading } from "./components/ui/message-loading";

const InquiryForm = lazy(() => import("./pages/InquiryForm.jsx"));
const AdmissionForm = lazy(() => import("./pages/AdmissionForm.jsx"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex justify-center items-center h-screen"><MessageLoading /></div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/old-home" element={<Index />} />
              <Route path="/enquiry" element={<InquiryForm />} />
              <Route path="/admission" element={<AdmissionForm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
