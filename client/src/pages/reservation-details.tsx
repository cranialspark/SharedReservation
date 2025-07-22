import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Share, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReservationDetails() {
  const [match, params] = useRoute("/reservations/:id");
  const { toast } = useToast();
  const reservationId = params?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/reservations", reservationId],
    enabled: !!reservationId,
  });

  const copyInviteLink = () => {
    if (data?.group?.inviteCode) {
      const inviteUrl = `${window.location.origin}/join/${data.group.inviteCode}`;
      navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Invite link copied!",
        description: "Share this link with friends to join your group",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl h-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl h-96"></div>
              <div className="bg-white rounded-2xl h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation not found</h2>
              <p className="text-slate-600">The reservation you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { reservation, group, members = [] } = data;
  const totalPaid = members.reduce((sum, member) => sum + (member.isPaid ? parseFloat(member.shareAmount) : 0), 0);
  const totalCost = parseFloat(reservation.totalCost);
  const paymentProgress = (totalPaid / totalCost) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64">
            {reservation.venueImage ? (
              <img 
                src={reservation.venueImage} 
                alt={reservation.venueName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center">
                <MapPin className="w-16 h-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-4 left-4">
              <Badge variant={reservation.status === 'active' ? 'default' : 'secondary'}>
                {reservation.status}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl font-bold mb-2">{reservation.venueName}</h1>
              <div className="flex items-center space-x-4 text-sm opacity-90">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(reservation.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Progress */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Progress</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Total Progress</span>
                    <span className="text-sm text-slate-600">${totalPaid.toFixed(2)} / ${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-secondary h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    ${(totalCost - totalPaid).toFixed(2)} remaining • {members.filter(m => !m.isPaid).length} pending payments
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Group Members */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Group Members ({members.length})</h2>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={member.user.profileImageUrl || `https://ui-avatars.com/api/?name=${member.user.firstName}+${member.user.lastName}&background=6366f1&color=fff`}
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-slate-600">${parseFloat(member.shareAmount).toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge variant={member.isPaid ? 'default' : 'outline'}>
                        {member.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {reservation.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
                  <p className="text-slate-600">{reservation.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Invite Friends */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Invite Friends</h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-2">Invite Code</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                        {group?.inviteCode}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyInviteLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={copyInviteLink}>
                    <Share className="w-4 h-4 mr-2" />
                    Share Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Cost</span>
                    <span className="font-medium">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Per Person</span>
                    <span className="font-medium">${(totalCost / members.length).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Collected</span>
                    <span className="font-medium text-secondary">${totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-slate-600">Remaining</span>
                    <span className="font-medium text-accent">${(totalCost - totalPaid).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
