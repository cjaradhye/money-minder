 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { Loader2 } from 'lucide-react';
 
 interface ProtectedRouteProps {
   children: React.ReactNode;
 }
 
 export function ProtectedRoute({ children }: ProtectedRouteProps) {
   const { user, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
           <img src="/logo.svg" alt="Quell" className="h-12 w-12 animate-pulse" />
           <Loader2 className="h-6 w-6 animate-spin text-accent" />
         </div>
       </div>
     );
   }
 
   if (!user) {
     return <Navigate to="/auth" replace />;
   }
 
   return <>{children}</>;
 }