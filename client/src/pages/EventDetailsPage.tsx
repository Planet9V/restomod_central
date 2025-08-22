import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { getEventBySlug, getCommentsForEvent, postComment } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, MapPin, DollarSign, Car, Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { useState } from 'react';

const API_BASE = '';

async function getNearbyCars(eventId: number) {
    const response = await fetch(`${API_BASE}/api/events/${eventId}/nearby-cars`);
    if (!response.ok) {
        throw new Error('Failed to fetch nearby cars');
    }
    return response.json();
}

export default function EventDetailsPage() {
    const params = useParams();
    const slug = params.slug;
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', slug],
        queryFn: () => getEventBySlug(slug!),
        enabled: !!slug,
    });

    const { data: nearbyCars, isLoading: nearbyCarsLoading } = useQuery({
        queryKey: ['nearbyCars', event?.id],
        queryFn: () => getNearbyCars(event.id),
        enabled: !!event,
    });

    const { data: comments, isLoading: commentsLoading } = useQuery({
        queryKey: ['comments', event?.id],
        queryFn: () => getCommentsForEvent(event.id),
        enabled: !!event,
    });

    const postCommentMutation = useMutation({
        mutationFn: () => postComment(event.id, comment),
        onSuccess: () => {
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['comments', event?.id] });
        },
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim()) {
            postCommentMutation.mutate();
        }
    };

    if (isLoading) return <div>Loading event...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;
    if (!event) return <div>Event not found.</div>;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return 'Price on Request';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numPrice);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-bold mb-2">{event.eventName}</h1>
                    <p className="text-xl text-gray-400 mb-6">{event.venue}</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center"><Calendar className="w-5 h-5 mr-3 text-orange-400" /><span>{formatDate(event.startDate)} - {event.endDate ? formatDate(event.endDate) : ''}</span></div>
                                <div className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-orange-400" /><span>{event.city}, {event.state}</span></div>
                                <div className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-orange-400" /><span>Spectators: {event.entryFeeSpectator || 'N/A'} | Participants: {event.entryFeeParticipant || 'N/A'}</span></div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge>{event.eventType}</Badge>
                                    <Badge variant="secondary">{event.eventCategory}</Badge>
                                </div>
                                <p className="text-gray-300 pt-4">{event.description}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle>Nearby Cars For Sale</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {nearbyCarsLoading && <p>Loading cars...</p>}
                                {nearbyCars && nearbyCars.length === 0 && <p>No cars found nearby.</p>}
                                {nearbyCars?.map((car: any) => (
                                    <div key={car.id} className="border-b border-slate-700 pb-3 last:border-b-0">
                                        <p className="font-semibold">{car.year} {car.make} {car.model}</p>
                                        <p className="text-sm text-green-400">{formatPrice(car.price)}</p>
                                        <p className="text-xs text-gray-400">{car.location}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-orange-400" />
                                    Community Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isAuthenticated ? (
                                    <form onSubmit={handleCommentSubmit} className="space-y-2">
                                        <Textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your thoughts about this event..."
                                            className="bg-slate-700 border-slate-600"
                                        />
                                        <Button type="submit" size="sm" disabled={postCommentMutation.isPending}>
                                            {postCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                                        </Button>
                                    </form>
                                ) : (
                                    <p className="text-sm text-gray-400">Please log in to post a comment.</p>
                                )}
                                <div className="space-y-3">
                                    {commentsLoading && <p>Loading comments...</p>}
                                    {comments && comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
                                    {comments?.map((comment: any) => (
                                        <div key={comment.id} className="text-sm border-t border-slate-700 pt-3">
                                            <p className="text-gray-200">{comment.content}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                - <strong>{comment.user?.username || 'Anonymous'}</strong> on {formatDate(comment.createdAt)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
