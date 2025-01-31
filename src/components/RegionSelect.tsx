'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { regions } from '@/constants/regions';

const removeDiacritics = (str: string) => {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
};

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RegionSelect = ({
  value,
  onChange,
  className = '',
}: RegionSelectProps) => {
  const [search, setSearch] = useState('');

  // Filtrovanie regiónov na základe vyhľadávania bez diakritiky
  const filteredRegions = regions.filter((region) =>
    removeDiacritics(region.name.toLowerCase()).includes(
      removeDiacritics(search.toLowerCase())
    )
  );

  const selectedRegion = regions.find((region) => region.code === value);

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-10 w-10 cursor-pointer items-center justify-center p-0 hover:bg-transparent md:h-12 md:w-12"
          >
            {selectedRegion && (
              <Image
                src={selectedRegion.flag}
                alt={selectedRegion.name}
                width={32}
                height={32}
                className="w-6 object-cover md:w-8"
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 border-0 p-2" align="end">
          <Input
            placeholder="Vyhľadať región..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => (
                <button
                  key={region.code}
                  onClick={() => {
                    onChange(region.code);
                    setSearch('');
                  }}
                  className="flex w-full items-center gap-2 rounded p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Image
                    src={region.flag}
                    alt={region.name}
                    width={24}
                    height={24}
                    className="h-5 w-5 rounded object-contain md:h-6 md:w-6"
                  />
                  <span className="text-sm md:text-base">{region.name}</span>
                </button>
              ))
            ) : (
              <div className="text-muted-foreground p-2 text-sm">
                Žiadne výsledky
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RegionSelect;
