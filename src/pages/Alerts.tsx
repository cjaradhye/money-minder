 import { Bell, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useAlerts, useMarkAlertsRead } from '@/hooks/useAlerts';
 import { formatDate } from '@/lib/transactionParser';
 import { cn } from '@/lib/utils';
 import { Alert as AlertType, Severity } from '@/types/finance';
 
 const severityConfig: Record<Severity, { icon: typeof Bell; color: string; bg: string }> = {
   INFO: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
   WARNING: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
   CRITICAL: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
 };
 
 export default function AlertsPage() {
   const { data: alerts = [], isLoading } = useAlerts();
   const markRead = useMarkAlertsRead();
 
   const handleMarkAllRead = async () => {
     await markRead.mutateAsync(undefined);
   };
 
   const handleMarkRead = async (alertId: string) => {
     await markRead.mutateAsync([alertId]);
   };
 
   const unreadCount = alerts.filter(a => !a.is_read).length;
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Notifications</h1>
           <p className="text-muted-foreground mt-1">
             Stay updated on your financial activity
           </p>
         </div>
         {unreadCount > 0 && (
           <Button 
             variant="outline" 
             size="sm"
             onClick={handleMarkAllRead}
             disabled={markRead.isPending}
           >
             <Check className="h-4 w-4 mr-1" />
             Mark all read ({unreadCount})
           </Button>
         )}
       </div>
 
       {/* Alerts List */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg flex items-center justify-between">
             <span>All Notifications</span>
             <Badge variant="secondary">{alerts.length} total</Badge>
           </CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="space-y-3">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-20 animate-pulse rounded bg-muted" />
               ))}
             </div>
           ) : alerts.length === 0 ? (
             <div className="py-12 text-center">
               <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
               <p className="text-muted-foreground">No notifications yet</p>
               <p className="text-sm text-muted-foreground mt-1">
                 You'll be notified about budget alerts, goal progress, and more
               </p>
             </div>
           ) : (
             <div className="space-y-2">
               {alerts.map((alert) => {
                 const config = severityConfig[alert.severity as Severity];
                 const Icon = config.icon;
                 
                 return (
                   <div 
                     key={alert.id}
                     className={cn(
                       'flex items-start gap-4 p-4 rounded-lg border transition-all',
                       alert.is_read ? 'bg-card' : 'bg-muted/30'
                     )}
                   >
                     <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', config.bg)}>
                       <Icon className={cn('h-5 w-5', config.color)} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between gap-2">
                         <div>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs">
                               {alert.type.replace(/_/g, ' ')}
                             </Badge>
                             {!alert.is_read && (
                               <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                             )}
                           </div>
                           <p className="font-medium mt-1">{alert.message}</p>
                           <p className="text-sm text-muted-foreground mt-1">
                             {formatDate(alert.created_at.slice(0, 10))}
                           </p>
                         </div>
                         {!alert.is_read && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleMarkRead(alert.id)}
                           >
                             <Check className="h-4 w-4" />
                           </Button>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }