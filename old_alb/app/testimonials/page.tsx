import { Card, CardContent } from '../components/ui/card';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'London, United Kingdom',
    rating: 5,
    trip: 'Albanian Riviera Beach Escape',
    date: 'August 2024',
    text: 'Albania exceeded all our expectations! The Albanian Riviera was absolutely stunning with crystal-clear waters and pristine beaches. Our travel agent Maria was incredibly helpful and made sure every detail was perfect. The hotels were beautiful, and the local cuisine was amazing. We can\'t wait to return!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  },
  {
    name: 'Michael & Emma Weber',
    location: 'Munich, Germany',
    rating: 5,
    trip: 'Romantic Coastal Getaway',
    date: 'July 2024',
    text: 'Perfect honeymoon destination! We chose Albania for our honeymoon and it was the best decision. The 5-star resort in Saranda was luxurious, the private beach was dreamy, and the sunset dinners were unforgettable. Discover Albania made everything seamless. Highly recommend for couples!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
  },
  {
    name: 'Marco Rossi',
    location: 'Rome, Italy',
    rating: 5,
    trip: 'Albanian Alps Adventure',
    date: 'September 2024',
    text: 'The trek through the Albanian Alps was the highlight of my year! Our guide was knowledgeable and passionate about the region. The mountain villages were authentic and welcoming. The scenery was breathtaking. If you love hiking and nature, this is a must-do experience.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    name: 'Lisa Chen',
    location: 'San Francisco, USA',
    rating: 5,
    trip: 'UNESCO Heritage Tour',
    date: 'June 2024',
    text: 'As a history enthusiast, visiting Berat and Gjirokastër was a dream come true. The UNESCO sites are beautifully preserved, and the local guides shared fascinating stories. The accommodation in traditional guesthouses added to the authentic experience. Five stars all the way!',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  },
  {
    name: 'The Anderson Family',
    location: 'Toronto, Canada',
    rating: 5,
    trip: 'Family Beach Adventure',
    date: 'August 2024',
    text: 'Perfect family vacation! The kids (ages 8 and 12) had an amazing time. The resort\'s kids club was fantastic, water sports were exciting, and the all-inclusive option made everything stress-free. Albania is so family-friendly and affordable compared to other Mediterranean destinations.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
  },
  {
    name: 'Sophie Laurent',
    location: 'Paris, France',
    rating: 5,
    trip: 'Complete Albania Experience',
    date: 'May 2024',
    text: 'The 12-day tour covered everything - mountains, beaches, historic cities, and local culture. It was perfectly paced with a great mix of activities and relaxation. Albania is Europe\'s best-kept secret, and Discover Albania knows how to show it off!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  },
  {
    name: 'James Murphy',
    location: 'Dublin, Ireland',
    rating: 5,
    trip: 'Adriatic & Ionian Discovery Cruise',
    date: 'October 2024',
    text: 'The cruise along the Albanian coast was spectacular! Each port offered something unique. The ship was comfortable, food was excellent, and the shore excursions were well-organized. Loved exploring the Adriatic from the water. Great value for money!',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  },
  {
    name: 'Anna Kowalski',
    location: 'Warsaw, Poland',
    rating: 5,
    trip: 'Adventure & Eco-Tourism',
    date: 'September 2024',
    text: 'An eco-tourism dream! The focus on sustainable travel and supporting local communities was impressive. We hiked through pristine nature, stayed in family-run guesthouses, and ate farm-to-table meals. Albania\'s natural beauty is unparalleled.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
  }
];

export default function TestimonialsPage() {
  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  const totalReviews = testimonials.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl mb-4">Customer Reviews & Testimonials</h1>
          <p className="text-xl max-w-2xl">
            Hear from travelers who have experienced the magic of Albania with us
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="container mx-auto px-4 py-12">
        <Card className="mb-12">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div>
                <div className="text-6xl mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-gray-600">Based on {totalReviews} reviews</div>
              </div>
              
              <div className="border-l pl-8">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-sm">5 stars</span>
                    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm">{totalReviews}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-sm">4 stars</span>
                    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: '0%' }} />
                    </div>
                    <span className="text-sm">0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-sm">3 stars</span>
                    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: '0%' }} />
                    </div>
                    <span className="text-sm">0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Quote className="w-10 h-10 text-yellow-400 mb-4" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 line-clamp-6">
                  "{testimonial.text}"
                </p>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div>{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.trip} • {testimonial.date}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl mb-8 text-center">Why Travelers Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2">15+</div>
              <div className="text-gray-600">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">10,000+</div>
              <div className="text-gray-600">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-600 to-orange-700 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl mb-4">Ready to Create Your Own Story?</h2>
          <p className="text-xl mb-6">
            Join thousands of satisfied travelers and experience Albania with us
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-orange-700 rounded-lg hover:bg-gray-100 transition-colors">
              View Packages
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-700 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
