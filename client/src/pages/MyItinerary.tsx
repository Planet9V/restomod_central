import { useItinerary } from '@/hooks/use-itinerary';
import { useAuth } from '@/hooks/use-auth';
import { Link, Redirect } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyItinerary() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { itinerary, isLoading: itineraryLoading, removeEvent } = useItinerary();

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">My Itinerary</h1>
          <p className="text-gray-400 mb-8">Your saved events for your next automotive adventure.</p>
        </motion.div>

        {itineraryLoading && <p>Loading your itinerary...</p>}

        {!itineraryLoading && (!itinerary || itinerary.length === 0) && (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Your Itinerary is Empty</h2>
            <p className="text-gray-400 mb-4">You haven't added any events yet.</p>
            <Button asChild>
              <Link href="/car-show-events">Find Events</Link>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itinerary?.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-slate-800/80 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">{event.eventName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                    <span className="text-sm">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                    <span className="text-sm">{event.city}, {event.state}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => removeEvent(event.id)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Remove from Itinerary
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
