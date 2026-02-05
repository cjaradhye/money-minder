 import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { StatCard } from '@/components/dashboard/StatCard';
 import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
 import { GoalCard } from '@/components/dashboard/GoalCard';
 import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
 import { InsightsCard } from '@/components/dashboard/InsightsCard';
 import { useAnalyticsSummary, useInsights } from '@/hooks/useAnalytics';
 import { useBudgetStatuses } from '@/hooks/useBudgets';
 import { useGoalProgress } from '@/hooks/useGoals';
 import { useTransactions } from '@/hooks/useTransactions';
 import { useAuth } from '@/hooks/useAuth';
 import { formatCurrency, getMonthName } from '@/lib/transactionParser';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function Dashboard() {
   const { profile } = useAuth();
   const currentMonth = new Date().toISOString().slice(0, 7);
   
   const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(currentMonth);
   const { data: budgetStatuses = [], isLoading: budgetsLoading } = useBudgetStatuses(currentMonth);
   const { data: goalProgress = [], isLoading: goalsLoading } = useGoalProgress();
   const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
   const { data: insights = [], isLoading: insightsLoading } = useInsights(currentMonth);
 
   const greeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return 'Good morning';
     if (hour < 17) return 'Good afternoon';
     return 'Good evening';
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">
             {greeting()}, {profile?.name?.split(' ')[0] || 'there'}!
           </h1>
           <p className="text-muted-foreground mt-1">
             Here's your financial overview for {getMonthName(currentMonth)}
           </p>
         </div>
         <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" asChild>
             <Link to="/transactions">View All</Link>
           </Button>
           <Button size="sm" className="gap-1" onClick={() => {
             // Trigger spotlight with keyboard event
             document.dispatchEvent(new KeyboardEvent('keydown', { 
               key: 'u', 
               metaKey: true, 
               shiftKey: true 
             }));
           }}>
             <Plus className="h-4 w-4" />
             Add Transaction
           </Button>
         </div>
       </div>
 
       {/* Stats Grid */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {summaryLoading ? (
           <>
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
           </>
         ) : (
           <>
             <StatCard
               title="Total Income"
               value={formatCurrency(summary?.totalIncome || 0)}
               subtitle={`${summary?.transactionCount || 0} transactions`}
               icon={TrendingUp}
               variant="success"
             />
             <StatCard
               title="Total Expenses"
               value={formatCurrency(summary?.totalExpenses || 0)}
               subtitle={`Across ${summary?.topCategories.length || 0} categories`}
               icon={TrendingDown}
               variant="accent"
             />
             <StatCard
               title="Net Balance"
               value={formatCurrency(summary?.netBalance || 0)}
               subtitle={summary?.netBalance && summary.netBalance > 0 ? 'You\'re saving!' : 'Review spending'}
               icon={Wallet}
               variant={summary?.netBalance && summary.netBalance > 0 ? 'success' : 'warning'}
             />
             <StatCard
               title="Goals Progress"
               value={`${goalProgress.length} active`}
               subtitle={goalProgress.length > 0 
                 ? `${goalProgress.filter(g => g.percentage >= 50).length} on track`
                 : 'Create your first goal'
               }
               icon={PiggyBank}
               variant="default"
             />
           </>
         )}
       </div>
 
       {/* Main Content Grid */}
       <div className="grid gap-6 lg:grid-cols-3">
         {/* Left Column - Budget & Transactions */}
         <div className="lg:col-span-2 space-y-6">
           {budgetsLoading ? (
             <Skeleton className="h-64" />
           ) : (
             <BudgetProgress budgets={budgetStatuses} />
           )}
           
           {transactionsLoading ? (
             <Skeleton className="h-64" />
           ) : (
             <RecentTransactions transactions={transactions} />
           )}
         </div>
 
         {/* Right Column - Goals & Insights */}
         <div className="space-y-6">
           {/* Goals */}
           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <h3 className="font-display text-lg font-semibold">Your Goals</h3>
               <Button variant="ghost" size="sm" asChild>
                 <Link to="/goals">View All</Link>
               </Button>
             </div>
             {goalsLoading ? (
               <Skeleton className="h-32" />
             ) : goalProgress.length > 0 ? (
               <div className="space-y-3">
                 {goalProgress.slice(0, 3).map((gp) => (
                   <GoalCard key={gp.goal.id} goalProgress={gp} />
                 ))}
               </div>
             ) : (
               <div className="rounded-lg border border-dashed p-4 text-center">
                 <p className="text-sm text-muted-foreground mb-2">No goals yet</p>
                 <Button size="sm" variant="outline" asChild>
                   <Link to="/goals">Create Goal</Link>
                 </Button>
               </div>
             )}
           </div>
 
           {/* AI Insights */}
           <InsightsCard insights={insights} loading={insightsLoading} />
         </div>
       </div>
     </div>
   );
 }