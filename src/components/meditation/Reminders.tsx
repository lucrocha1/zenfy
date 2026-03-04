import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Plus, Trash2, AlertCircle, BellRing } from 'lucide-react';
import { toast } from 'sonner';

export const Reminders = () => {
  const [newTime, setNewTime] = useState('09:00');
  const {
    permission,
    reminders,
    requestPermission,
    addReminder,
    removeReminder,
    toggleReminder,
    isSupported,
  } = useNotifications();

  const handleTogglePermission = async () => {
    if (permission === 'granted') {
      toast.info('Para desativar notificações, use as configurações do navegador.');
    } else {
      const result = await requestPermission();
      if (result === 'granted') {
        toast.success('Notificações ativadas!');
      } else if (result === 'denied') {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    }
  };

  const handleAddReminder = () => {
    if (reminders.some(r => r.time === newTime)) {
      toast.error('Já existe um lembrete neste horário');
      return;
    }
    addReminder(newTime);
    toast.success(`Lembrete às ${newTime} adicionado`);
  };

  if (!isSupported) {
    return (
      <div className="min-h-[70vh] px-4 py-8 flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Navegador não suportado
          </h3>
          <p className="text-muted-foreground">
            Seu navegador não suporta notificações. Tente usar Chrome, Firefox ou Edge.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Lembretes</h2>

        {/* Permission Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${permission === 'granted' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                {permission === 'granted' ? (
                  <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <BellOff className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">Notificações do sistema</p>
                <p className="text-sm text-muted-foreground">
                  {permission === 'granted' 
                    ? 'Ativadas — você receberá lembretes'
                    : permission === 'denied'
                    ? 'Bloqueadas — ative nas configurações do navegador'
                    : 'Ative para receber lembretes de meditação'}
                </p>
              </div>
            </div>
            <Switch
              checked={permission === 'granted'}
              onCheckedChange={handleTogglePermission}
              disabled={permission === 'denied'}
            />
          </div>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center px-4">
          Os lembretes usam a API de Notificações do navegador e só funcionam enquanto o site estiver aberto em uma aba.
        </p>

        {/* Add Reminder */}
        {permission === 'granted' && (
          <Card className="p-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Adicionar lembrete</p>
              <p className="text-xs text-muted-foreground">
                Escolha o horário que você quer ser lembrado de meditar
              </p>
              <div className="flex gap-3 items-center">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-36 h-10 text-center text-lg"
                />
                <Button onClick={handleAddReminder} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Reminders List — individual cards */}
        {permission === 'granted' && reminders.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Seus lembretes</p>
            {reminders
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(reminder => (
                <Card key={reminder.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${reminder.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Bell className={`w-4 h-4 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`text-xl font-semibold tabular-nums ${reminder.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {reminder.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
                        onClick={() => removeReminder(reminder.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Empty State */}
        {permission === 'granted' && reminders.length === 0 && (
          <div className="text-center py-10">
            <BellRing className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-medium mb-1">Nenhum lembrete configurado</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Configure um lembrete para não esquecer de cuidar da sua mente 🧘
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
