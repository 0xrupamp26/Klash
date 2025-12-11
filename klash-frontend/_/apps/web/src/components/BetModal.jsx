"use client";

import { useState } from "react";

export default function BetModal({
  isOpen,
  onClose,
  onConfirm,
  selectedSide,
  market,
}) {
  const [step, setStep] = useState(1); // 1 = player count, 2 = amount
  const [amount, setAmount] = useState("");

  const handlePlayerCountSelect = () => {
    setStep(2);
  };

  const handleConfirm = () => {
    if (amount && parseFloat(amount) > 0) {
      onConfirm(parseFloat(amount));
      setStep(1);
      setAmount("");
    }
  };

  const handleClose = () => {
    setStep(1);
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  const sideName = selectedSide === "A" ? market?.sideA : market?.sideB;
  const sideColor = selectedSide === "A" ? "green" : "red";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-red-900/30 rounded-2xl max-w-md w-full shadow-2xl shadow-red-900/20">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {step === 1 ? "Select Player Count" : "Place Your Bet"}
              </h2>
              <p className="text-gray-400 text-sm">
                {step === 1
                  ? "How many players should this market run with?"
                  : `Betting on: ${sideName}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-3">
              {/* 2 Players - Enabled */}
              <button
                onClick={handlePlayerCountSelect}
                className="w-full text-left p-4 bg-gradient-to-r from-red-600/20 to-red-700/20 border-2 border-red-500/50 hover:border-red-400 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-red-400 transition-colors">
                      Exactly 2 players (1v1)
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Winner takes all. 2% platform fee from total pool.
                    </p>
                  </div>
                  <div className="text-red-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* More Players - Disabled */}
              <div className="relative">
                <div className="w-full text-left p-4 bg-zinc-800/30 border-2 border-zinc-700/50 rounded-xl opacity-50 cursor-not-allowed">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-gray-400 font-bold text-lg mb-1">
                        More than 2 players
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Coming soon in future updates
                      </p>
                    </div>
                    <div className="text-gray-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Side indicator */}
              <div
                className={`p-4 bg-${sideColor}-500/10 border border-${sideColor}-500/30 rounded-lg`}
              >
                <div
                  className={`text-${sideColor}-400 text-xs font-semibold mb-1`}
                >
                  YOUR SIDE
                </div>
                <div className="text-white font-medium">{sideName}</div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Bet Amount (APT)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white text-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Info */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Market type:</span>
                  <span className="text-white">1v1 (2 players)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Platform fee:</span>
                  <span className="text-white">2% of total pool</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Potential payout:</span>
                  <span className="text-green-400 font-semibold">
                    {amount ? (parseFloat(amount) * 1.96).toFixed(2) : "0.00"}{" "}
                    APT
                  </span>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-zinc-700 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/30 disabled:shadow-none"
              >
                Confirm Bet
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to player count
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
