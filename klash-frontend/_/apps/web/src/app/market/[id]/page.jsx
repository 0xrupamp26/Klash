"use client";

import { useEffect, useState } from "react";
import MarketService from "@/services/MarketService";
import BetModal from "@/components/BetModal";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { betApi } from "@/services/api-client"; // Direct import or via MarketService wrapper

export default function MarketDetailPage({ params }) {
  const { account, connected, signAndSubmitTransaction, network } = useWallet();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Checking status
  const walletConnected = connected;
  const correctNetwork = network?.name?.toLowerCase().includes("testnet") || true; // Relaxed for dev
  const [hasBalance, setHasBalance] = useState(true); // Let's auto-assume true or check async

  useEffect(() => {
    loadMarket();
    // checkWalletStatus(); // Handled by hook now
  }, [params.id, connected]);

  const loadMarket = async () => {
    setLoading(true);
    const data = await MarketService.getMarketById(params.id);
    setMarket(data);
    setLoading(false);
  };

  const handlePlaceBet = (side) => {
    if (!connected) return alert("Please connect your wallet first");
    setSelectedSide(side);
    setShowModal(true);
  };

  const handleConfirmBet = async (amount) => {
    try {
      const contractMarketAddress = market.onChainMarketId || "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138";
      const amountOctas = Math.floor(parseFloat(amount) * 100000000);

      const payload = {
        type: "entry_function_payload",
        function: `${contractMarketAddress}::market::place_bet`,
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          contractMarketAddress,
          (selectedSide === "A" ? 0 : 1).toString(),
          amountOctas.toString()
        ]
      };

      const response = await signAndSubmitTransaction({ payload });
      const txHash = response.hash || response;

      await MarketService.placeBet(
        params.id,
        selectedSide,
        amount,
        account.address,
        txHash
      );

      alert("Bet placed successfully!");
      setShowModal(false);
      loadMarket();

    } catch (e) {
      console.error(e);
      alert("Bet failed: " + (e.message || e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading market...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Market not found</p>
          <a
            href="/"
            className="text-red-400 hover:text-red-300 mt-4 inline-block"
          >
            ← Back to markets
          </a>
        </div>
      </div>
    );
  }

  const totalStake = market.totalStakeA + market.totalStakeB;
  const percentageA =
    totalStake > 0 ? (market.totalStakeA / totalStake) * 100 : 50;
  const percentageB =
    totalStake > 0 ? (market.totalStakeB / totalStake) * 100 : 50;
  const canTrade = walletConnected && correctNetwork && hasBalance;
  const isResolved = market.status === "resolved";
  const isLocked = market.status === "locked";

  return (
    <div className="min-h-screen bg-black">
      {!walletConnected && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 py-3">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-yellow-400 font-medium">
              Connect your wallet to place bets
            </p>
          </div>
        </div>
      )}

      {walletConnected && !correctNetwork && (
        <div className="bg-orange-500/10 border-b border-orange-500/30 py-3">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-orange-400 font-medium">
              Switch to Aptos Testnet to trade
            </p>
          </div>
        </div>
      )}

      {walletConnected && correctNetwork && !hasBalance && (
        <div className="bg-blue-500/10 border-b border-blue-500/30 py-3">
          <div className="max-w-7xl mx-auto px-4 text-center flex items-center justify-center gap-3">
            <p className="text-blue-400 font-medium">
              You need testnet APT to place bets
            </p>
            <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors">
              Get Testnet APT
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a
          href="/"
          className="text-gray-400 hover:text-white inline-flex items-center gap-2 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to markets
        </a>

        <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-2xl p-8 mb-6">
          <h1 className="text-4xl font-black text-white mb-4">
            {market.title}
          </h1>
          <p className="text-gray-300 text-lg mb-6">{market.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-gray-300 rounded-full">
              Closes: {new Date(market.closeTime).toLocaleDateString()}
            </span>
            <span className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-gray-300 rounded-full">
              Total Pool: {totalStake} APT
            </span>
            {isResolved && market.winner && (
              <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full font-semibold">
                Winner: Side {market.winner}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div
            className={`bg-gradient-to-br from-green-950/30 to-black border-2 rounded-2xl p-6 transition-all ${isResolved && market.winner === "A"
              ? "border-green-500 shadow-xl shadow-green-900/30"
              : "border-green-500/30"
              }`}
          >
            <div className="text-green-400 text-sm font-bold mb-2">SIDE A</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {market.sideA}
            </h3>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-4xl font-black text-white">
                  {percentageA.toFixed(0)}%
                </span>
                <span className="text-gray-400">{market.totalStakeA} APT</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${percentageA}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={() => handlePlaceBet("A")}
              disabled={!canTrade || isResolved || isLocked}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
            >
              {isResolved
                ? "Market Resolved"
                : isLocked
                  ? "Market Locked"
                  : "Bet on Side A"}
            </button>
          </div>

          <div
            className={`bg-gradient-to-br from-red-950/30 to-black border-2 rounded-2xl p-6 transition-all ${isResolved && market.winner === "B"
              ? "border-red-500 shadow-xl shadow-red-900/30"
              : "border-red-500/30"
              }`}
          >
            <div className="text-red-400 text-sm font-bold mb-2">SIDE B</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {market.sideB}
            </h3>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-4xl font-black text-white">
                  {percentageB.toFixed(0)}%
                </span>
                <span className="text-gray-400">{market.totalStakeB} APT</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${percentageB}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={() => handlePlaceBet("B")}
              disabled={!canTrade || isResolved || isLocked}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
            >
              {isResolved
                ? "Market Resolved"
                : isLocked
                  ? "Market Locked"
                  : "Bet on Side B"}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-white font-semibold">2% platform fee</span>{" "}
            taken from the total pool.
            <span className="text-green-400 font-semibold">
              {" "}
              98% goes to the winner.
            </span>
          </p>
        </div>

        {market.currentBets && market.currentBets.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Current Bets</h3>
            <div className="space-y-2">
              {market.currentBets.map((bet, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-black/40 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${bet.side === "A"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      Side {bet.side}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Player {idx + 1}
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    {bet.amount} APT
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBet}
        selectedSide={selectedSide}
        market={market}
      />
    </div>
  );
}
