 import { Progress } from '@/components/ui/progress';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { BudgetStatus } from '@/types/finance';
 import { formatCurrency } from '@/lib/transactionParser';
 import { cn } from '@/lib/utils';
 
 interface BudgetProgressProps {
   budgets: BudgetStatus[];
 }
 
 export function BudgetProgress({ budgets }: BudgetProgressProps) {
   if (budgets.length === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Budget Progress</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground">
             No budgets set for this month. Create one to track your spending!
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="text-lg">Budget Progress</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {budgets.map((item) => (
           <div key={item.budget.id} className="space-y-2">
             <div className="flex items-center justify-between text-sm">
               <div className="flex items-center gap-2">
                 <span>{item.budget.category?.icon || '📦'}</span>
                 <span className="font-medium">{item.budget.category?.name || 'General'}</span>
               </div>
               <span className="text-muted-foreground">
                 {formatCurrency(item.spent)} / {formatCurrency(Number(item.budget.monthly_limit))}
               </span>
             </div>
             <Progress 
               value={item.percentage} 
               className={cn(
                 'h-2',
                 item.status === 'OVERSPENT' && '[&>div]:bg-destructive',
                 item.status === 'AT_RISK' && '[&>div]:bg-warning'
               )}
             />
             {item.status !== 'OK' && (
               <p className={cn(
                 'text-xs',
                 item.status === 'OVERSPENT' ? 'text-destructive' : 'text-warning'
               )}>
                 {item.status === 'OVERSPENT' 
                   ? `Over budget by ${formatCurrency(Math.abs(item.remaining))}`
                   : `${item.remaining > 0 ? formatCurrency(item.remaining) : 0} remaining`
                 }
               </p>
             )}
           </div>
         ))}
       </CardContent>
     </Card>
   );
 }