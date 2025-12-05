import { Timer } from '@/components/meditation/Timer';
import { Performance } from '@/components/meditation/Performance';
import { BadgesLevels } from '@/components/meditation/BadgesLevels';
import { History } from '@/components/meditation/History';
import { Reminders } from '@/components/meditation/Reminders';
import { CelebrationModal } from '@/components/meditation/CelebrationModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer as TimerIcon, TrendingUp, Trophy, Calendar, Bell, LogOut } from 'lucide-react';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { useAchievementCelebration } from '@/hooks/useAchievementCelebration';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
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
      
      <Tabs defaultValue="meditar" className="w-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
          <div className="max-w-2xl mx-auto px-2 sm:px-4 flex items-center">
            <TabsList className="flex-1 h-14 bg-transparent gap-0.5 sm:gap-1">
              <TabsTrigger 
                value="meditar" 
                className="flex-1 gap-1.5 data-[state=active]:bg-secondary px-2 sm:px-3"
              >
                <TimerIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Meditar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progresso" 
                className="flex-1 gap-1.5 data-[state=active]:bg-secondary px-2 sm:px-3"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Progresso</span>
              </TabsTrigger>
              <TabsTrigger 
                value="historico" 
                className="flex-1 gap-1.5 data-[state=active]:bg-secondary px-2 sm:px-3"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="flex-1 gap-1.5 data-[state=active]:bg-secondary px-2 sm:px-3"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Badges</span>
              </TabsTrigger>
              <TabsTrigger 
                value="lembretes" 
                className="flex-1 gap-1.5 data-[state=active]:bg-secondary px-2 sm:px-3"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Lembretes</span>
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
              <ThemeToggle />
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
        
        <TabsContent value="meditar" className="mt-0">
          <Timer />
        </TabsContent>
        
        <TabsContent value="progresso" className="mt-0">
          <Performance />
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          <History />
        </TabsContent>

        <TabsContent value="badges" className="mt-0">
          <BadgesLevels />
        </TabsContent>

        <TabsContent value="lembretes" className="mt-0">
          <Reminders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
