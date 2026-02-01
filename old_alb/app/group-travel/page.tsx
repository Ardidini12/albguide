import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Calendar, DollarSign, Gift, Check, Phone, Mail,} from 'lucide-react';
import Link from 'next/link';


const groupTypes = [
  {
    title: 'School & Student Groups',
    icon: Users,
    description: 'Educational tours with cultural and historical focus',
    minSize: '15 students',
    benefits: ['Private group transport', 'Educational materials', 'Interactive workshops', 'Safe accommodation']
  },
  {
    title: 'Corporate Groups',
    icon: Users,
    description: 'Team building and corporate retreat packages',
    minSize: '10 participants',
    benefits: ['Meeting facilities', 'Team activities', 'Corporate rates', 'Flexible scheduling']
  },
  {
    title: 'Friends & Family',
    icon: Users,
    description: 'Multi-generational and friend group vacations',
    minSize: '8 people',
    benefits: ['Group discount', 'Flexible itineraries', 'Private transport', 'Family-friendly hotels']
  },
  {
    title: 'Special Interest',
    icon: Users,
    description: 'Photography, hiking, culinary, or other themed groups',
    minSize: '12 people',
    benefits: ['Expert guides', 'Specialized activities', 'Like-minded travelers', 'Unique experiences']
  }
];

const benefits = [
  { icon: DollarSign, title: 'Group Discounts', description: 'Exclusive group tier pricing' },
  { icon: Calendar, title: 'Flexible Dates', description: 'Choose dates that work for your group' },
  { icon: Gift, title: 'Free Upgrades', description: 'Complimentary perks for larger groups' },
  { icon: Users, title: 'Private Guide', description: 'Dedicated guide for groups 15+' }
];

export default function GroupTravelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-12 h-12" />
            <h1 className="text-5xl">Group Travel Services</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Special rates and tailored experiences for groups. Travel together and save!
          </p>
        </div>
      </div>

      {/* Group Types */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Group Travel Options</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We specialize in creating memorable experiences for all types of groups
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {groupTypes.map((type, idx) => {
            const Icon = type.icon;
            return (
              <Card key={idx} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl mb-2">{type.title}</h3>
                      <p className="text-gray-700 mb-3">{type.description}</p>
                      <p className="text-sm text-teal-700">
                        Minimum: {type.minSize}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm mb-3">Included Benefits:</h4>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, bidx) => (
                        <li key={bidx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-teal-700 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-12">
          <h2 className="text-3xl mb-8 text-center">Group Travel Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-teal-700" />
                  </div>
                  <h3 className="text-xl mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

         

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl mb-4">Plan Your Group Adventure</h2>
          <p className="text-xl mb-6">
            Get a free, no-obligation quote for your group today
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100" asChild>
                <Link href="/booking">Book Now</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+355 4 222 3456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>groups@discoveralbania.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
