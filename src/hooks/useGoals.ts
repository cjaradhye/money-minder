 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Goal, CreateGoalInput, GoalProgress } from '@/types/finance';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export function useGoals() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['goals', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('goals')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as Goal[];
     },
     enabled: !!user
   });
 }
 
 export function useGoalProgress() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['goalProgress', user?.id],
     queryFn: async (): Promise<GoalProgress[]> => {
       if (!user) return [];
 
       const { data: goals, error } = await supabase
         .from('goals')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
 
       return (goals || []).map(goal => {
         const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
         
         let daysRemaining: number | null = null;
         let requiredPace: number | null = null;
         
         if (goal.target_date) {
           const targetDate = new Date(goal.target_date);
           const today = new Date();
           daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
           
           const remaining = Number(goal.target_amount) - Number(goal.current_amount);
           if (daysRemaining > 0 && remaining > 0) {
             // Monthly pace (assuming 30 days per month)
             requiredPace = (remaining / daysRemaining) * 30;
           }
         }
 
         return {
           goal: goal as Goal,
           percentage: Math.min(percentage, 100),
           daysRemaining,
           requiredPace
         };
       });
     },
     enabled: !!user
   });
 }
 
 export function useCreateGoal() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (input: CreateGoalInput) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('goals')
         .insert({
           user_id: user.id,
           name: input.name,
           target_amount: input.target_amount,
           target_date: input.target_date || null,
           icon: input.icon || null,
           color: input.color || null
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['goals'] });
       queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
       toast.success('Goal created');
     },
     onError: (error) => {
       toast.error(`Failed to create goal: ${error.message}`);
     }
   });
 }
 
 export function useContributeToGoal() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
       const { data, error } = await supabase
         .from('goal_contributions')
         .insert({
           goal_id: goalId,
           amount
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['goals'] });
       queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
       toast.success('Contribution added');
     },
     onError: (error) => {
       toast.error(`Failed to add contribution: ${error.message}`);
     }
   });
 }
 
 export function useDeleteGoal() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('goals')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['goals'] });
       queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
       toast.success('Goal deleted');
     },
     onError: (error) => {
       toast.error(`Failed to delete goal: ${error.message}`);
     }
   });
 }