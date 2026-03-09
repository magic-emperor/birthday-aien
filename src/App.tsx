import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MusicPage from "./pages/MusicPage";
import ChatViewerPage from "./pages/ChatViewerPage";
import DreamBoardPage from "./pages/DreamBoardPage";
import MemoryCapsulePage from "./pages/MemoryCapsulePage";
import QuizPage from "./pages/QuizPage";
import SecretVaultPage from "./pages/SecretVaultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/our-chats" element={<ChatViewerPage />} />
          <Route path="/dreams" element={<DreamBoardPage />} />
          <Route path="/capsule" element={<MemoryCapsulePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/secret-vault" element={<SecretVaultPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
