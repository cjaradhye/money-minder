 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Budget, CreateBudgetInput, BudgetStatus } from '@/types/finance';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export function useBudgets(monthYear?: string) {
   const { user } = useAuth();
   const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
 
   return useQuery({
     queryKey: ['budgets', user?.id, currentMonth],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('budgets')
         .select(`
           *,
           category:categories(*)
         `)
         .eq('user_id', user.id)
         .eq('month_year', currentMonth);
 
       if (error) throw error;
       return data as Budget[];
     },
     enabled: !!user
   });
 }
 
 export function useBudgetStatuses(monthYear?: string) {
   const { user } = useAuth();
   const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
 
   return useQuery({
     queryKey: ['budgetStatuses', user?.id, currentMonth],
     queryFn: async (): Promise<BudgetStatus[]> => {
       if (!user) return [];
 
       // Get budgets for the month
       const { data: budgets, error: budgetsError } = await supabase
         .from('budgets')
         .select(`
           *,
           category:categories(*)
         `)
         .eq('user_id', user.id)
         .eq('month_year', currentMonth);
 
       if (budgetsError) throw budgetsError;
 
       // Get transactions for the month
       const startDate = `${currentMonth}-01`;
       const endDate = new Date(parseInt(currentMonth.slice(0, 4)), parseInt(currentMonth.slice(5, 7)), 0)
         .toISOString().slice(0, 10);
 
       const { data: transactions, error: txError } = await supabase
         .from('transactions')
         .select('category_id, amount')
         .eq('user_id', user.id)
         .eq('type', 'EXPENSE')
         .gte('transaction_date', startDate)
         .lte('transaction_date', endDate);
 
       if (txError) throw txError;
 
       // Calculate spent per category
       const spentByCategory: Record<string, number> = {};
       transactions?.forEach(tx => {
         if (tx.category_id) {
           spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Number(tx.amount);
         }
       });
 
       // Build budget statuses
       return (budgets || []).map(budget => {
         const spent = budget.category_id ? spentByCategory[budget.category_id] || 0 : 0;
         const limit = Number(budget.monthly_limit);
         const remaining = limit - spent;
         const percentage = (spent / limit) * 100;
         
         let status: 'OK' | 'AT_RISK' | 'OVERSPENT' = 'OK';
         if (spent > limit) {
           status = 'OVERSPENT';
         } else if (percentage >= 90) {
           status = 'AT_RISK';
         }
 
         return {
           budget: budget as Budget,
           spent,
           remaining,
           percentage: Math.min(percentage, 100),
           status
         };
       });
     },
     enabled: !!user
   });
 }
 
 export function useCreateBudget() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (input: CreateBudgetInput) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('budgets')
         .insert({
           user_id: user.id,
           category_id: input.category_id,
           monthly_limit: input.monthly_limit,
           month_year: input.month_year
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['budgets'] });
       queryClient.invalidateQueries({ queryKey: ['budgetStatuses'] });
       toast.success('Budget created');
     },
     onError: (error) => {
       toast.error(`Failed to create budget: ${error.message}`);
     }
   });
 }
 
 export function useDeleteBudget() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('budgets')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['budgets'] });
       queryClient.invalidateQueries({ queryKey: ['budgetStatuses'] });
       toast.success('Budget deleted');
     },
     onError: (error) => {
       toast.error(`Failed to delete budget: ${error.message}`);
     }
   });
 }