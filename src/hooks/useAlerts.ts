 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Alert } from '@/types/finance';
 import { useAuth } from './useAuth';
 
 export function useAlerts() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['alerts', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('alerts')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false })
         .limit(50);
 
       if (error) throw error;
       return data as Alert[];
     },
     enabled: !!user
   });
 }
 
 export function useUnreadAlertCount() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['unreadAlertCount', user?.id],
     queryFn: async () => {
       if (!user) return 0;
 
       const { count, error } = await supabase
         .from('alerts')
         .select('*', { count: 'exact', head: true })
         .eq('user_id', user.id)
         .eq('is_read', false);
 
       if (error) throw error;
       return count || 0;
     },
     enabled: !!user
   });
 }
 
 export function useMarkAlertsRead() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (alertIds?: string[]) => {
       if (!user) throw new Error('Not authenticated');
 
       let query = supabase
         .from('alerts')
         .update({ is_read: true })
         .eq('user_id', user.id);
 
       if (alertIds && alertIds.length > 0) {
         query = query.in('id', alertIds);
       }
 
       const { error } = await query;
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['alerts'] });
       queryClient.invalidateQueries({ queryKey: ['unreadAlertCount'] });
     }
   });
 }