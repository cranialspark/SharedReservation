import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lock, CreditCard } from "lucide-react";

interface PaymentModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ member, isOpen, onClose }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = parseFloat(member.shareAmount);
  const processingFee = amount * 0.03; // 3% processing fee
  const totalAmount = amount + processingFee;

  useEffect(() => {
    if (isOpen && member) {
      // Create PaymentIntent when modal opens
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: totalAmount,
        groupMemberId: member.id 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to initialize payment",
            variant: "destructive",
          });
        });
    }
  }, [isOpen, member, totalAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      onClose();
    }

    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-full overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">Complete Payment</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-medium text-slate-900 mb-2">{member.group?.reservation?.venueName}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Your share:</span>
                <span className="font-medium text-slate-900">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Processing fee:</span>
                <span className="font-medium text-slate-900">${processingFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          {clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-slate-300 rounded-xl p-4">
                <PaymentElement />
              </div>
              
              <Button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full bg-primary hover:bg-indigo-600"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : `Pay Securely - $${totalAmount.toFixed(2)}`}
              </Button>
            </form>
          ) : (
            <div className="border border-slate-300 rounded-xl p-4">
              <div className="text-slate-400 text-sm text-center py-8">
                <CreditCard className="w-8 h-8 mx-auto mb-2" />
                <p>Loading secure payment form...</p>
              </div>
            </div>
          )}
          
          <p className="text-xs text-slate-500 text-center">
            Your payment is secured by Stripe. We never store your card details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
