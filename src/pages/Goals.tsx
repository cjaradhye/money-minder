 import { useState } from 'react';
 import { Plus, Trash2, Target, TrendingUp } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useGoalProgress, useCreateGoal, useDeleteGoal, useContributeToGoal } from '@/hooks/useGoals';
 import { useInsights } from '@/hooks/useAnalytics';
 import { InsightsCard } from '@/components/dashboard/InsightsCard';
 import { formatCurrency } from '@/lib/transactionParser';
 
 const goalIcons = ['🎯', '🏠', '✈️', '🚗', '💻', '📱', '🎓', '💍', '🏝️', '💰'];
 const goalColors = ['#EB455F', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF6B6B', '#2B3467'];
 
 export default function GoalsPage() {
   const [createOpen, setCreateOpen] = useState(false);
   const [contributeOpen, setContributeOpen] = useState<string | null>(null);
   const [newGoal, setNewGoal] = useState({ name: '', target: '', date: '', icon: '🎯', color: '#EB455F' });
   const [contribution, setContribution] = useState('');
 
   const { data: goalProgress = [], isLoading } = useGoalProgress();
   const { data: insights = [], isLoading: insightsLoading } = useInsights();
   const createGoal = useCreateGoal();
   const deleteGoal = useDeleteGoal();
   const contributeToGoal = useContributeToGoal();
 
   const handleCreate = async () => {
     if (!newGoal.name || !newGoal.target) return;
     
     await createGoal.mutateAsync({
       name: newGoal.name,
       target_amount: parseFloat(newGoal.target),
       target_date: newGoal.date || undefined,
       icon: newGoal.icon,
       color: newGoal.color,
     });
     
     setNewGoal({ name: '', target: '', date: '', icon: '🎯', color: '#EB455F' });
     setCreateOpen(false);
   };
 
   const handleContribute = async () => {
     if (!contributeOpen || !contribution) return;
     
     await contributeToGoal.mutateAsync({
       goalId: contributeOpen,
       amount: parseFloat(contribution),
     });
     
     setContribution('');
     setContributeOpen(null);
   };
 
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this goal?')) {
       await deleteGoal.mutateAsync(id);
     }
   };
 
   const totalTarget = goalProgress.reduce((sum, gp) => sum + Number(gp.goal.target_amount), 0);
   const totalSaved = goalProgress.reduce((sum, gp) => sum + Number(gp.goal.current_amount), 0);
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Goals</h1>
           <p className="text-muted-foreground mt-1">
             Track your savings goals and envelopes
           </p>
         </div>
         <Dialog open={createOpen} onOpenChange={setCreateOpen}>
           <DialogTrigger asChild>
             <Button size="sm">
               <Plus className="h-4 w-4 mr-1" />
               New Goal
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Create Goal</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Goal Name</Label>
                 <Input
                   placeholder="New MacBook"
                   value={newGoal.name}
                   onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Target Amount (₹)</Label>
                 <Input
                   type="number"
                   placeholder="150000"
                   value={newGoal.target}
                   onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Target Date (optional)</Label>
                 <Input
                   type="date"
                   value={newGoal.date}
                   onChange={(e) => setNewGoal(prev => ({ ...prev, date: e.target.value }))}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Icon</Label>
                 <div className="flex flex-wrap gap-2">
                   {goalIcons.map(icon => (
                     <button
                       key={icon}
                       type="button"
                       onClick={() => setNewGoal(prev => ({ ...prev, icon }))}
                       className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${
                         newGoal.icon === icon ? 'border-accent bg-accent/10' : 'border-transparent bg-muted'
                       }`}
                     >
                       {icon}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Color</Label>
                 <div className="flex flex-wrap gap-2">
                   {goalColors.map(color => (
                     <button
                       key={color}
                       type="button"
                       onClick={() => setNewGoal(prev => ({ ...prev, color }))}
                       className={`h-8 w-8 rounded-full transition-all ${
                         newGoal.color === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                       }`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                 </div>
               </div>
               <Button 
                 onClick={handleCreate} 
                 className="w-full"
                 disabled={!newGoal.name || !newGoal.target || createGoal.isPending}
               >
                 {createGoal.isPending ? 'Creating...' : 'Create Goal'}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Summary */}
       <div className="grid gap-4 sm:grid-cols-3">
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                 <Target className="h-5 w-5 text-accent" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Active Goals</p>
                 <p className="font-display text-2xl font-bold">{goalProgress.length}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                 <TrendingUp className="h-5 w-5 text-success" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Saved</p>
                 <p className="font-display text-2xl font-bold">{formatCurrency(totalSaved)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                 <Target className="h-5 w-5 text-secondary-foreground" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Target</p>
                 <p className="font-display text-2xl font-bold">{formatCurrency(totalTarget)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Goals Grid */}
       {isLoading ? (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
           ))}
         </div>
       ) : goalProgress.length === 0 ? (
         <Card>
           <CardContent className="py-12 text-center">
             <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <p className="text-muted-foreground mb-4">No goals yet</p>
             <Button onClick={() => setCreateOpen(true)}>
               <Plus className="h-4 w-4 mr-1" />
               Create your first goal
             </Button>
           </CardContent>
         </Card>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {goalProgress.map((item) => (
             <Card key={item.goal.id} className="group relative overflow-hidden">
               <div 
                 className="absolute inset-x-0 top-0 h-1"
                 style={{ backgroundColor: item.goal.color || '#EB455F' }}
               />
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-2xl">{item.goal.icon || '🎯'}</span>
                     <span className="text-lg">{item.goal.name}</span>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={() => handleDelete(item.goal.id)}
                   >
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-end justify-between">
                   <div>
                     <p className="text-sm text-muted-foreground">Saved</p>
                     <p className="font-display text-2xl font-bold">
                       {formatCurrency(Number(item.goal.current_amount))}
                     </p>
                   </div>
                   <p className="text-sm text-muted-foreground">
                     of {formatCurrency(Number(item.goal.target_amount))}
                   </p>
                 </div>
                 
                 <div className="space-y-2">
                   <Progress 
                     value={item.percentage} 
                     className="h-3"
                     style={{ 
                       '--progress-background': `${item.goal.color}20`,
                     } as React.CSSProperties}
                   />
                   <div className="flex items-center justify-between text-sm">
                     <span className="font-medium" style={{ color: item.goal.color || 'hsl(var(--accent))' }}>
                       {item.percentage.toFixed(0)}% complete
                     </span>
                     {item.daysRemaining !== null && (
                       <span className="text-muted-foreground">{item.daysRemaining} days left</span>
                     )}
                   </div>
                 </div>
 
                 {item.requiredPace !== null && (
                   <p className="text-xs text-muted-foreground">
                     Save {formatCurrency(item.requiredPace)}/month to reach your goal
                   </p>
                 )}
 
                 <Dialog open={contributeOpen === item.goal.id} onOpenChange={(open) => setContributeOpen(open ? item.goal.id : null)}>
                   <DialogTrigger asChild>
                     <Button className="w-full" variant="outline">
                       <Plus className="h-4 w-4 mr-1" />
                       Add Contribution
                     </Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle>Add Contribution to {item.goal.name}</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4 py-4">
                       <div className="space-y-2">
                         <Label>Amount (₹)</Label>
                         <Input
                           type="number"
                           placeholder="5000"
                           value={contribution}
                           onChange={(e) => setContribution(e.target.value)}
                         />
                       </div>
                       <Button 
                         onClick={handleContribute} 
                         className="w-full"
                         disabled={!contribution || contributeToGoal.isPending}
                       >
                         {contributeToGoal.isPending ? 'Adding...' : 'Add Contribution'}
                       </Button>
                     </div>
                   </DialogContent>
                 </Dialog>
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