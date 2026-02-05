 import { Sparkles } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 interface InsightsCardProps {
   insights: string[];
   loading?: boolean;
 }
 
 export function InsightsCard({ insights, loading }: InsightsCardProps) {
   return (
     <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
       <CardHeader className="pb-3">
         <CardTitle className="flex items-center gap-2 text-lg">
           <Sparkles className="h-5 w-5 text-accent" />
           AI Insights
         </CardTitle>
       </CardHeader>
       <CardContent>
         {loading ? (
           <div className="space-y-2">
             <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
             <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
           </div>
         ) : insights.length > 0 ? (
           <ul className="space-y-3">
             {insights.map((insight, index) => (
               <li key={index} className="flex items-start gap-2 text-sm">
                 <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                 <span>{insight}</span>
               </li>
             ))}
           </ul>
         ) : (
           <p className="text-sm text-muted-foreground">
             Add more transactions to get personalized insights about your spending patterns.
           </p>
         )}
       </CardContent>
     </Card>
   );
 }