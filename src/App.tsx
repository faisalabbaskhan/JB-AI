import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { HomePage } from "./HomePage";
import { PricingPage } from "./PricingPage";
import { ApiPage } from "./ApiPage";
import { ReviewsPage } from "./ReviewsPage";
import { DashboardLayout, OverviewPage } from "./DashboardLayout";
import { AiToolPage } from "./AiToolPage";
import { SettingsPage, BillingPage, AdminPage } from "./DashboardSettings";
import { VideoGenPage } from "./VideoGenPage";
import { MusicGenPage } from "./MusicGenPage";
import { ChatPage } from "./ChatPage";
import { VoiceChatPage } from "./VoiceChatPage";
import { MediaAnalysisPage } from "./MediaAnalysisPage";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col font-sans text-slate-100 overflow-hidden bg-[#0B1120] selection:bg-indigo-500/30">
        <Header />
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative w-full h-full scrollbar-hide">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/api-docs" element={<ApiPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="generator" element={<AiToolPage toolId="generator" title="AI Image Generator" requireImage={false} />} />
              <Route path="video-gen" element={<VideoGenPage />} />
              <Route path="video-animate" element={<VideoGenPage animateMode={true} />} />
              <Route path="music-gen" element={<MusicGenPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="voice-chat" element={<VoiceChatPage />} />
              <Route path="analyze-media" element={<MediaAnalysisPage />} />
              <Route path="background-remover" element={<AiToolPage toolId="background-remover" title="AI Background Remover" />} />
              <Route path="enhancer" element={<AiToolPage toolId="enhancer" title="AI Image Enhancer" />} />
              <Route path="upscaler" element={<AiToolPage toolId="upscaler" title="AI Upscaler" />} />
              <Route path="object-remover" element={<AiToolPage toolId="object-remover" title="AI Object Remover" />} />
              <Route path="restoration" element={<AiToolPage toolId="restoration" title="AI Photo Restoration" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <AuthModal />
        <Toaster position="top-center" richColors theme="system" />
      </div>
    </BrowserRouter>
  );
}

export default App;
