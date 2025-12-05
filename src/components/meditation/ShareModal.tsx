import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelName: string;
}

export const ShareModal = ({ open, onOpenChange, levelName }: ShareModalProps) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText1, setCopiedText1] = useState(false);
  const [copiedText2, setCopiedText2] = useState(false);

  const shareUrl = `${window.location.origin}/share`;

  const shareText1 = `Tô usando o Zenfy pra criar o hábito de meditar 😌
Já estou no ${levelName} e acumulando conquistas.
Dá uma olhada no meu progresso e vê se tu aguenta me acompanhar:
👉 ${shareUrl}`;

  const shareText2 = `Comecei a meditar com o Zenfy e já tô construindo uma sequência 🔥
Quero ver se tu consegue bater meu nível e minhas badges.
Meu progresso tá aqui:
👉 ${shareUrl}`;

  const copyToClipboard = async (text: string, type: 'link' | 'text1' | 'text2') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === 'text1') {
        setCopiedText1(true);
        setTimeout(() => setCopiedText1(false), 2000);
      } else {
        setCopiedText2(true);
        setTimeout(() => setCopiedText2(false), 2000);
      }
      toast.success('Copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Compartilhar conquistas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Link do seu progresso
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border border-border text-muted-foreground"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className="shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">Copiar</span>
              </Button>
            </div>
          </div>

          {/* Share messages */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Mensagens prontas para WhatsApp/Instagram
            </label>

            {/* Message 1 */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm text-foreground whitespace-pre-line">{shareText1}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(shareText1, 'text1')}
                className="w-full"
              >
                {copiedText1 ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar texto
              </Button>
            </div>

            {/* Message 2 */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm text-foreground whitespace-pre-line">{shareText2}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(shareText2, 'text2')}
                className="w-full"
              >
                {copiedText2 ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar texto
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
