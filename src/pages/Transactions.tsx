 import { useState } from 'react';
 import { Plus, Search, Filter, ArrowDownLeft, ArrowUpRight, Trash2, Upload, Pencil } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { useTransactions, useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
 import { useCategories } from '@/hooks/useCategories';
 import { useInsights } from '@/hooks/useAnalytics';
 import { InsightsCard } from '@/components/dashboard/InsightsCard';
 import { ImportCSVModal } from '@/components/transactions/ImportCSVModal';
 import { formatCurrency, formatDate } from '@/lib/transactionParser';
 import { cn } from '@/lib/utils';
 import { Transaction } from '@/types/finance';
 
 export default function TransactionsPage() {
   const [search, setSearch] = useState('');
   const [typeFilter, setTypeFilter] = useState<string>('all');
   const [categoryFilter, setCategoryFilter] = useState<string>('all');
   const [editOpen, setEditOpen] = useState(false);
   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
   const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
   const [editForm, setEditForm] = useState({
     description: '',
     amount: '',
     categoryId: ''
   });
   
   const { data: transactions = [], isLoading } = useTransactions({
     search: search || undefined,
     type: typeFilter !== 'all' ? (typeFilter as 'EXPENSE' | 'INCOME') : undefined,
     categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
   });
   const { data: categories = [] } = useCategories();
   const { data: insights = [], isLoading: insightsLoading } = useInsights();
   const deleteTransaction = useDeleteTransaction();
   const updateTransaction = useUpdateTransaction();
 
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this transaction?')) {
       await deleteTransaction.mutateAsync(id);
     }
   };

   const openEditDialog = (transaction: Transaction) => {
     setEditingTransactionId(transaction.id);
     setEditForm({
       description: transaction.description,
       amount: String(transaction.amount),
       categoryId: transaction.category_id || ''
     });
     setEditOpen(true);
   };

   const handleSaveEdit = async () => {
     if (!editingTransactionId) return;

     const parsedAmount = Number.parseFloat(editForm.amount);
     if (!editForm.description.trim() || Number.isNaN(parsedAmount)) return;

     await updateTransaction.mutateAsync({
       id: editingTransactionId,
       description: editForm.description.trim(),
       amount: parsedAmount,
       category_id: editForm.categoryId || undefined
     });

     setEditOpen(false);
     setEditingTransactionId(null);
   };
 
   // Group transactions by date
   const groupedTransactions = transactions.reduce((groups, tx) => {
     const date = tx.transaction_date;
     if (!groups[date]) groups[date] = [];
     groups[date].push(tx);
     return groups;
   }, {} as Record<string, Transaction[]>);
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Transactions</h1>
           <p className="text-muted-foreground mt-1">
             Manage your income and expenses
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
             <Upload className="h-4 w-4 mr-1" />
             Import CSV
           </Button>
           <Button size="sm" onClick={() => {
             document.dispatchEvent(new KeyboardEvent('keydown', { 
               key: 'u', 
               metaKey: true, 
               shiftKey: true 
             }));
           }}>
             <Plus className="h-4 w-4 mr-1" />
             Add
           </Button>
         </div>
       </div>
 
       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search transactions..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="pl-9"
           />
         </div>
         <Select value={typeFilter} onValueChange={setTypeFilter}>
           <SelectTrigger className="w-[140px]">
             <Filter className="h-4 w-4 mr-2" />
             <SelectValue placeholder="Type" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Types</SelectItem>
             <SelectItem value="EXPENSE">Expenses</SelectItem>
             <SelectItem value="INCOME">Income</SelectItem>
           </SelectContent>
         </Select>
         <Select value={categoryFilter} onValueChange={setCategoryFilter}>
           <SelectTrigger className="w-[160px]">
             <SelectValue placeholder="Category" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Categories</SelectItem>
             {categories.map((cat) => (
               <SelectItem key={cat.id} value={cat.id}>
                 {cat.icon} {cat.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       {/* Transactions List */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center justify-between">
             <span>All Transactions</span>
             <Badge variant="secondary">{transactions.length} total</Badge>
           </CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="space-y-3">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="h-16 animate-pulse rounded bg-muted" />
               ))}
             </div>
           ) : transactions.length === 0 ? (
             <div className="py-12 text-center">
               <p className="text-muted-foreground mb-4">No transactions found</p>
               <Button onClick={() => {
                 document.dispatchEvent(new KeyboardEvent('keydown', { 
                   key: 'u', 
                   metaKey: true, 
                   shiftKey: true 
                 }));
               }}>
                 <Plus className="h-4 w-4 mr-1" />
                 Add your first transaction
               </Button>
             </div>
           ) : (
             <div className="space-y-6">
               {Object.entries(groupedTransactions).map(([date, txs]) => (
                 <div key={date}>
                   <h4 className="text-sm font-medium text-muted-foreground mb-2">
                     {formatDate(date)}
                   </h4>
                   <div className="space-y-1">
                     {txs.map((tx) => (
                       <div 
                         key={tx.id}
                         className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                       >
                         <div className="flex items-center gap-3">
                           <div className={cn(
                             'flex items-center justify-center h-10 w-10 rounded-full',
                             tx.type === 'INCOME' ? 'bg-success/10' : 'bg-accent/10'
                           )}>
                             {tx.type === 'INCOME' ? (
                               <ArrowDownLeft className="h-5 w-5 text-success" />
                             ) : (
                               <ArrowUpRight className="h-5 w-5 text-accent" />
                             )}
                           </div>
                           <div>
                             <p className="font-medium">{tx.description}</p>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                               <span>{tx.category?.icon} {tx.category?.name || 'Uncategorized'}</span>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className={cn(
                             'font-display text-lg font-semibold',
                             tx.type === 'INCOME' ? 'text-success' : ''
                           )}>
                             {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                           </span>
                          <Button
                             variant="ghost"
                             size="icon"
                             className="opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => openEditDialog(tx)}
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => handleDelete(tx.id)}
                           >
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Name</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Transaction name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.categoryId || '__none__'}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, categoryId: value === '__none__' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Uncategorized</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleSaveEdit}
              disabled={
                updateTransaction.isPending ||
                !editForm.description.trim() ||
                !editForm.amount ||
                Number.isNaN(Number.parseFloat(editForm.amount))
              }
            >
              {updateTransaction.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights */}
      <InsightsCard insights={insights} loading={insightsLoading} />
     </div>
   );
 }
