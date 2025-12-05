import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Plus, Trash2, AlertCircle } from 'lucide-react';
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

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success('Notificações ativadas!');
    } else if (result === 'denied') {
      toast.error('Permissão negada. Ative nas configurações do navegador.');
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
                    ? 'Ativadas - você receberá lembretes no PC'
                    : permission === 'denied'
                    ? 'Bloqueadas - ative nas configurações do navegador'
                    : 'Clique para ativar notificações'}
                </p>
              </div>
            </div>
            {permission !== 'granted' && permission !== 'denied' && (
              <Button onClick={handleRequestPermission}>
                Ativar
              </Button>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/50 border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            💡 As notificações aparecem no seu PC/notebook enquanto o site estiver aberto no navegador.
          </p>
        </Card>

        {/* Add Reminder */}
        {permission === 'granted' && (
          <Card className="p-6">
            <p className="text-sm font-medium text-foreground mb-4">Adicionar lembrete</p>
            <div className="flex gap-3">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-32"
              />
              <Button onClick={handleAddReminder} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>
        )}

        {/* Reminders List */}
        {permission === 'granted' && reminders.length > 0 && (
          <Card className="p-6">
            <p className="text-sm font-medium text-foreground mb-4">Seus lembretes</p>
            <div className="space-y-3">
              {reminders
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(reminder => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-4 h-4 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-lg font-medium ${reminder.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                        onClick={() => removeReminder(reminder.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {permission === 'granted' && reminders.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum lembrete configurado ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
