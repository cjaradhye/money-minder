 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { AnalyticsSummary } from '@/types/finance';
 import { useAuth } from './useAuth';
 
 export function useAnalyticsSummary(monthYear?: string) {
   const { user } = useAuth();
   const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
 
   return useQuery({
     queryKey: ['analytics', 'summary', user?.id, currentMonth],
     queryFn: async (): Promise<AnalyticsSummary> => {
       if (!user) {
         return {
           totalIncome: 0,
           totalExpenses: 0,
           netBalance: 0,
           topCategories: [],
           transactionCount: 0
         };
       }
 
       const startDate = `${currentMonth}-01`;
       const endDate = new Date(parseInt(currentMonth.slice(0, 4)), parseInt(currentMonth.slice(5, 7)), 0)
         .toISOString().slice(0, 10);
 
       // Get all transactions for the month
       const { data: transactions, error } = await supabase
         .from('transactions')
         .select(`
           type,
           amount,
           category:categories(name)
         `)
         .eq('user_id', user.id)
         .gte('transaction_date', startDate)
         .lte('transaction_date', endDate);
 
       if (error) throw error;
 
       let totalIncome = 0;
       let totalExpenses = 0;
       const categorySpend: Record<string, number> = {};
 
       (transactions || []).forEach(tx => {
         const amount = Number(tx.amount);
         if (tx.type === 'INCOME') {
           totalIncome += amount;
         } else {
           totalExpenses += amount;
           const categoryName = (tx.category as { name: string } | null)?.name || 'Other';
           categorySpend[categoryName] = (categorySpend[categoryName] || 0) + amount;
         }
       });
 
       // Sort categories by spend
       const topCategories = Object.entries(categorySpend)
         .map(([category, amount]) => ({
           category,
           amount,
           percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100 * 10) / 10 : 0
         }))
         .sort((a, b) => b.amount - a.amount)
         .slice(0, 5);
 
       return {
         totalIncome,
         totalExpenses,
         netBalance: totalIncome - totalExpenses,
         topCategories,
         transactionCount: transactions?.length || 0
       };
     },
     enabled: !!user
   });
 }
 
 // Deterministic AI-like insights based on analytics data
 export function useInsights(monthYear?: string) {
   const { data: summary } = useAnalyticsSummary(monthYear);
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['insights', user?.id, monthYear, summary],
     queryFn: async () => {
       if (!summary) return [];
 
       const insights: string[] = [];
 
       // Net balance insight
       if (summary.netBalance > 0) {
         insights.push(`Great job! You saved ₹${summary.netBalance.toLocaleString('en-IN')} this month. Consider allocating some to your goals.`);
       } else if (summary.netBalance < 0) {
         insights.push(`You spent ₹${Math.abs(summary.netBalance).toLocaleString('en-IN')} more than you earned this month. Review your spending in top categories.`);
       }
 
       // Top category insight
       if (summary.topCategories.length > 0) {
         const top = summary.topCategories[0];
         insights.push(`Your highest spending category is ${top.category} at ₹${top.amount.toLocaleString('en-IN')} (${top.percentage}% of expenses).`);
       }
 
       // Transaction frequency
       if (summary.transactionCount > 30) {
         insights.push(`You made ${summary.transactionCount} transactions this month. Consider batching small purchases to reduce impulse spending.`);
       }
 
       // Income vs expense ratio
       if (summary.totalIncome > 0) {
         const savingsRate = ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100;
         if (savingsRate >= 20) {
           insights.push(`Excellent! Your savings rate is ${savingsRate.toFixed(1)}%. You're on track for financial health.`);
         } else if (savingsRate > 0) {
           insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% for long-term financial security.`);
         }
       }
 
       return insights;
     },
     enabled: !!user && !!summary
   });
 }