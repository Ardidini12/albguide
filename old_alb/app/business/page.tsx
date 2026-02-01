import { Card, CardContent } from '../components/ui/card';
import { Briefcase, Users, Phone, Mail, Car } from 'lucide-react';

const services = [
  {
    icon: Users,
    title: 'Group Bookings',
    description: 'Conference and team travel coordination'
  },
  {
    icon: Briefcase,
    title: '24/7 Support',
    description: 'Dedicated account manager and emergency assistance'
  },
  {
    icon: Car,
    title: 'Airport Pickup',
    description: 'Pick up from Tirana International Airport'
  }
];

export default function BusinessTravelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-12 h-12" />
            <h1 className="text-5xl">Business Travel Solutions</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Streamlined corporate travel management for businesses of all sizes
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Corporate Travel Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything your business needs for efficient, cost-effective travel to Albania
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Card key={idx} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-xl mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Meeting & Event Services */}
        <div className="mb-12">
          <h2 className="text-3xl mb-8 text-center">Meetings & Events in Albania</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl mb-4">Team Building</h3>
                <p className="text-gray-700 mb-4">
                  Combine business with unique team-building experiences in stunning locations.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">•</span>
                    <span>Outdoor adventure activities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">•</span>
                    <span>Cultural experiences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-700">•</span>
                    <span>Beach venues</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        
        {/* Travel Policy Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl mb-4">Reporting & Analytics</h3>
              <p className="text-gray-700 mb-4">
                Comprehensive insights into your travel spending and patterns.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-slate-700 mt-1">✓</span>
                  <span className="text-sm">Monthly travel reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-700 mt-1">✓</span>
                  <span className="text-sm">Cost savings analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-700 mt-1">✓</span>
                  <span className="text-sm">Traveler behavior insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-700 mt-1">✓</span>
                  <span className="text-sm">Custom dashboards</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl mb-4">Ready to Optimize Your Business Travel?</h2>
          <p className="text-xl mb-6">
            Let's discuss how we can support your corporate travel needs
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+355 4 222 3456</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>corporate@discoveralbania.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
