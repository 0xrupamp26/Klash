"use client";

import { useEffect, useState } from "react";
import MarketCard from "@/components/MarketCard";
import MarketService from "@/services/MarketService";

export default function HomePage() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    setLoading(true);
    const data = await MarketService.getMarkets();
    setMarkets(data);
    setLoading(false);
  };

  const filteredMarkets = markets.filter((market) => {
    if (filter === "all") return true;
    if (filter === "open")
      return market.status === "open" || market.status === "waiting";
    if (filter === "resolved") return market.status === "resolved";
    return true;
  });

  return (
    <div className="min-h-screen bg-black">
      <div className="relative bg-gradient-to-b from-red-950/20 via-black to-black border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <img
            src="https://ucarecdn.com/42b8dc56-eed4-40db-811d-2defe2e0c420/-/format/auto/"
            alt="Klash Logo"
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Put Your Money,
            <br />
            Where the Mouth Is
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            The first 1v1 prediction market on Aptos testnet. Take a stance,
            back it up, and let the best prediction win.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-medium">
              2-Player Markets
            </span>
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full font-medium">
              Aptos Testnet
            </span>
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full font-medium">
              2% Platform Fee
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-white">Live Markets</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "all"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "open"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === "resolved"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:text-white"
                }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading markets...</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No markets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
