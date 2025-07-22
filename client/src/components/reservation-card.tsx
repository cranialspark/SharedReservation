import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Eye, Send, Share, CreditCard, Receipt, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";

interface ReservationCardProps {
  reservation: any;
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const { group } = reservation;
  const members = group?.members || [];
  const totalCost = parseFloat(reservation.totalCost);
  const totalPaid = members.reduce((sum, member) => sum + (member.isPaid ? parseFloat(member.shareAmount) : 0), 0);
  const paymentProgress = (totalPaid / totalCost) * 100;
  const remainingAmount = totalCost - totalPaid;
  const pendingPayments = members.filter(m => !m.isPaid).length;

  const getStatusBadge = () => {
    switch (reservation.status) {
      case 'active':
        return <Badge className="bg-secondary text-white">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{reservation.status}</Badge>;
    }
  };

  const getStatusColor = () => {
    if (pendingPayments > 0 && reservation.status === 'active') {
      return 'border-accent/30';
    }
    return 'border-slate-200';
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${getStatusColor()}`}>
      {/* Event image and header */}
      <div className="relative h-48 sm:h-32">
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
          {getStatusBadge()}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{reservation.venueName}</h3>
          <div className="flex items-center space-x-1 text-sm opacity-90">
            <Calendar className="w-4 h-4" />
            <span>{new Date(reservation.eventDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <CardContent className="p-6">
        {reservation.status === 'active' && (
          <>
            {/* Payment Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Payment Progress</span>
                <span className="text-sm text-slate-600">${totalPaid.toFixed(2)} / ${totalCost.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ${remainingAmount.toFixed(2)} remaining • {pendingPayments} pending payments
              </p>
            </div>

            {/* Group Members */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Group Members ({members.length})</h4>
              <div className="flex flex-wrap gap-3">
                {members.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 bg-slate-50 rounded-lg px-3 py-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={member.user.profileImageUrl} 
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                      />
                      <AvatarFallback className="text-xs">
                        {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-700">{member.user.firstName}</span>
                    {member.isPaid ? (
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    ) : (
                      <Clock className="w-4 h-4 text-accent" />
                    )}
                  </div>
                ))}
                {members.length > 3 && (
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                    +{members.length - 3} more
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/reservations/${reservation.id}`} className="flex-1">
                <Button className="w-full bg-primary hover:bg-indigo-600">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
              <Button variant="outline" size="default">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Pending Payment Alert */}
        {pendingPayments > 0 && reservation.status === 'active' && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-slate-900">Payment Required</p>
                <p className="text-sm text-slate-600">Your payment is pending</p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Reservation */}
        {reservation.status === 'completed' && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Cost Split</p>
              <p className="text-lg font-bold text-slate-900">${totalCost.toFixed(2)} / {members.length} people</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Your Share</p>
              <p className="text-lg font-bold text-secondary">${(totalCost / members.length).toFixed(2)}</p>
            </div>
          </div>
        )}

        {reservation.status === 'completed' && (
          <Button variant="outline" className="w-full mt-4">
            <Receipt className="w-4 h-4 mr-2" />
            View Receipt
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
