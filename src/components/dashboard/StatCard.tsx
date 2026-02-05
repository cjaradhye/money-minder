 import { LucideIcon } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { cn } from '@/lib/utils';
 
 interface StatCardProps {
   title: string;
   value: string;
   subtitle?: string;
   icon: LucideIcon;
   trend?: { value: number; positive: boolean };
   variant?: 'default' | 'accent' | 'success' | 'warning';
 }
 
 export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
   const variantStyles = {
     default: 'bg-card',
     accent: 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20',
     success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
     warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
   };
 
   const iconStyles = {
     default: 'bg-muted text-muted-foreground',
     accent: 'bg-accent/20 text-accent',
     success: 'bg-success/20 text-success',
     warning: 'bg-warning/20 text-warning',
   };
 
   return (
     <Card className={cn('overflow-hidden transition-all hover:shadow-md', variantStyles[variant])}>
       <CardContent className="p-6">
         <div className="flex items-start justify-between">
           <div className="space-y-1">
             <p className="text-sm font-medium text-muted-foreground">{title}</p>
             <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
             {subtitle && (
               <p className="text-xs text-muted-foreground">{subtitle}</p>
             )}
             {trend && (
               <p className={cn(
                 'text-xs font-medium',
                 trend.positive ? 'text-success' : 'text-destructive'
               )}>
                 {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
               </p>
             )}
           </div>
           <div className={cn('rounded-lg p-2.5', iconStyles[variant])}>
             <Icon className="h-5 w-5" />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }