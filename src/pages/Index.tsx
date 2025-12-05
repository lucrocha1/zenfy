import { Timer } from '@/components/meditation/Timer';
import { Performance } from '@/components/meditation/Performance';
import { BadgesLevels } from '@/components/meditation/BadgesLevels';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer as TimerIcon, TrendingUp, Trophy } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="meditar" className="w-full">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-10">
          <div className="max-w-2xl mx-auto px-4 flex items-center">
            <TabsList className="flex-1 h-14 bg-transparent gap-1">
              <TabsTrigger 
                value="meditar" 
                className="flex-1 gap-2 data-[state=active]:bg-secondary"
              >
                <TimerIcon className="w-4 h-4" />
                <span>Meditar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progresso" 
                className="flex-1 gap-2 data-[state=active]:bg-secondary"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Progresso</span>
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="flex-1 gap-2 data-[state=active]:bg-secondary"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Badges & Níveis</span>
                <span className="sm:hidden">Badges</span>
              </TabsTrigger>
            </TabsList>
            <ThemeToggle />
          </div>
        </div>
        
        <TabsContent value="meditar" className="mt-0">
          <Timer />
        </TabsContent>
        
        <TabsContent value="progresso" className="mt-0">
          <Performance />
        </TabsContent>

        <TabsContent value="badges" className="mt-0">
          <BadgesLevels />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
