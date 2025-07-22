import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import ReservationCard from "@/components/reservation-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, DollarSign, Users, Search, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
  });

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-white rounded-2xl p-6 h-32"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 h-24"></div>
              <div className="bg-white rounded-xl p-6 h-24"></div>
              <div className="bg-white rounded-xl p-6 h-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { reservations = [], stats, activities = [] } = dashboardData || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Dashboard Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Reservations</h1>
                    <p className="text-slate-600 mt-1">Manage and split costs with your groups</p>
                  </div>
                  <Link href="/reservations/new">
                    <Button className="bg-primary hover:bg-indigo-600 flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>New Reservation</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats?.activeReservations || 0}</p>
                      <p className="text-sm text-slate-600">Active Reservations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">${stats?.totalSaved || 0}</p>
                      <p className="text-sm text-slate-600">Total Saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats?.groupMembers || 0}</p>
                      <p className="text-sm text-slate-600">Group Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No reservations yet</h3>
                    <p className="text-slate-600 mb-4">Create your first reservation to start splitting costs with friends.</p>
                    <Link href="/reservations/new">
                      <Button className="bg-primary hover:bg-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Reservation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                reservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/reservations/new">
                    <Button variant="ghost" className="w-full justify-start h-auto p-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-900">Create Group</p>
                        <p className="text-sm text-slate-600">Start a new cost-sharing group</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Button variant="ghost" className="w-full justify-start h-auto p-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                      <Search className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">Find Events</p>
                      <p className="text-sm text-slate-600">Browse upcoming reservations</p>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start h-auto p-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">Invite Friends</p>
                      <p className="text-sm text-slate-600">Add friends to your network</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                  ) : (
                    activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">{activity.message}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {activities.length > 5 && (
                  <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/5">
                    View All Activity
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
