import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0066CC] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <span className="font-semibold text-white">Wifirst Tech Blog</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engineering insights, technical deep-dives, and innovations from the Wifirst team.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/search" className="text-sm text-gray-400 hover:text-white transition-colors">Search</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Wifirst</h3>
            <ul className="space-y-2.5">
              <li><a href="https://www.wifirst.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">wifirst.com</a></li>
              <li><a href="https://www.wifirst.com/en/wifirst/about-us" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Wifirst. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with Next.js &middot; Deployed on Firebase
          </p>
        </div>
      </div>
    </footer>
  );
}
