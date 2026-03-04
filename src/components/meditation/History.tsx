import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/PageTransition';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { formatDuration } from '@/utils/meditationStats';
import { Clock, Calendar, Trash2, Play } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { MeditationSession } from '@/types/meditation';

const getTimePeriod = (isoString: string) => {
  const hour = new Date(isoString).getHours();
  if (hour >= 5 && hour <= 11) return { label: 'Manhã', icon: '🌅' };
  if (hour >= 12 && hour <= 17) return { label: 'Tarde', icon: '☀️' };
  if (hour >= 18 && hour <= 23) return { label: 'Noite', icon: '🌙' };
  return { label: 'Madrugada', icon: '🌃' };
};

const getTotalDurationForSessions = (sessions: MeditationSession[]) => {
  return sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
};

export const History = () => {
  const navigate = useNavigate();
  const { sessions, deleteSession, isLoading } = useMeditationSessions();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  const groupedSessions = sortedSessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  const formatTime = (isoString: string) => format(parseISO(isoString), 'HH:mm');

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === format(today, 'yyyy-MM-dd')) return 'Hoje';
    if (dateStr === format(yesterday, 'yyyy-MM-dd')) return 'Ontem';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteSession(deleteTarget);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (success) {
      toast.success('Sessão removida');
    } else {
      toast.error('Erro ao remover sessão');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <PageTransition>
      <div className="min-h-[70vh] px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma sessão ainda
          </h3>
          <p className="text-muted-foreground mb-4">
            Suas meditações aparecerão aqui após você completar sua primeira sessão.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Play className="w-4 h-4" />
            Começar agora
          </Button>
        </div>
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Histórico</h2>

        {Object.entries(groupedSessions).map(([date, daySessions]) => {
          const dayTotal = getTotalDurationForSessions(daySessions);
          return (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground capitalize">
                {formatDateHeader(date)}
                <span className="text-muted-foreground/70 font-normal">
                  {' '}— {daySessions.length} {daySessions.length === 1 ? 'sessão' : 'sessões'}, {formatDuration(dayTotal)} total
                </span>
              </h3>
              
              {daySessions.map((session) => {
                const period = getTimePeriod(session.started_at);
                return (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {formatDuration(session.duration_seconds)}
                            </p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal gap-1">
                              {period.icon} {period.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(session.started_at)} - {formatTime(session.ended_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground/50 hover:text-destructive"
                        onClick={() => setDeleteTarget(session.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })}

        <p className="text-center text-sm text-muted-foreground pt-4">
          Total: {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
        </p>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A sessão será removida permanentemente do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageTransition>
  );
};
