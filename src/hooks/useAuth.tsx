 import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
 import { User, Session } from '@supabase/supabase-js';
 import { supabase } from '@/integrations/supabase/client';
 import { Profile } from '@/types/finance';
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   profile: Profile | null;
   loading: boolean;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
   signInWithGoogle: () => Promise<{ error: Error | null }>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [profile, setProfile] = useState<Profile | null>(null);
   const [loading, setLoading] = useState(true);
 
   // Fetch user profile
   const fetchProfile = async (userId: string) => {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .eq('user_id', userId)
       .single();
     
     if (!error && data) {
       setProfile(data as Profile);
     }
   };
 
   useEffect(() => {
     // Get initial session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       if (session?.user) {
         fetchProfile(session.user.id);
       }
       setLoading(false);
     });
 
     // Listen for auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (_event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
         if (session?.user) {
           fetchProfile(session.user.id);
         } else {
           setProfile(null);
         }
         setLoading(false);
       }
     );
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error: error as Error | null };
   };
 
   const signUp = async (email: string, password: string, name: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { name }
       }
     });
     return { error: error as Error | null };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
     setProfile(null);
   };
 
   const signInWithGoogle = async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: window.location.origin
       }
     });
     return { error: error as Error | null };
   };
 
   return (
     <AuthContext.Provider value={{
       user,
       session,
       profile,
       loading,
       signIn,
       signUp,
       signOut,
       signInWithGoogle
     }}>
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }