import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from "@/components/header";
import PaymentModal from "@/components/payment-modal";
import { Card, CardContent } from "@/components/ui/card";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const [match, params] = useRoute("/payment/:memberId");
  const memberId = params?.memberId;

  const { data: memberData, isLoading } = useQuery({
    queryKey: ["/api/group-members", memberId],
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment not found</h2>
              <p className="text-slate-600">The payment you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Elements stripe={stripePromise}>
          <PaymentModal 
            member={memberData}
            isOpen={true}
            onClose={() => window.history.back()}
          />
        </Elements>
      </main>
    </div>
  );
}
