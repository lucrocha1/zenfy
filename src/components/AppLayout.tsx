import { Outlet, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CelebrationModal } from '@/components/meditation/CelebrationModal';
import { useAchievementCelebration } from '@/hooks/useAchievementCelebration';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Timer as TimerIcon, TrendingUp, Calendar, Trophy, Bell, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: TimerIcon, label: 'Meditar', end: true },
  { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
  { to: '/historico', icon: Calendar, label: 'Histórico' },
  { to: '/badges', icon: Trophy, label: 'Badges' },
  { to: '/lembretes', icon: Bell, label: 'Lembretes' },
];

export const AppLayout = () => {
  const navigate = useNavigate();
  const { sessions } = useMeditationSessions();
  const { celebration, dismissCelebration } = useAchievementCelebration(sessions);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <CelebrationModal
        isOpen={!!celebration}
        onClose={dismissCelebration}
        type={celebration?.type || 'badge'}
        title={celebration?.title || ''}
        description={celebration?.description || ''}
        icon={celebration?.icon || ''}
      />

      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-2 sm:px-4 flex items-center">
          <nav className="flex-1 h-14 flex items-center gap-0.5 sm:gap-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 sm:px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground"
                activeClassName="bg-secondary text-foreground shadow"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/perfil')}
              title="Perfil e Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
};
