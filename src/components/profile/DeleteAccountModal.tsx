import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const navigate = useNavigate();
  const { deleteAccount } = useProfile();
  const { toast } = useToast();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmation === 'EXCLUIR';

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    const { error } = await deleteAccount();
    setIsDeleting(false);

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta excluída',
        description: 'Sua conta foi excluída com sucesso.',
      });
      navigate('/auth');
    }
  };

  const handleClose = () => {
    setConfirmation('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir conta permanentemente
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão 
              permanentemente excluídos:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Histórico de meditações</li>
              <li>Conquistas e badges</li>
              <li>Streak freezes</li>
              <li>Configurações e preferências</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirmation">
            Digite <strong>EXCLUIR</strong> para confirmar:
          </Label>
          <Input
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="EXCLUIR"
            className="font-mono"
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir minha conta'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
