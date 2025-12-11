"use client";

import { useEffect, useState } from "react";
import MarketService from "@/services/MarketService";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function PortfolioPage() {
  const { account, connected } = useWallet();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (connected && account?.address) {
      loadPortfolio();
    }
  }, [connected, account]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await MarketService.getPortfolio(account.address);
      setPortfolio(data);
    } catch (e) {
      console.error("Failed to load portfolio", e);
    }
    setLoading(false);
  };

  const filteredBets = portfolio.filter((bet) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return bet.status === "pending";
    if (activeTab === "resolved")
      return bet.status === "won" || bet.status === "lost";
    return true;
  });

  const totalPnL = portfolio.reduce((sum, bet) => {
    if (bet.status === "won") return sum + (bet.payout - bet.amount);
    if (bet.status === "lost") return sum - bet.amount;
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-black">
      {!connected && (
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
          <p className="text-xl">Please connect your wallet to view your portfolio.</p>
        </div>
      )}
      {connected && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">
              Your Portfolio
            </h1>
            <p className="text-gray-400">
              Track your bets and see your performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total Bets</div>
              <div className="text-3xl font-bold text-white">
                {portfolio.length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Win Rate</div>
              <div className="text-3xl font-bold text-white">
                {portfolio.length > 0
                  ? (
                    (portfolio.filter((b) => b.status === "won").length /
                      portfolio.filter((b) => b.status !== "pending").length) *
                    100
                  ).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-1">Total P&L</div>
              <div
                className={`text-3xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {totalPnL >= 0 ? "+" : ""}
                {totalPnL.toFixed(2)} APT
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "all"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("open")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "open"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "resolved"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              Resolved
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading portfolio...</p>
            </div>
          ) : filteredBets.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-400 text-lg mb-4">No bets yet</p>
              <a href="/" className="text-red-400 hover:text-red-300 font-medium">
                Browse markets →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl p-6 hover:border-red-700/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <a
                        href={`/market/${bet.marketId}`}
                        className="text-xl font-bold text-white hover:text-red-400 transition-colors"
                      >
                        {bet.marketTitle}
                      </a>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${bet.side === "A"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                            }`}
                        >
                          {bet.sideName}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${bet.status === "won"
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : bet.status === "lost"
                              ? "bg-red-500/20 text-red-400 border border-red-500/50"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                            }`}
                        >
                          {bet.status === "pending"
                            ? "Pending"
                            : bet.status === "won"
                              ? "Won"
                              : "Lost"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 mb-1">Stake</div>
                        <div className="text-white font-semibold">
                          {bet.amount} APT
                        </div>
                      </div>

                      {bet.status !== "pending" && (
                        <>
                          <div>
                            <div className="text-gray-400 mb-1">Fee (2%)</div>
                            <div className="text-gray-300 font-semibold">
                              {bet.fee} APT
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-400 mb-1">Payout</div>
                            <div className="text-white font-semibold">
                              {bet.payout} APT
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-400 mb-1">P&L</div>
                            <div
                              className={`font-bold ${bet.status === "won"
                                ? "text-green-400"
                                : "text-red-400"
                                }`}
                            >
                              {bet.status === "won" ? "+" : "-"}
                              {bet.status === "won"
                                ? (bet.payout - bet.amount).toFixed(2)
                                : bet.amount}{" "}
                              APT
                            </div>
                          </div>
                        </>
                      )}

                      {bet.status === "pending" && (
                        <div className="col-span-3">
                          <div className="text-gray-400 mb-1">Status</div>
                          <div className="text-yellow-400 font-semibold">
                            Waiting for resolution...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
