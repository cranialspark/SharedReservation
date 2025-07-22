import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, MapPin, Calendar, DollarSign } from "lucide-react";

const createReservationSchema = z.object({
  venueName: z.string().min(1, "Venue name is required"),
  venueImage: z.string().url("Please enter a valid image URL").optional(),
  eventDate: z.string().min(1, "Event date is required"),
  totalCost: z.string().min(1, "Total cost is required"),
  description: z.string().optional(),
});

type CreateReservationForm = z.infer<typeof createReservationSchema>;

export default function CreateReservation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateReservationForm>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      venueName: "",
      venueImage: "",
      eventDate: "",
      totalCost: "",
      description: "",
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: CreateReservationForm) => {
      const response = await apiRequest("POST", "/api/reservations", {
        ...data,
        totalCost: parseFloat(data.totalCost),
        eventDate: new Date(data.eventDate).toISOString(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reservation Created",
        description: "Your reservation has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setLocation(`/reservations/${data.reservation.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateReservationForm) => {
    createReservationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Create New Reservation</CardTitle>
            <p className="text-slate-600">Set up a new reservation to share costs with friends</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Venue Name</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., SkyBar NYC, The Capital Grille" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/venue-image.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Event Date & Time</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Total Cost</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1500.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional details about the reservation..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setLocation("/")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReservationMutation.isPending}
                    className="flex-1 bg-primary hover:bg-indigo-600"
                  >
                    {createReservationMutation.isPending ? "Creating..." : "Create Reservation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
