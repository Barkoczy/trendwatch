import { getWatchHistory } from '@/libs/WatchHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, History } from 'lucide-react';
import HistoryVideoList from '@/components/HistoryVideoList';

export const metadata = {
  title: 'História sledovania | TrendWatch',
  description: 'Vaša história sledovaných videí na TrendWatch',
};

export default async function HistoryPage() {
  const page = 1;
  const pageSize = 50;
  const { items: historyData, hasMore } = await getWatchHistory(page, pageSize);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">História sledovania</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden">
            <Clock className="mr-2 h-4 w-4" />
            Zoradiť podľa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Všetko</TabsTrigger>
          <TabsTrigger value="watched">Pozreté</TabsTrigger>
          <TabsTrigger value="live">Live streamy</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <HistoryVideoList
              historyData={historyData}
              hasMore={hasMore}
              currentPage={page}
              pageSize={pageSize}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="watched">
          <div className="text-muted-foreground flex h-[70vh] flex-col items-center justify-center text-center">
            <History className="mb-4 h-16 w-16" />
            <h3 className="text-lg font-medium">
              Vaše pozreté videá sa zobrazia tu
            </h3>
            <p className="mt-2 max-w-md text-sm">
              Sledujte videá a pomôžte nám lepšie prispôsobiť váš obsah
            </p>
          </div>
        </TabsContent>

        <TabsContent value="live">
          <div className="text-muted-foreground flex h-[70vh] flex-col items-center justify-center text-center">
            <History className="mb-4 h-16 w-16" />
            <h3 className="text-lg font-medium">História live streamov</h3>
            <p className="mt-2 max-w-md text-sm">
              Tu sa zobrazia všetky live streamy, ktoré ste sledovali
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
