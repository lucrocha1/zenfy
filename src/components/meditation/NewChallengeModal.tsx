import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChallengeType, CHALLENGE_PRESETS, DAY_OPTIONS, useChallenges } from '@/hooks/useChallenges';
import { Check } from 'lucide-react';

interface NewChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewChallengeModal = ({ open, onOpenChange }: NewChallengeModalProps) => {
  const { createChallenge, activeChallenge } = useChallenges();
  const [selectedType, setSelectedType] = useState<ChallengeType>('cave_mode');
  const [selectedDays, setSelectedDays] = useState(7);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (activeChallenge) return;
    
    setLoading(true);
    const name = selectedType === 'custom' && customName.trim() ? customName.trim() : undefined;
    const result = await createChallenge(selectedType, selectedDays, name);
    setLoading(false);
    
    if (result) {
      onOpenChange(false);
      setCustomName('');
      setSelectedType('cave_mode');
      setSelectedDays(7);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Desafio</DialogTitle>
        </DialogHeader>

        {activeChallenge ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              Você já tem um desafio ativo. Complete ou abandone o atual para criar um novo.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Challenge Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de desafio</label>
              <div className="grid gap-2">
                {CHALLENGE_PRESETS.map((preset) => (
                  <Card
                    key={preset.type}
                    className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedType === preset.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedType(preset.type)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{preset.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                      {selectedType === preset.type && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Name */}
            {selectedType === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome do desafio</label>
                <Input
                  placeholder="Ex: Meditação matinal"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            )}

            {/* Day Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Duração</label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((days) => (
                  <Button
                    key={days}
                    variant={selectedDays === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDays(days)}
                    className="flex-1 min-w-[60px]"
                  >
                    {days} dias
                  </Button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={loading || (selectedType === 'custom' && !customName.trim())}
            >
              {loading ? 'Criando...' : 'Começar Desafio'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
