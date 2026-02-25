 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Transaction, CreateTransactionInput } from '@/types/finance';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';

 export interface UpdateTransactionInput {
   id: string;
   amount: number;
   description: string;
   category_id?: string;
 }
 
 export function useTransactions(filters?: {
   startDate?: string;
   endDate?: string;
   type?: 'EXPENSE' | 'INCOME';
   categoryId?: string;
   search?: string;
 }) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['transactions', user?.id, filters],
     queryFn: async () => {
       if (!user) return [];
 
       let query = supabase
         .from('transactions')
         .select(`
           *,
           category:categories(*)
         `)
         .eq('user_id', user.id)
         .order('transaction_date', { ascending: false });
 
       if (filters?.startDate) {
         query = query.gte('transaction_date', filters.startDate);
       }
       if (filters?.endDate) {
         query = query.lte('transaction_date', filters.endDate);
       }
       if (filters?.type) {
         query = query.eq('type', filters.type);
       }
       if (filters?.categoryId) {
         query = query.eq('category_id', filters.categoryId);
       }
       if (filters?.search) {
         query = query.ilike('description', `%${filters.search}%`);
       }
 
       const { data, error } = await query;
       if (error) throw error;
       return data as Transaction[];
     },
     enabled: !!user
   });
 }
 
 export function useCreateTransaction() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (input: CreateTransactionInput) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('transactions')
         .insert({
           user_id: user.id,
           type: input.type,
           amount: input.amount,
           description: input.description,
           transaction_date: input.transaction_date,
           category_id: input.category_id || null,
           notes: input.notes || null
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Add tags if provided
       if (input.tag_ids && input.tag_ids.length > 0) {
         const tagInserts = input.tag_ids.map(tag_id => ({
           transaction_id: data.id,
           tag_id
         }));
         await supabase.from('transaction_tags').insert(tagInserts);
       }
 
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
       queryClient.invalidateQueries({ queryKey: ['analytics'] });
       queryClient.invalidateQueries({ queryKey: ['budgets'] });
       toast.success('Transaction added successfully');
     },
     onError: (error) => {
       toast.error(`Failed to add transaction: ${error.message}`);
     }
   });
 }
 
 export function useDeleteTransaction() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('transactions')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
       queryClient.invalidateQueries({ queryKey: ['analytics'] });
       queryClient.invalidateQueries({ queryKey: ['budgets'] });
       toast.success('Transaction deleted');
     },
     onError: (error) => {
       toast.error(`Failed to delete transaction: ${error.message}`);
     }
   });
 }

 export function useUpdateTransaction() {
   const queryClient = useQueryClient();

   return useMutation({
     mutationFn: async (input: UpdateTransactionInput) => {
       const { data, error } = await supabase
         .from('transactions')
         .update({
           amount: input.amount,
           description: input.description,
           category_id: input.category_id || null
         })
         .eq('id', input.id)
         .select()
         .single();

       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['transactions'] });
       queryClient.invalidateQueries({ queryKey: ['analytics'] });
       queryClient.invalidateQueries({ queryKey: ['budgets'] });
       toast.success('Transaction updated');
     },
     onError: (error) => {
       toast.error(`Failed to update transaction: ${error.message}`);
     }
   });
 }
