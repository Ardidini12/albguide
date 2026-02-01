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
              <li>Vacation Packages</li>
              <li>Destinations</li>
              <li>Customer Reviews</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Group Travel</li>
              <li>Business Travel</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Tirana, Albania</li>
              <li>info@discoveralbania.com</li>
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
