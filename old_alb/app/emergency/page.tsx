import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Phone, Mail, MapPin, AlertCircle, Hospital, Shield, Globe, Clock } from 'lucide-react';

const emergencyContacts = [
  {
    service: '24/7 Travel Hotline',
    number: '+355 800 911 911',
    icon: Phone,
    description: 'Our emergency travel support line - available anytime'
  },
  {
    service: 'Emergency Email',
    contact: 'emergency@discoveralbania.com',
    icon: Mail,
    description: 'For non-urgent emergency assistance'
  },
  {
    service: 'WhatsApp Support',
    number: '+355 69 911 911',
    icon: Phone,
    description: 'Quick messaging for urgent help'
  }
];

const localEmergencies = [
  {
    service: 'Police',
    number: '129',
    icon: Shield
  },
  {
    service: 'Ambulance',
    number: '127',
    icon: Hospital
  },
  {
    service: 'Fire Department',
    number: '128',
    icon: AlertCircle
  },
  {
    service: 'Universal Emergency',
    number: '112',
    icon: Globe
  }
];

const scenarios = [
  {
    title: 'Lost Passport',
    icon: AlertCircle,
    steps: [
      'Call our 24/7 hotline immediately',
      'File a police report (we can assist)',
      'Contact your embassy (we provide addresses)',
      'We help with temporary travel documents'
    ]
  },
  {
    title: 'Medical Emergency',
    icon: Hospital,
    steps: [
      'Call 127 or 112 for immediate help',
      'Contact our emergency line',
      'We coordinate with hospitals and insurance',
      'Arrange medical evacuation if needed'
    ]
  },
  {
    title: 'Lost Luggage',
    icon: AlertCircle,
    steps: [
      'Report to airline immediately',
      'Contact our support team',
      'We liaise with airline on your behalf',
      'Arrange emergency essentials if needed'
    ]
  },
  {
    title: 'Travel Disruption',
    icon: Globe,
    steps: [
      'Call our 24/7 support line',
      'We rebook flights/hotels',
      'Arrange alternative transport',
      'Handle insurance claims'
    ]
  }
];

const hospitals = [
  {
    name: 'University Hospital Center Mother Teresa',
    location: 'Tirana',
    phone: '+355 4 237 2150',
    type: 'Full service hospital'
  },
  {
    name: 'American Hospital',
    location: 'Tirana',
    phone: '+355 4 239 4444',
    type: 'Private hospital (English-speaking)'
  },
  {
    name: 'Regional Hospital',
    location: 'Saranda',
    phone: '+355 85 222 229',
    type: 'Emergency services'
  }
];

export default function EmergencySupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-5xl">24/7 Emergency Support</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Round-the-clock assistance for any travel emergency in Albania
          </p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-2 border-red-700 rounded-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-8 h-8 text-red-700" />
            <h2 className="text-3xl">Emergency Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, idx) => {
              const Icon = contact.icon;
              return (
                <Card key={idx} className="border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-red-700" />
                    </div>
                    <h3 className="text-xl mb-2">{contact.service}</h3>
                    <div className="text-2xl text-red-700 mb-2">
                      {contact.number || contact.contact}
                    </div>
                    <p className="text-sm text-gray-600">{contact.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Local Emergency Services */}
        <div className="mb-12">
          <h2 className="text-3xl mb-8 text-center">Albanian Emergency Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {localEmergencies.map((emergency, idx) => {
              const Icon = emergency.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="mb-2">{emergency.service}</h3>
                    <div className="text-2xl text-blue-700">{emergency.number}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            * 112 is the universal emergency number that works throughout Europe
          </p>
        </div>

        {/* Emergency Scenarios */}
        <div className="mb-12">
          <h2 className="text-3xl mb-8 text-center">What to Do in Common Emergencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scenarios.map((scenario, idx) => {
              const Icon = scenario.icon;
              return (
                <Card key={idx}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-orange-700" />
                      </div>
                      <h3 className="text-2xl">{scenario.title}</h3>
                    </div>
                    <ol className="space-y-3">
                      {scenario.steps.map((step, sidx) => (
                        <li key={sidx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-700 text-white rounded-full flex items-center justify-center text-sm">
                            {sidx + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Medical Facilities */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-12">
          <h2 className="text-3xl mb-8 text-center">Major Medical Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitals.map((hospital, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Hospital className="w-5 h-5 text-red-700 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">{hospital.name}</h3>
                      <p className="text-sm text-gray-600">{hospital.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>{hospital.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${hospital.phone}`} className="hover:text-red-700">
                        {hospital.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Embassy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl mb-6">Embassy Contacts</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="mb-1">US Embassy - Tirana</h4>
                  <p className="text-gray-600">+355 4 224 7285</p>
                  <p className="text-gray-600">Rruga Stavros Vinjau, Nr. 14</p>
                </div>
                <div>
                  <h4 className="mb-1">British Embassy - Tirana</h4>
                  <p className="text-gray-600">+355 4 223 4973</p>
                  <p className="text-gray-600">Rruga Skënderbej 12</p>
                </div>
                <div>
                  <h4 className="mb-1">Canadian Embassy</h4>
                  <p className="text-gray-600">+355 4 225 7274</p>
                  <p className="text-gray-600">Represented through Italian Embassy</p>
                </div>
                <p className="text-gray-600 italic pt-2">
                  We maintain a comprehensive list of all embassies and can provide contact information for your country.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl mb-6">Our Support Services</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>24/7 phone support in multiple languages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Hospital className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>Medical emergency coordination</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>Travel insurance claim assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>Embassy and consulate liaison</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>Emergency rebooking services</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <span>Local guide and translator services</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Safety Tips */}
        <div className="bg-blue-50 rounded-lg p-8 mb-12">
          <h3 className="text-2xl mb-6 text-center">Travel Safety Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div>
              <h4 className="mb-3">Before You Go</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Register with your embassy</li>
                <li>• Copy important documents</li>
                <li>• Share itinerary with family</li>
                <li>• Get travel insurance</li>
                <li>• Save emergency numbers</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3">During Your Trip</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Keep valuables secure</li>
                <li>• Stay in well-lit areas</li>
                <li>• Use hotel safes</li>
                <li>• Be aware of surroundings</li>
                <li>• Keep phone charged</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3">In Case of Emergency</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Stay calm</li>
                <li>• Call emergency services</li>
                <li>• Contact our 24/7 hotline</li>
                <li>• Follow local instructions</li>
                <li>• Document everything</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl mb-4">We're Here When You Need Us</h2>
          <p className="text-xl mb-6">
            Save these emergency contacts before your trip
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-sm mb-2">24/7 Emergency Hotline</div>
              <div className="text-4xl mb-2">+355 800 911 911</div>
              <div className="text-sm">Save this number in your phone now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
