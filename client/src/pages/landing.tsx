import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share, Users, CreditCard, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Share className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">SplitReserve</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-indigo-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
            Share Costs,
            <span className="text-primary"> Share Experiences</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Split the cost of bottle service, private dining, and exclusive events with friends. 
            Make luxury experiences accessible and enjoyable for everyone.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-indigo-600 text-lg px-8 py-4"
          >
            Get Started Today
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Group Creation</h3>
              <p className="text-slate-600 text-sm">
                Create groups and invite friends with simple invite codes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
              <p className="text-slate-600 text-sm">
                Powered by Stripe for safe and reliable payment processing
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Share className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Cost Splitting</h3>
              <p className="text-slate-600 text-sm">
                Automatically calculate and distribute costs among group members
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Tracking</h3>
              <p className="text-slate-600 text-sm">
                Track payment status and get notifications when payments are due
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 text-center border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Start Sharing?
          </h2>
          <p className="text-slate-600 mb-6">
            Join thousands of users who are making exclusive experiences more accessible.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-indigo-600"
          >
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
}
