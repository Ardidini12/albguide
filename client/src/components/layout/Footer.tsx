import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <div className="font-serif text-white">Discover Albania</div>
              </div>
            </div>
            <p className="text-sm">
              Your trusted partner for unforgettable Albanian adventures.
            </p>
          </div>

          <div>
            <h3 className="text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="hover:text-white" to="/packages">
                  Vacation Packages
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/destinations">
                  Destinations
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/services">
                  Services
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/support">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Group Travel</li>
              <li>Business Travel</li>
              <li>Airport Pickup (Tirana Airport)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Tirana, Albania</li>
              <li>
                <Link className="hover:text-white" to="/contact">
                  Contact us
                </Link>
              </li>
              <li>
                <a className="hover:text-white" href="mailto:support@discoveralbania.com">
                  support@discoveralbania.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-white mb-3">Legal & Help</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Link className="hover:text-white" to="/terms">
                Terms of Use
              </Link>
              <Link className="hover:text-white" to="/privacy">
                Privacy and Cookies Statement
              </Link>
              <Link className="hover:text-white" to="/cookie-consent">
                Cookie consent
              </Link>
              <Link className="hover:text-white" to="/sitemap">
                Site Map
              </Link>
              <Link className="hover:text-white" to="/how-it-works">
                How the site works
              </Link>
              <Link className="hover:text-white" to="/contact">
                Contact us
              </Link>
              <Link className="hover:text-white" to="/accessibility">
                Accessibility Statement
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white mb-3">Get in touch</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="hover:text-white" href="mailto:support@discoveralbania.com">
                  Support email
                </a>
              </li>
              <li>Support phone</li>
              <li>WhatsApp</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
          <p>&copy; 2026 Discover Albania. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
