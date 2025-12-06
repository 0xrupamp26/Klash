import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, TrendingUp, MessageSquare, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { marketApi, betApi } from "@/services/api-client";
import { PlayerCountModal } from "@/components/PlayerCountModal";
import { walletService } from "@/services/wallet-service";
import { websocketService } from "@/services/websocket-service";
import { toast } from "sonner";

const MarketDetail = () => {
  const { id } = useParams();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [placingBet, setPlacingBet] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!id) return;
      try {
        const response = await marketApi.getMarket(id);
        if (response.success && response.data) {
          setMarket(response.data);
        }
      } catch (error) {
        console.error('Error fetching market:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
    fetchMarket();
  }, [id]);

  // Load Twitter Widget Script
  useEffect(() => {
    if (market?.metadata?.embedHtml) {
      const script = document.createElement('script');
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      }
    }
  }, [market]);

  // WebSocket integration
  useEffect(() => {
    if (!id) return;

    websocketService.connect();
    websocketService.joinMarket(id);

    websocketService.onPlayerJoined((data) => {
      toast.success(`Player joined! ${data.currentPlayerCount}/${data.playerLimit} players`);
      // Refresh market data
      fetchMarketData();
    });

    websocketService.onMarketStatusChanged((data) => {
      toast.info(`Market status: ${data.status}`);
      fetchMarketData();
    });

    websocketService.onMarketResolved((data) => {
      toast.success(`Market resolved! Winner: ${data.winningAnswer}`);
      fetchMarketData();
    });

    return () => {
      websocketService.leaveMarket(id);
      websocketService.removeAllListeners();
    };
  }, [id]);

  const fetchMarketData = async () => {
    if (!id) return;
    try {
      const response = await marketApi.getMarket(id);
      if (response.success && response.data) {
        setMarket(response.data);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await walletService.connectWallet();
      setWalletAddress(address);
      let balance = await walletService.getBalance(address);

      // Auto-fund if balance is 0 (Demo User Experience)
      if (balance <= 0) {
        toast.info("Balance is 0. Requesting Testnet Faucet...");
        try {
          await walletService.fundAccount(address);
          balance = await walletService.getBalance(address);
          toast.success("Wallet Funded with 1 APT!");
        } catch (e) {
          console.error("Faucet failed", e);
          toast.error("Could not fund wallet. Please use official faucet.");
        }
      } else {
        toast.success(`Wallet connected! Balance: ${balance} APT`);
      }

      setWalletBalance(balance);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error("Failed to connect wallet");
    }
  };

  const handlePlaceBetClick = () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    setShowPlayerModal(true);
  };

  const handlePlayerCountSelected = async (playerLimit: number) => {
    if (!market || !betAmount || !walletAddress) return;

    setPlacingBet(true);
    try {
      // 1. Create Transaction Payload (Transfer APT to Klash Treasury)
      // Using a fixed dummy address for demo treasury
      const treasuryAddress = "0x1";
      const amountOctas = Math.floor(parseFloat(betAmount) * 100000000); // Convert APT to Octas

      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [treasuryAddress, amountOctas.toString()],
      };

      // 2. Sign and Submit via Wallet
      toast.loading("Please sign the transaction in your wallet...");
      const txHash = await walletService.signAndSubmitTransaction(payload as any);
      toast.dismiss();
      toast.success("Transaction submitted!", { description: `Hash: ${txHash.slice(0, 10)}...` });

      // 3. Call Backend API
      await betApi.placeBet({
        marketId: market.marketId,
        outcome: selectedSide === "yes" ? 0 : 1,
        amount: parseFloat(betAmount),
        walletAddress,
        transactionHash: txHash, // Send hash to backend
      });

      toast.success("Bet placed successfully!");
      setBetAmount("");

      // Refresh market data
      await fetchMarketData();

      // Update wallet balance
      const newBalance = await walletService.getBalance();
      setWalletBalance(newBalance);
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast.error(error.response?.data?.message || "Failed to place bet");
    } finally {
      setPlacingBet(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-white">Market not found</div>
        </div>
      </div>
    );
  }

  const totalPool = market.pools?.total || 0;
  const yesPool = market.pools?.outcomeA || 0;
  const noPool = market.pools?.outcomeB || 0;
  const yesPercentage = totalPool > 0 ? (yesPool / totalPool) * 100 : 50;
  const currentPlayers = market.currentPlayers?.length || 0;
  const playerLimit = market.playerLimit || 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-purple-300 hover:text-purple-100 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Link>

        {/* Wallet Connection */}
        {!walletAddress ? (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none mb-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Connect Wallet to Place Bets</h3>
                <p className="text-purple-100 text-sm">Get 1 APT from testnet faucet automatically</p>
              </div>
              <Button onClick={handleConnectWallet} className="bg-white text-purple-600 hover:bg-gray-100">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-purple-900/50 border-purple-500 mb-6 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-purple-300">Wallet Address</p>
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs py-0 h-5">
                    Aptos Testnet
                  </Badge>
                </div>
                <p className="font-mono text-sm">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-300">Balance</p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="font-bold">{walletBalance.toFixed(4)} APT</p>
                  {walletBalance < 0.1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 text-xs bg-purple-600 hover:bg-purple-700 text-white border-0"
                      onClick={async () => {
                        try {
                          toast.loading("Requesting funds...");
                          await walletService.fundAccount(walletAddress);
                          const bal = await walletService.getBalance(walletAddress);
                          setWalletBalance(bal);
                          toast.dismiss();
                          toast.success("Funded 1 APT!");
                        } catch (e) {
                          toast.dismiss();
                          toast.error("Faucet failed. Try again.");
                        }
                      }}
                    >
                      Get Funds
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Market Status */}
        <Card className="bg-purple-900/50 border-purple-500 mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`
              ${market.status === 'WAITING_PLAYERS' ? 'bg-yellow-500' : ''}
              ${market.status === 'ACTIVE' ? 'bg-green-500' : ''}
              ${market.status === 'RESOLVED' ? 'bg-blue-500' : ''}
            `}>
              {market.status}
            </Badge>
            <div className="flex items-center gap-4 text-purple-300">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">{currentPlayers}/{playerLimit} Players</span>
              </div>
            </div>
          </div>

          {market.metadata?.embedHtml ? (
            <div className="mb-6 flex justify-center">
              <div dangerouslySetInnerHTML={{ __html: market.metadata.embedHtml }} />
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-white mb-4">{market.question}</h1>
          )}

          {/* Fallback Question Display if embed is present but we still want to show the question clearly above/below if needed, 
              but user asked to replace content with blockquote. 
              Let's keep question as title if not embedded, or maybe above embed? 
              User said: "replace the current frontend markets and replace with [tweet] with the question [Question] under which..."
              So: Question -> Tweet -> Betting Interface.
          */}

          {market.metadata?.embedHtml && (
            <h1 className="text-2xl font-bold text-white mb-4 text-center">{market.question}</h1>
          )}

          {market.metadata?.tweetUrl && !market.metadata?.embedHtml && (
            <a
              href={market.metadata.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-100 text-sm flex items-center gap-2 mb-4"
            >
              <MessageSquare className="h-4 w-4" />
              View Original Tweet
            </a>
          )}

          {market.metadata?.description && (
            <p className="text-purple-200 mb-4 text-center">{market.metadata.description}</p>
          )}
        </Card>

        {/* Betting Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-purple-900/50 border-purple-500 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Place Your Bet</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedSide("yes")}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedSide === "yes"
                    ? "border-green-500 bg-green-500/20"
                    : "border-purple-500 hover:border-green-500/50"
                    }`}
                >
                  <div className="text-white font-bold mb-2">YES</div>
                  <div className="text-purple-300 text-sm">{yesPercentage.toFixed(1)}%</div>
                </button>

                <button
                  onClick={() => setSelectedSide("no")}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedSide === "no"
                    ? "border-red-500 bg-red-500/20"
                    : "border-purple-500 hover:border-red-500/50"
                    }`}
                >
                  <div className="text-white font-bold mb-2">NO</div>
                  <div className="text-purple-300 text-sm">{(100 - yesPercentage).toFixed(1)}%</div>
                </button>
              </div>

              <div className="mb-4">
                <label className="text-purple-300 text-sm mb-2 block">Bet Amount (APT)</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-purple-950 border-purple-500 text-white"
                  disabled={!walletAddress || market.status !== 'WAITING_PLAYERS'}
                />
              </div>

              <Button
                onClick={handlePlaceBetClick}
                disabled={!walletAddress || placingBet || market.status !== 'WAITING_PLAYERS'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {placingBet ? "Placing Bet..." : "Place Bet"}
              </Button>

              {market.status !== 'WAITING_PLAYERS' && (
                <p className="text-yellow-400 text-sm mt-2 text-center">
                  Market is {market.status.toLowerCase()}. Betting is closed.
                </p>
              )}
            </Card>
          </div>

          <div>
            <Card className="bg-purple-900/50 border-purple-500 p-6">
              <h3 className="text-white font-bold mb-4">Market Stats</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Total Pool</span>
                    <span className="text-white font-bold">{totalPool} APT</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Platform Fee</span>
                    <span className="text-white">{market.platformFeePercent || 2}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Current Players</span>
                    <span className="text-white">{currentPlayers}/{playerLimit}</span>
                  </div>
                  <Progress value={(currentPlayers / playerLimit) * 100} className="h-2" />
                </div>

                {market.status === 'RESOLVED' && market.winningOutcome !== undefined && (
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mt-4">
                    <p className="text-green-400 font-bold text-center">
                      Winner: {market.outcomes[market.winningOutcome]}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PlayerCountModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onSelectPlayerCount={handlePlayerCountSelected}
        currentPlayerCount={currentPlayers}
        loading={placingBet}
      />
    </div>
  );
};

export default MarketDetail;
