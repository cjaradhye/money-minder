 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 import { AuthProvider } from "@/hooks/useAuth";
 import { AuthPage } from "@/components/auth/AuthPage";
 import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
 import { AppLayout } from "@/components/layout/AppLayout";
 import Dashboard from "@/pages/Dashboard";
 import Transactions from "@/pages/Transactions";
 import Budgets from "@/pages/Budgets";
 import Goals from "@/pages/Goals";
 import Recurring from "@/pages/Recurring";
 import Alerts from "@/pages/Alerts";
 import Settings from "@/pages/Settings";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             {/* Public routes */}
             <Route path="/auth" element={<AuthPage />} />
             
             {/* Protected routes */}
             <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/transactions" element={<Transactions />} />
               <Route path="/budgets" element={<Budgets />} />
               <Route path="/goals" element={<Goals />} />
               <Route path="/recurring" element={<Recurring />} />
               <Route path="/alerts" element={<Alerts />} />
               <Route path="/settings" element={<Settings />} />
             </Route>
             
             {/* Redirect root to dashboard */}
             <Route path="/" element={<Navigate to="/dashboard" replace />} />
             
             {/* 404 */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
