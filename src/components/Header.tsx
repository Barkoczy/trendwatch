'use client';

import React, { useState, useEffect } from 'react';
import { ModeToggle } from './ModeToggle';
import { Play, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RegionSelect from '@/components/RegionSelect';
import { UserSettings } from '@/types/settings';
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (settings) {
      setSearchQuery(settings.searchQuery || '');
    }
  }, [settings]);

  return (
    <header className="dark:bg-background sticky top-0 z-50 w-full bg-white">
      <div className="container mx-auto px-4">
        {/* Hlavný header */}
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-primary flex items-center gap-2 transition-colors">
              <Play className="h-6 w-6" />
              <span className="text-xl font-bold">TrendWatch</span>
            </div>
          </div>

          {/* Vyhľadávanie a región */}
          <div className="flex max-w-2xl flex-1 items-center justify-center gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Vyhľadať videá..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSettingsChange({ searchQuery: e.target.value });
                }}
                className="w-full pl-10"
              />
            </div>
            <div className="w-36">
              <RegionSelect
                value={settings?.regionCode || 'SK'}
                onChange={(value) => onSettingsChange({ regionCode: value })}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="gap-2"
            >
              Filtre
              {isFilterExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Pravá strana */}
          <ModeToggle />
        </div>
      </div>

      {/* Rozšírený filter */}
      {isFilterExpanded && (
        <div className="dark:bg-background border-t border-gray-200 bg-white dark:border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="mx-auto max-w-screen-xl space-y-6">
              {/* Počet výsledkov */}
              <div className="flex items-center gap-4">
                <Label className="min-w-32">Počet výsledkov</Label>
                <div className="flex gap-2">
                  {resultCountOptions.map((count) => (
                    <Button
                      key={count}
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
              <div className="flex gap-4">
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
              <div className="flex items-center gap-4">
                <Label className="min-w-32">Publikované</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-48 justify-start text-left font-normal"
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
                        className="w-48 justify-start text-left font-normal"
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
