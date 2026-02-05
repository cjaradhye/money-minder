 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Category } from '@/types/finance';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export function useCategories() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['categories', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('categories')
         .select('*')
         .eq('user_id', user.id)
         .order('name');
 
       if (error) throw error;
       return data as Category[];
     },
     enabled: !!user
   });
 }
 
 export function useCreateCategory() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (input: { name: string; icon?: string; color?: string; parent_id?: string }) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('categories')
         .insert({
           user_id: user.id,
           name: input.name,
           icon: input.icon || null,
           color: input.color || null,
           parent_id: input.parent_id || null
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['categories'] });
       toast.success('Category created');
     },
     onError: (error) => {
       toast.error(`Failed to create category: ${error.message}`);
     }
   });
 }
 
 export function useDeleteCategory() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('categories')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['categories'] });
       toast.success('Category deleted');
     },
     onError: (error) => {
       toast.error(`Failed to delete category: ${error.message}`);
     }
   });
 }