import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';

interface PlayerCountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlayerCount: (playerLimit: number) => void;
    currentPlayerCount: number;
}

export const PlayerCountModal: React.FC<PlayerCountModalProps> = ({
    isOpen,
    onClose,
    onSelectPlayerCount,
    currentPlayerCount,
}) => {
    const [selectedCount, setSelectedCount] = useState<number>(2);

    const handleConfirm = () => {
        onSelectPlayerCount(selectedCount);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choose Player Count</DialogTitle>
                    <DialogDescription>
                        Select how many players can participate in this market
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="text-sm text-gray-500">
                        Current players: {currentPlayerCount}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSelectedCount(2)}
                            className={`p-6 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${selectedCount === 2
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <User className="w-8 h-8" />
                            <span className="font-semibold">2 Players</span>
                            <span className="text-xs text-gray-500">Head-to-head</span>
                        </button>

                        <button
                            onClick={() => setSelectedCount(10)}
                            className={`p-6 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${selectedCount === 10
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Users className="w-8 h-8" />
                            <span className="font-semibold">More Players</span>
                            <span className="text-xs text-gray-500">Up to 10</span>
                        </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <p className="text-yellow-800">
                            ⚠️ The market will start once all players have placed their bets
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} className="flex-1">
                        Confirm ({selectedCount} players)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
