export default function MarketCard({ market }) {
  const totalStake = market.totalStakeA + market.totalStakeB;
  const percentageA =
    totalStake > 0 ? (market.totalStakeA / totalStake) * 100 : 50;
  const percentageB =
    totalStake > 0 ? (market.totalStakeB / totalStake) * 100 : 50;

  const statusColors = {
    open: "bg-green-500/10 border-green-500/30 text-green-400",
    waiting: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    locked: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    resolved: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };

  const statusLabels = {
    open: "Open",
    waiting: "Waiting for Opponent",
    locked: "Locked",
    resolved: "Resolved",
  };

  return (
    <a href={`/market/${market.id}`}>
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-red-900/20 hover:border-red-700/50 rounded-xl p-6 transition-all hover:shadow-xl hover:shadow-red-900/20 cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white flex-1 pr-4">
            {market.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[market.status]}`}
          >
            {statusLabels[market.status]}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
          {market.description}
        </p>

        {/* Sides */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/40 border border-green-500/20 rounded-lg p-3">
            <div className="text-green-400 text-xs font-semibold mb-1">
              SIDE A
            </div>
            <div className="text-white text-sm font-medium mb-2">
              {market.sideA}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {percentageA.toFixed(0)}%
              </span>
              <span className="text-gray-500 text-xs">
                {market.totalStakeA} APT
              </span>
            </div>
          </div>

          <div className="bg-black/40 border border-red-500/20 rounded-lg p-3">
            <div className="text-red-400 text-xs font-semibold mb-1">
              SIDE B
            </div>
            <div className="text-white text-sm font-medium mb-2">
              {market.sideB}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {percentageB.toFixed(0)}%
              </span>
              <span className="text-gray-500 text-xs">
                {market.totalStakeB} APT
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-zinc-800">
          <span>Closes {new Date(market.closeTime).toLocaleDateString()}</span>
          <span className="text-red-400 hover:text-red-300">View Market →</span>
        </div>
      </div>
    </a>
  );
}
