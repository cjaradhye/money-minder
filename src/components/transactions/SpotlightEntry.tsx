 import { useState, useEffect, useCallback } from 'react';
 import { Command } from 'lucide-react';
 import { Dialog, DialogContent } from '@/components/ui/dialog';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { parseTransactionInput, formatCurrency } from '@/lib/transactionParser';
 import { useCategories } from '@/hooks/useCategories';
 import { useCreateTransaction } from '@/hooks/useTransactions';
 import { useAuth } from '@/hooks/useAuth';
 import { Badge } from '@/components/ui/badge';
 
 export function SpotlightEntry() {
   const [open, setOpen] = useState(false);
   const [input, setInput] = useState('');
   const [error, setError] = useState<string | null>(null);
   const { user } = useAuth();
   const { data: categories = [] } = useCategories();
   const createTransaction = useCreateTransaction();
 
   // Keyboard shortcut: Cmd+Shift+U
   const handleKeyDown = useCallback((e: KeyboardEvent) => {
     if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'u') {
       e.preventDefault();
       if (user) {
         setOpen(true);
       }
     }
   }, [user]);
 
   useEffect(() => {
     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
   }, [handleKeyDown]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);
 
     const result = parseTransactionInput(input, categories, []);
     
     if (!result.success || !result.data) {
       setError(result.error || 'Failed to parse input');
       return;
     }
 
     try {
       await createTransaction.mutateAsync({
         type: result.data.type,
         amount: result.data.amount,
         description: result.data.description,
         transaction_date: result.data.transaction_date,
         category_id: result.data.category_id,
         tag_ids: result.data.tag_ids
       });
       setInput('');
       setOpen(false);
     } catch {
       setError('Failed to create transaction');
     }
   };
 
   // Parse for preview
   const preview = input ? parseTransactionInput(input, categories, []) : null;
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogContent className="sm:max-w-lg p-0 gap-0">
         <form onSubmit={handleSubmit}>
           <div className="p-4 border-b border-border">
             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
               <Command className="h-4 w-4" />
               <span>Quick Add Transaction</span>
               <Badge variant="outline" className="ml-auto text-xs">⌘⇧U</Badge>
             </div>
             <Input
               value={input}
               onChange={(e) => {
                 setInput(e.target.value);
                 setError(null);
               }}
               placeholder="Coffee 50 today @Food #office"
               className="text-lg border-0 shadow-none focus-visible:ring-0 px-0"
               autoFocus
             />
           </div>
 
           {/* Preview */}
           {preview?.success && preview.data && (
             <div className="p-4 bg-muted/50 space-y-2">
               <div className="flex items-center justify-between">
                 <span className="font-medium">{preview.data.description}</span>
                 <span className={`font-display text-lg font-bold ${
                   preview.data.type === 'INCOME' ? 'text-success' : 'text-accent'
                 }`}>
                   {preview.data.type === 'INCOME' ? '+' : '-'}{formatCurrency(preview.data.amount)}
                 </span>
               </div>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span>{preview.data.transaction_date}</span>
                 {preview.data.categoryName && (
                   <Badge variant="secondary">@{preview.data.categoryName}</Badge>
                 )}
                 {preview.data.tagNames?.map(tag => (
                   <Badge key={tag} variant="outline">#{tag}</Badge>
                 ))}
               </div>
             </div>
           )}
 
           {/* Error */}
           {error && (
             <div className="p-4 bg-destructive/10 text-destructive text-sm">
               {error}
             </div>
           )}
 
           {/* Actions */}
           <div className="p-4 flex items-center justify-between">
             <div className="text-xs text-muted-foreground">
               Format: description amount [date] [@category] [#tags]
             </div>
             <Button 
               type="submit" 
               disabled={!preview?.success || createTransaction.isPending}
               className="bg-accent hover:bg-accent/90"
             >
               {createTransaction.isPending ? 'Adding...' : 'Add'}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }