import { Card } from '@/components/ui/card';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { formatDuration } from '@/utils/meditationStats';
import { Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const History = () => {
  const { sessions } = useMeditationSessions();

  // Sort sessions by date (most recent first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  // Group sessions by date
  const groupedSessions = sortedSessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  const formatTime = (isoString: string) => {
    return format(parseISO(isoString), 'HH:mm');
  };

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === format(today, 'yyyy-MM-dd')) {
      return 'Hoje';
    }
    if (dateStr === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ontem';
    }
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  if (sessions.length === 0) {
    return (
      <div className="min-h-[70vh] px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma sessão ainda
          </h3>
          <p className="text-muted-foreground">
            Suas meditações aparecerão aqui após você completar sua primeira sessão.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Histórico</h2>

        {Object.entries(groupedSessions).map(([date, daySessions]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground capitalize">
              {formatDateHeader(date)}
            </h3>
            
            {daySessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {formatDuration(session.duration_seconds)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(session.started_at)} - {formatTime(session.ended_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}

        <p className="text-center text-sm text-muted-foreground pt-4">
          Total: {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
        </p>
      </div>
    </div>
  );
};
