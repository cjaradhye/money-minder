 import { useState } from 'react';
 import { Plus, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { useBudgetStatuses, useCreateBudget, useDeleteBudget } from '@/hooks/useBudgets';
 import { useCategories } from '@/hooks/useCategories';
 import { useInsights } from '@/hooks/useAnalytics';
 import { InsightsCard } from '@/components/dashboard/InsightsCard';
 import { formatCurrency, getMonthName } from '@/lib/transactionParser';
 import { cn } from '@/lib/utils';
 
 export default function BudgetsPage() {
   const currentMonth = new Date().toISOString().slice(0, 7);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [newBudget, setNewBudget] = useState({ categoryId: '', limit: '' });
 
   const { data: budgetStatuses = [], isLoading } = useBudgetStatuses(currentMonth);
   const { data: categories = [] } = useCategories();
   const { data: insights = [], isLoading: insightsLoading } = useInsights(currentMonth);
   const createBudget = useCreateBudget();
   const deleteBudget = useDeleteBudget();
 
   // Filter out categories that already have budgets
   const availableCategories = categories.filter(
     cat => !budgetStatuses.some(bs => bs.budget.category_id === cat.id)
   );
 
   const handleCreate = async () => {
     if (!newBudget.categoryId || !newBudget.limit) return;
     
     await createBudget.mutateAsync({
       category_id: newBudget.categoryId,
       monthly_limit: parseFloat(newBudget.limit),
       month_year: currentMonth,
     });
     
     setNewBudget({ categoryId: '', limit: '' });
     setDialogOpen(false);
   };
 
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this budget?')) {
       await deleteBudget.mutateAsync(id);
     }
   };
 
   const totalBudget = budgetStatuses.reduce((sum, bs) => sum + Number(bs.budget.monthly_limit), 0);
   const totalSpent = budgetStatuses.reduce((sum, bs) => sum + bs.spent, 0);
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Budgets</h1>
           <p className="text-muted-foreground mt-1">
             Track your spending limits for {getMonthName(currentMonth)}
           </p>
         </div>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button size="sm" disabled={availableCategories.length === 0}>
               <Plus className="h-4 w-4 mr-1" />
               Add Budget
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Create Budget</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Category</Label>
                 <Select 
                   value={newBudget.categoryId} 
                   onValueChange={(v) => setNewBudget(prev => ({ ...prev, categoryId: v }))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select category" />
                   </SelectTrigger>
                   <SelectContent>
                     {availableCategories.map(cat => (
                       <SelectItem key={cat.id} value={cat.id}>
                         {cat.icon} {cat.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Monthly Limit (₹)</Label>
                 <Input
                   type="number"
                   placeholder="10000"
                   value={newBudget.limit}
                   onChange={(e) => setNewBudget(prev => ({ ...prev, limit: e.target.value }))}
                 />
               </div>
               <Button 
                 onClick={handleCreate} 
                 className="w-full"
                 disabled={!newBudget.categoryId || !newBudget.limit || createBudget.isPending}
               >
                 {createBudget.isPending ? 'Creating...' : 'Create Budget'}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Summary */}
       <Card>
         <CardContent className="pt-6">
           <div className="flex items-center justify-between mb-4">
             <div>
               <p className="text-sm text-muted-foreground">Total Monthly Budget</p>
               <p className="font-display text-2xl font-bold">{formatCurrency(totalBudget)}</p>
             </div>
             <div className="text-right">
               <p className="text-sm text-muted-foreground">Spent so far</p>
               <p className="font-display text-2xl font-bold">{formatCurrency(totalSpent)}</p>
             </div>
           </div>
           <Progress 
             value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} 
             className="h-3"
           />
           <p className="text-sm text-muted-foreground mt-2">
             {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining this month
           </p>
         </CardContent>
       </Card>
 
       {/* Budgets Grid */}
       {isLoading ? (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
           ))}
         </div>
       ) : budgetStatuses.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <p className="text-muted-foreground mb-4">No budgets set for this month</p>
             <Button onClick={() => setDialogOpen(true)}>
               <Plus className="h-4 w-4 mr-1" />
               Create your first budget
             </Button>
           </CardContent>
         </Card>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {budgetStatuses.map((item) => (
             <Card key={item.budget.id} className="group relative overflow-hidden">
               <div 
                 className="absolute inset-x-0 top-0 h-1"
                 style={{ backgroundColor: item.budget.category?.color || 'hsl(var(--accent))' }}
               />
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center justify-between text-lg">
                   <div className="flex items-center gap-2">
                     <span>{item.budget.category?.icon || '📦'}</span>
                     <span>{item.budget.category?.name || 'General'}</span>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={() => handleDelete(item.budget.id)}
                   >
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   <div className="flex items-end justify-between">
                     <div>
                       <p className="text-sm text-muted-foreground">Spent</p>
                       <p className="font-display text-xl font-bold">{formatCurrency(item.spent)}</p>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       of {formatCurrency(Number(item.budget.monthly_limit))}
                     </p>
                   </div>
                   <Progress 
                     value={item.percentage} 
                     className={cn(
                       'h-2',
                       item.status === 'OVERSPENT' && '[&>div]:bg-destructive',
                       item.status === 'AT_RISK' && '[&>div]:bg-warning'
                     )}
                   />
                   <p className={cn(
                     'text-sm',
                     item.status === 'OVERSPENT' ? 'text-destructive' : 
                     item.status === 'AT_RISK' ? 'text-warning' : 
                     'text-muted-foreground'
                   )}>
                     {item.status === 'OVERSPENT' 
                       ? `Over by ${formatCurrency(Math.abs(item.remaining))}`
                       : `${formatCurrency(item.remaining)} remaining`
                     }
                   </p>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       )}
 
       {/* AI Insights */}
       <InsightsCard insights={insights} loading={insightsLoading} />
     </div>
   );
 }