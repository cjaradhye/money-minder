import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateTransactionInput } from '@/types/finance';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface BulkImportResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; description: string; error: string }>;
}

export function useCSVImport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transactions: CreateTransactionInput[]): Promise<BulkImportResult> => {
      if (!user) throw new Error('Not authenticated');

      const result: BulkImportResult = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < transactions.length; i++) {
        try {
          const input = transactions[i];
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

          if (error) {
            result.failed++;
            result.errors.push({
              index: i,
              description: input.description,
              error: error.message
            });
          } else {
            result.successful++;

            // Add tags if provided
            if (input.tag_ids && input.tag_ids.length > 0) {
              const tagInserts = input.tag_ids.map(tag_id => ({
                transaction_id: data.id,
                tag_id
              }));
              await supabase.from('transaction_tags').insert(tagInserts);
            }
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            index: i,
            description: transactions[i].description,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      if (result.successful > 0) {
        toast.success(`Imported ${result.successful} transaction${result.successful !== 1 ? 's' : ''}`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} transaction${result.failed !== 1 ? 's' : ''}`);
      }
    },
    onError: (error) => {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}
