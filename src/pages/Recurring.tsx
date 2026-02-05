 import { useState } from 'react';
 import { Plus, Trash2, Pause, Play, SkipForward, RefreshCw } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { 
   useRecurringTransactions, 
   useCreateRecurringTransaction, 
   usePauseRecurringTransaction,
   useDeleteRecurringTransaction 
 } from '@/hooks/useRecurringTransactions';
 import { useCategories } from '@/hooks/useCategories';
 import { formatCurrency, formatDate } from '@/lib/transactionParser';
 import { Frequency, TransactionType } from '@/types/finance';
 import { cn } from '@/lib/utils';
 
 export default function RecurringPage() {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [newRecurring, setNewRecurring] = useState({
     type: 'EXPENSE' as TransactionType,
     description: '',
     amount: '',
     categoryId: '',
     frequency: 'MONTHLY' as Frequency,
     nextDate: new Date().toISOString().slice(0, 10),
   });
 
   const { data: recurring = [], isLoading } = useRecurringTransactions();
   const { data: categories = [] } = useCategories();
   const createRecurring = useCreateRecurringTransaction();
   const pauseRecurring = usePauseRecurringTransaction();
   const deleteRecurring = useDeleteRecurringTransaction();
 
   const handleCreate = async () => {
     if (!newRecurring.description || !newRecurring.amount) return;
     
     await createRecurring.mutateAsync({
       type: newRecurring.type,
       description: newRecurring.description,
       amount: parseFloat(newRecurring.amount),
       category_id: newRecurring.categoryId || undefined,
       frequency: newRecurring.frequency,
       next_run_date: newRecurring.nextDate,
     });
     
     setNewRecurring({
       type: 'EXPENSE',
       description: '',
       amount: '',
       categoryId: '',
       frequency: 'MONTHLY',
       nextDate: new Date().toISOString().slice(0, 10),
     });
     setDialogOpen(false);
   };
 
   const handlePause = async (id: string, currentlyPaused: boolean) => {
     await pauseRecurring.mutateAsync({ id, pause: !currentlyPaused });
   };
 
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this recurring transaction?')) {
       await deleteRecurring.mutateAsync(id);
     }
   };
 
   const frequencyLabel = (freq: Frequency) => {
     switch (freq) {
       case 'DAILY': return 'Daily';
       case 'WEEKLY': return 'Weekly';
       case 'MONTHLY': return 'Monthly';
     }
   };
 
   const activeCount = recurring.filter(r => !r.is_paused).length;
   const monthlyTotal = recurring
     .filter(r => !r.is_paused)
     .reduce((sum, r) => {
       const amount = Number(r.amount);
       const multiplier = r.frequency === 'DAILY' ? 30 : r.frequency === 'WEEKLY' ? 4 : 1;
       return sum + (r.type === 'EXPENSE' ? amount * multiplier : 0);
     }, 0);
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Recurring Transactions</h1>
           <p className="text-muted-foreground mt-1">
             Manage your subscriptions and regular payments
           </p>
         </div>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button size="sm">
               <Plus className="h-4 w-4 mr-1" />
               Add Recurring
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Create Recurring Transaction</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Type</Label>
                 <Select 
                   value={newRecurring.type} 
                   onValueChange={(v) => setNewRecurring(prev => ({ ...prev, type: v as TransactionType }))}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="EXPENSE">Expense</SelectItem>
                     <SelectItem value="INCOME">Income</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Description</Label>
                 <Input
                   placeholder="Spotify subscription"
                   value={newRecurring.description}
                   onChange={(e) => setNewRecurring(prev => ({ ...prev, description: e.target.value }))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Amount (₹)</Label>
                 <Input
                   type="number"
                   placeholder="799"
                   value={newRecurring.amount}
                   onChange={(e) => setNewRecurring(prev => ({ ...prev, amount: e.target.value }))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Category</Label>
                 <Select 
                   value={newRecurring.categoryId} 
                   onValueChange={(v) => setNewRecurring(prev => ({ ...prev, categoryId: v }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select category" />
                   </SelectTrigger>
                   <SelectContent>
                     {categories.map(cat => (
                       <SelectItem key={cat.id} value={cat.id}>
                         {cat.icon} {cat.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Frequency</Label>
                 <Select 
                   value={newRecurring.frequency} 
                   onValueChange={(v) => setNewRecurring(prev => ({ ...prev, frequency: v as Frequency }))}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="DAILY">Daily</SelectItem>
                     <SelectItem value="WEEKLY">Weekly</SelectItem>
                     <SelectItem value="MONTHLY">Monthly</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Next Run Date</Label>
                 <Input
                   type="date"
                   value={newRecurring.nextDate}
                   onChange={(e) => setNewRecurring(prev => ({ ...prev, nextDate: e.target.value }))}
                 />
               </div>
               <Button 
                 onClick={handleCreate} 
                 className="w-full"
                 disabled={!newRecurring.description || !newRecurring.amount || createRecurring.isPending}
               >
                 {createRecurring.isPending ? 'Creating...' : 'Create'}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Summary */}
       <div className="grid gap-4 sm:grid-cols-2">
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                 <RefreshCw className="h-5 w-5 text-accent" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Active Recurring</p>
                 <p className="font-display text-2xl font-bold">{activeCount} / {recurring.length}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                 <RefreshCw className="h-5 w-5 text-warning" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Est. Monthly Outflow</p>
                 <p className="font-display text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Recurring List */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">All Recurring Transactions</CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="space-y-3">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-20 animate-pulse rounded bg-muted" />
               ))}
             </div>
           ) : recurring.length === 0 ? (
             <div className="py-12 text-center">
               <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
               <p className="text-muted-foreground mb-4">No recurring transactions</p>
               <Button onClick={() => setDialogOpen(true)}>
                 <Plus className="h-4 w-4 mr-1" />
                 Add your first recurring transaction
               </Button>
             </div>
           ) : (
             <div className="space-y-3">
               {recurring.map((item) => (
                 <div 
                   key={item.id}
                   className={cn(
                     'flex items-center justify-between p-4 rounded-lg border transition-all',
                     item.is_paused ? 'bg-muted/50 opacity-60' : 'bg-card'
                   )}
                 >
                   <div className="flex items-center gap-4">
                     <div className={cn(
                       'h-10 w-10 rounded-full flex items-center justify-center',
                       item.type === 'INCOME' ? 'bg-success/10' : 'bg-accent/10'
                     )}>
                       <RefreshCw className={cn(
                         'h-5 w-5',
                         item.type === 'INCOME' ? 'text-success' : 'text-accent'
                       )} />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <p className="font-medium">{item.description}</p>
                         {item.is_paused && <Badge variant="secondary">Paused</Badge>}
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <span>{item.category?.icon} {item.category?.name || 'Uncategorized'}</span>
                         <span>•</span>
                         <span>{frequencyLabel(item.frequency as Frequency)}</span>
                         <span>•</span>
                         <span>Next: {formatDate(item.next_run_date)}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className={cn(
                       'font-display text-lg font-semibold',
                       item.type === 'INCOME' ? 'text-success' : ''
                     )}>
                       {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(item.amount))}
                     </span>
                     <div className="flex items-center gap-1">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8"
                         onClick={() => handlePause(item.id, item.is_paused)}
                         title={item.is_paused ? 'Resume' : 'Pause'}
                       >
                         {item.is_paused ? (
                           <Play className="h-4 w-4 text-success" />
                         ) : (
                           <Pause className="h-4 w-4 text-warning" />
                         )}
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8"
                         onClick={() => handleDelete(item.id)}
                       >
                         <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }