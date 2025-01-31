'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { UserSettings } from '@/types/settings';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import RegionSelect from '@/components/RegionSelect';

interface VideoFiltersProps {
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
}

const orderOptions = [
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

export const VideoFilters: React.FC<VideoFiltersProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Prvý rad - Región a Počet výsledkov */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <Label className="mb-2 block">Región</Label>
          <RegionSelect
            value={settings.region}
            onChange={(value) => onSettingsChange({ region: value })}
          />
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">Počet výsledkov</Label>
          <div className="flex gap-2">
            {resultCountOptions.map((count) => (
              <Button
                key={count}
                variant={settings.maxResults === count ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => onSettingsChange({ maxResults: count })}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Druhý rad - Vyhľadávanie a Zoradenie */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <Label className="mb-2 block">Vyhľadávanie</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Vyhľadať videá..."
              value={settings.searchQuery ?? ''}
              onChange={(e) =>
                onSettingsChange({ searchQuery: e.target.value })
              }
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-w-[200px]">
          <Label className="mb-2 block">Zoradiť podľa</Label>
          <Select
            value={settings.order}
            onValueChange={(value) =>
              onSettingsChange({ order: value as UserSettings['order'] })
            }
          >
            <SelectTrigger className="w-full">
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
      </div>

      {/* Tretí rad - Dátum publikovania a Bezpečnostný filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <Label className="mb-2 block">Publikované</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
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
                  className="w-full justify-start text-left font-normal"
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
        <div className="min-w-[200px] flex-1">
          <Label className="mb-2 block">Bezpečnostný filter</Label>
          <Select
            value={settings.safeSearch}
            onValueChange={(value) =>
              onSettingsChange({
                safeSearch: value as UserSettings['safeSearch'],
              })
            }
          >
            <SelectTrigger className="w-full">
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

      {/* Štvrtý rad - Typ obsahu a Shorts */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <Label className="mb-2 block">Typ obsahu</Label>
          <Select
            value={settings.chart}
            onValueChange={(value) =>
              onSettingsChange({ chart: value as UserSettings['chart'] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Typ obsahu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mostPopular">Najpopulárnejšie</SelectItem>
              <SelectItem value="trending">Trendy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="flex items-center space-x-2">
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
  );
};
