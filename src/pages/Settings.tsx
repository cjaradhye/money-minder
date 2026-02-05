 import { useState } from 'react';
 import { User, Bell, Palette, Save } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 import { supabase } from '@/integrations/supabase/client';
 
 export default function SettingsPage() {
   const { profile } = useAuth();
   const [name, setName] = useState(profile?.name || '');
   const [currency, setCurrency] = useState('INR');
   const [weekStart, setWeekStart] = useState('MONDAY');
   const [notifications, setNotifications] = useState(true);
   const [saving, setSaving] = useState(false);
 
   const handleSaveProfile = async () => {
     if (!profile) return;
     setSaving(true);
     
     const { error } = await supabase
       .from('profiles')
       .update({ name })
       .eq('user_id', profile.user_id);
     
     if (error) {
       toast.error('Failed to update profile');
     } else {
       toast.success('Profile updated');
     }
     setSaving(false);
   };
 
   const handleSavePreferences = async () => {
     if (!profile) return;
     setSaving(true);
     
     const { error } = await supabase
       .from('user_preferences')
       .update({ 
         currency, 
         week_start_day: weekStart,
         notifications_enabled: notifications 
       })
       .eq('user_id', profile.user_id);
     
     if (error) {
       toast.error('Failed to update preferences');
     } else {
       toast.success('Preferences updated');
     }
     setSaving(false);
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div>
         <h1 className="font-display text-3xl font-bold">Settings</h1>
         <p className="text-muted-foreground mt-1">
           Manage your account and preferences
         </p>
       </div>
 
       <Tabs defaultValue="profile" className="space-y-6">
         <TabsList>
           <TabsTrigger value="profile" className="gap-2">
             <User className="h-4 w-4" />
             Profile
           </TabsTrigger>
           <TabsTrigger value="preferences" className="gap-2">
             <Palette className="h-4 w-4" />
             Preferences
           </TabsTrigger>
           <TabsTrigger value="notifications" className="gap-2">
             <Bell className="h-4 w-4" />
             Notifications
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="profile">
           <Card>
             <CardHeader>
               <CardTitle>Profile Information</CardTitle>
               <CardDescription>Update your personal details</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Name</Label>
                 <Input
                   id="name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   placeholder="Your name"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   value={profile?.email || ''}
                   disabled
                   className="bg-muted"
                 />
                 <p className="text-xs text-muted-foreground">Email cannot be changed</p>
               </div>
               <Button onClick={handleSaveProfile} disabled={saving}>
                 <Save className="h-4 w-4 mr-1" />
                 {saving ? 'Saving...' : 'Save Changes'}
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="preferences">
           <Card>
             <CardHeader>
               <CardTitle>Preferences</CardTitle>
               <CardDescription>Customize your experience</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label>Currency</Label>
                 <Select value={currency} onValueChange={setCurrency}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                     <SelectItem value="USD">US Dollar ($)</SelectItem>
                     <SelectItem value="EUR">Euro (€)</SelectItem>
                     <SelectItem value="GBP">British Pound (£)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Week Starts On</Label>
                 <Select value={weekStart} onValueChange={setWeekStart}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="MONDAY">Monday</SelectItem>
                     <SelectItem value="SUNDAY">Sunday</SelectItem>
                     <SelectItem value="SATURDAY">Saturday</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <Button onClick={handleSavePreferences} disabled={saving}>
                 <Save className="h-4 w-4 mr-1" />
                 {saving ? 'Saving...' : 'Save Preferences'}
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="notifications">
           <Card>
             <CardHeader>
               <CardTitle>Notification Settings</CardTitle>
               <CardDescription>Manage how you receive alerts</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Budget Alerts</Label>
                   <p className="text-sm text-muted-foreground">
                     Get notified when you're at risk of overspending
                   </p>
                 </div>
                 <Switch checked={notifications} onCheckedChange={setNotifications} />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Goal Progress</Label>
                   <p className="text-sm text-muted-foreground">
                     Updates on your savings goals
                   </p>
                 </div>
                 <Switch checked={notifications} onCheckedChange={setNotifications} />
               </div>
               <div className="flex items-center justify-between">
                 <div className="space-y-0.5">
                   <Label>Recurring Transactions</Label>
                   <p className="text-sm text-muted-foreground">
                     Notifications for upcoming recurring payments
                   </p>
                 </div>
                 <Switch checked={notifications} onCheckedChange={setNotifications} />
               </div>
               <Button onClick={handleSavePreferences} disabled={saving}>
                 <Save className="h-4 w-4 mr-1" />
                 {saving ? 'Saving...' : 'Save Settings'}
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }