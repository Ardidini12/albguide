import Link from 'next/link';
import { Plane, Phone, Mail, MapPin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-serif text-white">Discover Albania</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              Your trusted partner for unforgettable Albanian adventures. Explore the hidden gem of the Balkans with expert guidance.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-700 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/packages" className="hover:text-white transition-colors">Vacation Packages</Link></li>
              <li><Link href="/guides" className="hover:text-white transition-colors">Destination Guides</Link></li>
              <li><Link href="/testimonials" className="hover:text-white transition-colors">Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/group-travel" className="hover:text-white transition-colors">Group Travel</Link></li>
              <li><Link href="/business" className="hover:text-white transition-colors">Business Travel</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Rruga Dëshmorët e Kombit, Tirana, Albania</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+355 4 222 3456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@discoveralbania.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/emergency" className="inline-block px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors text-sm">
                24/7 Emergency Support
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 Discover Albania. All rights reserved. | 
            <a href="#" className="hover:text-white ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-white ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
