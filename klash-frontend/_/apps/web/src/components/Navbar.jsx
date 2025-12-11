export default function Navbar() {
  return (
    <nav className="bg-black border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3">
              <img
                src="https://ucarecdn.com/42b8dc56-eed4-40db-811d-2defe2e0c420/-/format/auto/"
                alt="Klash Logo"
                className="h-10 w-auto"
              />
            </a>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Markets
              </a>
              <a
                href="/portfolio"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Portfolio
              </a>
              <a
                href="/about"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                About
              </a>
            </div>
          </div>

          {/* Right side - Wallet & Network */}
          <div className="flex items-center gap-3">
            {/* Network pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Aptos Testnet
              </span>
            </div>

            {/* Connect Wallet button */}
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-900/50">
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-3 flex gap-4 border-t border-red-900/30 pt-3">
          <a
            href="/"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Markets
          </a>
          <a
            href="/portfolio"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            Portfolio
          </a>
          <a
            href="/about"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            About
          </a>
        </div>
      </div>
    </nav>
  );
}
