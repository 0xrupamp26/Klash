export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <img
            src="https://ucarecdn.com/42b8dc56-eed4-40db-811d-2defe2e0c420/-/format/auto/"
            alt="Klash Logo"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-5xl font-black text-white mb-4">
            Put Your Money,
            <br />
            Where the Mouth Is
          </h1>
          <p className="text-xl text-gray-400">
            The first 1v1 prediction market on Aptos testnet
          </p>
        </div>

        {/* What is Klash */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-2xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">What is Klash?</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Klash is a prediction market platform that lets you back your
            beliefs with real stakes. Unlike traditional markets with complex
            odds and multiple participants, Klash focuses on simple,
            head-to-head matchups where two players put their money on opposite
            sides of a controversy.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Winner takes all (minus a small platform fee). No complicated math,
            no pooling with strangers — just you, your opponent, and the truth.
          </p>
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-2xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-300">
                  Make sure you're on Aptos testnet with some testnet APT. Don't
                  have any? We'll point you to a faucet to get started.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Pick a Controversy
                </h3>
                <p className="text-gray-300">
                  Browse live markets on hot topics in crypto, DeFi, and
                  blockchain tech. Find something you have a strong opinion
                  about.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Choose Your Side & Stake
                </h3>
                <p className="text-gray-300">
                  Pick Side A or Side B, decide how much to bet, and confirm.
                  You'll be matched with an opponent who chose the opposite
                  side.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Wait for Resolution
                </h3>
                <p className="text-gray-300">
                  Once the market closes and the outcome is determined, the
                  winner receives 98% of the total pool (2% goes to the
                  platform).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Testnet Only</h3>
            <p className="text-gray-300">
              This is an alpha version running on Aptos testnet. No real money
              involved — just pure UX testing and experimentation.
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-500/30 rounded-xl p-6">
            <div className="text-red-400 text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">1v1 Markets</h3>
            <p className="text-gray-300">
              For this alpha, all markets are 2-player, winner-takes-all.
              Multi-player pools are coming in future updates.
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-3xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">
              2% Platform Fee
            </h3>
            <p className="text-gray-300">
              We take a small 2% cut from the total pool to sustain the
              platform. The remaining 98% goes straight to the winner.
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-3xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Transparent & Fair
            </h3>
            <p className="text-gray-300">
              All market logic runs on-chain. No hidden fees, no manipulation —
              just transparent, verifiable outcomes.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
          <p className="text-yellow-400 font-semibold text-lg mb-2">
            ⚠️ Alpha Version – For Testing Only
          </p>
          <p className="text-gray-300">
            Klash is currently in alpha and runs exclusively on Aptos testnet.
            No real money is at stake. This version is for UX testing and
            feedback collection. Use at your own discretion and have fun!
          </p>
        </div>
      </div>
    </div>
  );
}
