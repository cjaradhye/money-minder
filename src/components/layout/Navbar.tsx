 import { Link, useLocation } from 'react-router-dom';
 import { Bell, Menu, X, LogOut, User } from 'lucide-react';
 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/hooks/useAuth';
 import { useUnreadAlertCount } from '@/hooks/useAlerts';
 import { 
   DropdownMenu, 
   DropdownMenuContent, 
   DropdownMenuItem, 
   DropdownMenuTrigger 
 } from '@/components/ui/dropdown-menu';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Badge } from '@/components/ui/badge';
 
 const navLinks = [
   { path: '/dashboard', label: 'Dashboard' },
   { path: '/transactions', label: 'Transactions' },
   { path: '/budgets', label: 'Budgets' },
   { path: '/goals', label: 'Goals' },
   { path: '/recurring', label: 'Recurring' },
 ];
 
 export function Navbar() {
   const location = useLocation();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const { user, profile, signOut } = useAuth();
   const { data: unreadCount } = useUnreadAlertCount();
 
   const handleSignOut = async () => {
     await signOut();
   };
 
   return (
     <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="flex h-16 items-center justify-between">
           {/* Logo */}
           <Link to="/dashboard" className="flex items-center gap-2">
             <img src="/logo.png" alt="Quell" className="h-8 w-8" />
             <span className="font-display text-xl font-bold text-primary">Quell</span>
           </Link>
 
           {/* Desktop Navigation */}
           <div className="hidden md:flex md:items-center md:gap-1">
             {navLinks.map(link => (
               <Link
                 key={link.path}
                 to={link.path}
                 className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                   location.pathname === link.path
                     ? 'bg-accent text-accent-foreground'
                     : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                 }`}
               >
                 {link.label}
               </Link>
             ))}
           </div>
 
           {/* Right side */}
           <div className="flex items-center gap-2">
             {/* Notifications */}
             <Link to="/alerts">
               <Button variant="ghost" size="icon" className="relative">
                 <Bell className="h-5 w-5" />
                 {unreadCount && unreadCount > 0 && (
                   <Badge 
                     className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                     variant="destructive"
                   >
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </Badge>
                 )}
               </Button>
             </Link>
 
             {/* User menu */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                   <Avatar className="h-9 w-9">
                     <AvatarImage src={profile?.avatar_url || undefined} />
                     <AvatarFallback className="bg-accent text-accent-foreground">
                       {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                     </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <div className="flex items-center gap-2 p-2">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={profile?.avatar_url || undefined} />
                     <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                       {profile?.name?.charAt(0) || 'U'}
                     </AvatarFallback>
                   </Avatar>
                   <div className="flex flex-col">
                     <p className="text-sm font-medium">{profile?.name || 'User'}</p>
                     <p className="text-xs text-muted-foreground">{user?.email}</p>
                   </div>
                 </div>
                 <DropdownMenuItem asChild>
                   <Link to="/settings" className="flex items-center gap-2">
                     <User className="h-4 w-4" />
                     Settings
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                   <LogOut className="h-4 w-4" />
                   Sign out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
 
             {/* Mobile menu button */}
             <Button
               variant="ghost"
               size="icon"
               className="md:hidden"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
             </Button>
           </div>
         </div>
 
         {/* Mobile Navigation */}
         {mobileMenuOpen && (
           <div className="border-t border-border py-2 md:hidden">
             {navLinks.map(link => (
               <Link
                 key={link.path}
                 to={link.path}
                 onClick={() => setMobileMenuOpen(false)}
                 className={`block rounded-lg px-4 py-2 text-sm font-medium ${
                   location.pathname === link.path
                     ? 'bg-accent text-accent-foreground'
                     : 'text-muted-foreground hover:bg-muted'
                 }`}
               >
                 {link.label}
               </Link>
             ))}
           </div>
         )}
       </div>
     </nav>
   );
 }