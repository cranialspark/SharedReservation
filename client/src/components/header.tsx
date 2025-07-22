import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Share, Bell, ChevronDown, Calendar, Users, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Share className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">SplitReserve</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-primary">
                <Calendar className="w-4 h-4 mr-2" />
                Reservations
              </Button>
            </Link>
            <Button variant="ghost" className="text-slate-600 hover:text-primary">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </Button>
            <Button variant="ghost" className="text-slate-600 hover:text-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={user?.profileImageUrl} 
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
