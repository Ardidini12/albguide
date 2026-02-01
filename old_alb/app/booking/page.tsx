"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Package, Profile } from "@/lib/types/database";

export default function Booking() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [people, setPeople] = useState<number>(1);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirect=/booking');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });

      setProfile(profileData);
      setPackages(packagesData || []);
      
      if (profileData) {
        setContactName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
        setContactEmail(profileData.email || "");
        setContactPhone(profileData.whatsapp_number || "");
        setWhatsappNumber(profileData.whatsapp_number || "");
      }
    };

    loadData();
  }, [router]);

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const totalPrice = selectedPackage ? Number(selectedPackage.price) * people : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedPackageId) {
      setError("Please select a package");
      setLoading(false);
      return;
    }

    if (!whatsappNumber) {
      setError("WhatsApp number is required for booking");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to book");
        setLoading(false);
        return;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          package_id: selectedPackageId,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          whatsapp_number: whatsappNumber,
          people,
          total_price: totalPrice,
          booking_date: bookingDate || null,
          notes: notes || null,
          status: 'PENDING'
        });

      if (bookingError) {
        setError(bookingError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your booking request has been received. We&apos;ll contact you via WhatsApp shortly.
            </p>
            <p className="text-sm text-gray-500">
              Payment is cash only. We&apos;ll arrange details via WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Book Your Trip</CardTitle>
          <p className="text-sm text-gray-600">Payment: Cash only. Contact via WhatsApp.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="package">Select Package *</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.title} - €{pkg.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Full Name *</Label>
              <Input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number * (for booking confirmation)</Label>
              <div className="relative">
                <PhoneInput
                  international
                  defaultCountry="AL"
                  value={whatsappNumber}
                  onChange={(value) => setWhatsappNumber(value || "")}
                  className={cn(
                    "PhoneInput flex items-center rounded-md border border-input bg-input-background h-9",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    "transition-[color,box-shadow]"
                  )}
                  numberInputProps={{
                    className: cn(
                      "PhoneInputInput flex h-9 w-full min-w-0 rounded-md border-0 bg-transparent px-3 py-1 text-base",
                      "placeholder:text-muted-foreground outline-none",
                      "md:text-sm"
                    ),
                    id: "whatsapp",
                    placeholder: "Enter WhatsApp number",
                  }}
                  countrySelectProps={{
                    className: cn(
                      "PhoneInputCountrySelect flex items-center gap-1.5 px-2 py-1.5 border-r border-input",
                      "hover:bg-accent transition-colors cursor-pointer"
                    ),
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="people">Number of People</Label>
                <Input
                  id="people"
                  type="number"
                  min="1"
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or questions?"
                disabled={loading}
              />
            </div>

            {selectedPackage && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-2xl font-bold text-purple-700">
                    €{totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {people} {people === 1 ? 'person' : 'people'} × €{selectedPackage.price}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By submitting, you agree to be contacted via WhatsApp for booking confirmation and payment details.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

