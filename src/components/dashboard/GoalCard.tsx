 import { Target } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { GoalProgress } from '@/types/finance';
 import { formatCurrency } from '@/lib/transactionParser';
 
 interface GoalCardProps {
   goalProgress: GoalProgress;
 }
 
 export function GoalCard({ goalProgress }: GoalCardProps) {
   const { goal, percentage, daysRemaining, requiredPace } = goalProgress;
 
   return (
     <Card className="overflow-hidden">
       <div 
         className="h-1" 
         style={{ backgroundColor: goal.color || 'hsl(var(--accent))' }}
       />
       <CardContent className="p-4">
         <div className="flex items-start justify-between mb-3">
           <div className="flex items-center gap-2">
             <span className="text-xl">{goal.icon || '🎯'}</span>
             <div>
               <h4 className="font-medium">{goal.name}</h4>
               <p className="text-xs text-muted-foreground">
                 {formatCurrency(Number(goal.current_amount))} of {formatCurrency(Number(goal.target_amount))}
               </p>
             </div>
           </div>
           <span className="font-display text-lg font-bold" style={{ color: goal.color || 'hsl(var(--accent))' }}>
             {percentage.toFixed(0)}%
           </span>
         </div>
         
         <Progress 
           value={percentage} 
           className="h-2 mb-2"
           style={{ '--progress-color': goal.color || 'hsl(var(--accent))' } as React.CSSProperties}
         />
         
         <div className="flex items-center justify-between text-xs text-muted-foreground">
           {daysRemaining !== null ? (
             <span>{daysRemaining} days left</span>
           ) : (
             <span>No target date</span>
           )}
           {requiredPace !== null && (
             <span>{formatCurrency(requiredPace)}/month to reach goal</span>
           )}
         </div>
       </CardContent>
     </Card>
   );
 }