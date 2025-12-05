import { Timer } from '@/components/meditation/Timer';
import { Performance } from '@/components/meditation/Performance';
import { History } from '@/components/meditation/History';
import { Reminders } from '@/components/meditation/Reminders';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer as TimerIcon, BarChart3, History as HistoryIcon, Bell } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="meditar" className="w-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
          <div className="max-w-2xl mx-auto px-4 flex items-center">
            <TabsList className="flex-1 h-14 bg-transparent gap-1">
              <TabsTrigger 
                value="meditar" 
                className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-secondary"
              >
                <TimerIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Meditar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="desempenho" 
                className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-secondary"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Desempenho</span>
              </TabsTrigger>
              <TabsTrigger 
                value="historico" 
                className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-secondary"
              >
                <HistoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger 
                value="lembretes" 
                className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-secondary"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Lembretes</span>
              </TabsTrigger>
            </TabsList>
            <ThemeToggle />
          </div>
        </div>
        
        <TabsContent value="meditar" className="mt-0">
          <Timer />
        </TabsContent>
        
        <TabsContent value="desempenho" className="mt-0">
          <Performance />
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          <History />
        </TabsContent>

        <TabsContent value="lembretes" className="mt-0">
          <Reminders />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
