 import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Transaction } from '@/types/finance';
 import { formatCurrency, formatDate } from '@/lib/transactionParser';
 import { cn } from '@/lib/utils';
 
 interface RecentTransactionsProps {
   transactions: Transaction[];
 }
 
 export function RecentTransactions({ transactions }: RecentTransactionsProps) {
   if (transactions.length === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Recent Transactions</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground">
             No transactions yet. Add your first one with ⌘⇧U!
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="text-lg">Recent Transactions</CardTitle>
       </CardHeader>
       <CardContent className="space-y-1">
         {transactions.slice(0, 5).map((tx) => (
           <div 
             key={tx.id} 
             className="flex items-center justify-between py-2 border-b border-border last:border-0"
           >
             <div className="flex items-center gap-3">
               <div className={cn(
                 'flex items-center justify-center h-8 w-8 rounded-full',
                 tx.type === 'INCOME' ? 'bg-success/10' : 'bg-accent/10'
               )}>
                 {tx.type === 'INCOME' ? (
                   <ArrowDownLeft className="h-4 w-4 text-success" />
                 ) : (
                   <ArrowUpRight className="h-4 w-4 text-accent" />
                 )}
               </div>
               <div>
                 <p className="font-medium text-sm">{tx.description}</p>
                 <p className="text-xs text-muted-foreground">
                   {tx.category?.name || 'Uncategorized'} • {formatDate(tx.transaction_date)}
                 </p>
               </div>
             </div>
             <span className={cn(
               'font-medium',
               tx.type === 'INCOME' ? 'text-success' : 'text-foreground'
             )}>
               {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
             </span>
           </div>
         ))}
       </CardContent>
     </Card>
   );
 }