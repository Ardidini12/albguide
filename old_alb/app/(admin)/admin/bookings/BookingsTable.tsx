"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { BookingWithPackage } from '@/lib/types/database';
import { Calendar, Mail, Phone, Users, MessageCircle } from 'lucide-react';

interface BookingsTableProps {
  bookings: any[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      router.refresh();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openWhatsApp = (number: string) => {
    window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}`, '_blank');
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No bookings yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.package?.title}</h3>
                    <p className="text-sm text-gray-500">
                      Booking ID: {booking.id.slice(0, 8)}...
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Customer Details</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{booking.contact_name}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${booking.contact_email}`} className="hover:underline">
                          {booking.contact_email}
                        </a>
                      </div>
                      {booking.contact_phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{booking.contact_phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-green-600">
                        <MessageCircle className="w-4 h-4" />
                        <button 
                          onClick={() => openWhatsApp(booking.whatsapp_number)}
                          className="hover:underline"
                        >
                          {booking.whatsapp_number}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Booking Details</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{booking.people} {booking.people === 1 ? 'person' : 'people'}</span>
                      </div>
                      {booking.booking_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <p className="font-semibold text-lg text-purple-700">
                        €{Number(booking.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.notes}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Created: {new Date(booking.created_at).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Update Status
                  </label>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                    disabled={updatingId === booking.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => openWhatsApp(booking.whatsapp_number)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact on WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
