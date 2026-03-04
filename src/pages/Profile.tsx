import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Download, Trash2, Save, FileJson, FileSpreadsheet, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DeleteAccountModal } from '@/components/profile/DeleteAccountModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, exportDataAsJSON, exportDataAsCSV } = useProfile();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialize display name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(displayName);
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Perfil atualizado',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    await exportDataAsJSON();
    setIsExporting(false);
    toast({
      title: 'Dados exportados',
      description: 'Seus dados foram baixados em formato JSON.',
    });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    const result = await exportDataAsCSV();
    setIsExporting(false);
    
    if (result) {
      toast({
        title: 'Dados exportados',
        description: 'Suas sessões foram baixadas em formato CSV.',
      });
    } else {
      toast({
        title: 'Nenhum dado',
        description: 'Você ainda não tem sessões para exportar.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />

      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Perfil e Configurações</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar - centered */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                {(displayName || profile?.display_name || user?.email || '?')[0].toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">Baseado na inicial do seu nome</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                placeholder="Como você quer ser chamado?"
                value={displayName || profile?.display_name || ''}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Baixe uma cópia de todas as suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Seus dados incluem: perfil, sessões de meditação e streak freezes.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportJSON} 
                disabled={isExporting}
                className="flex-1"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportCSV} 
                disabled={isExporting}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Zenfy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Sobre o Zenfy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              App de meditação criado para ajudar você a manter uma prática consistente.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium text-foreground">v1.0.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone — extra spacing */}
        <div className="pt-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ao excluir sua conta, todos os seus dados serão permanentemente removidos, 
                incluindo sessões de meditação, conquistas e configurações.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteModal(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir minha conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
