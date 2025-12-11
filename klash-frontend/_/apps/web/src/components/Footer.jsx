export default function Footer() {
  return (
    <footer className="bg-black border-t border-red-900/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Klash</h3>
          <p className="text-red-400 text-lg font-semibold mb-4">
            "Put Your Money, Where the Mouth Is"
          </p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Alpha – Testnet only, no real money. This platform is for UX testing
            purposes only. All transactions use testnet tokens with no
            real-world value.
          </p>
          <div className="mt-6 text-gray-500 text-xs">
            © 2025 Klash. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
