import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ModeToggle';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { Play, Search, ListFilterPlus, ChevronUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RegionSelect from '@/components/RegionSelect';
import type { UserSettings } from '@/types/settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { defaultRegionCode } from '@/constants/regions';

interface HeaderProps {
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
}

const orderOptions = [
  { value: 'mostPopular', label: 'Trendy' },
  { value: 'date', label: 'Najnovšie' },
  { value: 'rating', label: 'Najlepšie hodnotené' },
  { value: 'relevance', label: 'Najrelevantnejšie' },
  { value: 'title', label: 'Podľa názvu' },
  { value: 'videoCount', label: 'Počet videí' },
  { value: 'viewCount', label: 'Počet zhliadnutí' },
];

const safeSearchOptions = [
  { value: 'none', label: 'Vypnuté' },
  { value: 'moderate', label: 'Stredné' },
  { value: 'strict', label: 'Prísne' },
];

const resultCountOptions = [8, 12, 24, 48];

const Header: React.FC<HeaderProps> = ({ settings, onSettingsChange }) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSearchQuery(settings.searchQuery || '');
    }
  }, [settings]);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query === '' || query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        onSettingsChange({ searchQuery: query });
      }, 500);
    }
  };

  return (
    <header className="dark:bg-background sticky top-0 z-50 w-full bg-white">
      <div className="px-4">
        {/* Hlavný header */}
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="text-primary flex items-center gap-2 transition-colors">
                <Play className="h-6 w-6" />
                <span className="hidden text-xl font-bold sm:inline">
                  TrendWatch
                </span>
              </div>
            </Link>
            <div className="ms-5 flex items-center gap-2">
              <Link
                href="/history"
                className="text-muted-foreground hover:text-primary hidden items-center gap-2 md:flex"
              >
                <History className="h-4 w-4" />
                <span>História</span>
              </Link>
            </div>
          </div>

          {/* Desktop vyhľadávanie */}
          <div className="hidden max-w-2xl flex-1 items-center justify-center gap-2 md:flex">
            <SearchAutocomplete
              onSearch={handleSearchChange}
              localSearchQuery={localSearchQuery}
              setLocalSearchQuery={setLocalSearchQuery}
              settings={settings}
            />
            <RegionSelect
              value={settings?.regionCode || defaultRegionCode}
              onChange={(value) => onSettingsChange({ regionCode: value })}
              className="flex-shrink-0"
            />
            <Button
              variant="ghost"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="cursor-pointer gap-2 hover:bg-transparent"
            >
              {isFilterExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ListFilterPlus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Mobilné ovládacie prvky */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/history" className="p-2">
              <History className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
              className="p-2"
            >
              <Search className="h-5 w-5" />
            </Button>
            <RegionSelect
              value={settings?.regionCode || defaultRegionCode}
              onChange={(value) => onSettingsChange({ regionCode: value })}
              className="flex-shrink-0"
            />
            <Button
              variant="ghost"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="p-2"
            >
              {isFilterExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ListFilterPlus className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Pravá strana */}
          <ModeToggle />
        </div>

        {/* Mobilné vyhľadávanie */}
        {isMobileSearchVisible && (
          <div className="py-2 md:hidden">
            <SearchAutocomplete
              onSearch={handleSearchChange}
              localSearchQuery={localSearchQuery}
              setLocalSearchQuery={setLocalSearchQuery}
              settings={settings}
            />
          </div>
        )}
      </div>

      {/* Rozšírený filter */}
      {isFilterExpanded && (
        <div className="dark:bg-background border-t border-gray-200 bg-white dark:border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="mx-auto max-w-screen-xl space-y-6">
              {/* Počet výsledkov */}
              <div className="flex items-center gap-4">
                <Label className="min-w-32">Počet výsledkov</Label>
                <div className="flex flex-wrap gap-2">
                  {resultCountOptions.map((count, index) => (
                    <Button
                      key={`result-count-${index}`}
                      variant={
                        settings.maxResults === count ? 'default' : 'outline'
                      }
                      className="flex-1"
                      onClick={() => onSettingsChange({ maxResults: count })}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Zoradenie a Bezpečnostný filter */}
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Label className="mb-2 block">Zoradiť podľa</Label>
                  <Select
                    value={settings.order}
                    onValueChange={(value) =>
                      onSettingsChange({
                        order: value as UserSettings['order'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zoradiť podľa" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block">Bezpečnostný filter</Label>
                  <Select
                    value={settings.safeSearch}
                    onValueChange={(value) =>
                      onSettingsChange({
                        safeSearch: value as UserSettings['safeSearch'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte úroveň" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeSearchOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dátum publikovania */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Label className="min-w-32">Publikované</Label>
                <div className="flex flex-wrap gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal md:w-48"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settings.publishedAfter
                          ? format(new Date(settings.publishedAfter), 'P', {
                              locale: sk,
                            })
                          : 'Od'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          settings.publishedAfter
                            ? new Date(settings.publishedAfter)
                            : undefined
                        }
                        onSelect={(date) =>
                          onSettingsChange({
                            publishedAfter: date?.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal md:w-48"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settings.publishedBefore
                          ? format(new Date(settings.publishedBefore), 'P', {
                              locale: sk,
                            })
                          : 'Do'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          settings.publishedBefore
                            ? new Date(settings.publishedBefore)
                            : undefined
                        }
                        onSelect={(date) =>
                          onSettingsChange({
                            publishedBefore: date?.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Typ obsahu a Shorts */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex h-full items-center space-x-2">
                    <Switch
                      id="shorts-toggle"
                      checked={settings.includeShorts}
                      onCheckedChange={(checked) =>
                        onSettingsChange({ includeShorts: checked })
                      }
                    />
                    <Label
                      htmlFor="shorts-toggle"
                      className="text-foreground cursor-pointer"
                    >
                      Zahrnúť Shorts
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
