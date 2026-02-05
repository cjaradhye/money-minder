 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { RecurringTransaction, CreateRecurringInput } from '@/types/finance';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export function useRecurringTransactions() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['recurringTransactions', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('recurring_transactions')
         .select(`
           *,
           category:categories(*)
         `)
         .eq('user_id', user.id)
         .order('next_run_date', { ascending: true });
 
       if (error) throw error;
       return data as RecurringTransaction[];
     },
     enabled: !!user
   });
 }
 
 export function useCreateRecurringTransaction() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (input: CreateRecurringInput) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('recurring_transactions')
         .insert({
           user_id: user.id,
           type: input.type,
           amount: input.amount,
           description: input.description,
           category_id: input.category_id || null,
           frequency: input.frequency,
           next_run_date: input.next_run_date
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
       toast.success('Recurring transaction created');
     },
     onError: (error) => {
       toast.error(`Failed to create recurring transaction: ${error.message}`);
     }
   });
 }
 
 export function usePauseRecurringTransaction() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ id, pause }: { id: string; pause: boolean }) => {
       const { error } = await supabase
         .from('recurring_transactions')
         .update({ is_paused: pause })
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: (_, { pause }) => {
       queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
       toast.success(pause ? 'Recurring transaction paused' : 'Recurring transaction resumed');
     },
     onError: (error) => {
       toast.error(`Failed to update recurring transaction: ${error.message}`);
     }
   });
 }
 
 export function useDeleteRecurringTransaction() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('recurring_transactions')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
       toast.success('Recurring transaction deleted');
     },
     onError: (error) => {
       toast.error(`Failed to delete recurring transaction: ${error.message}`);
     }
   });
 }