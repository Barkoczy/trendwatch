'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { regions } from '@/constants/regions';

const RegionSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [search, setSearch] = useState('');

  // Filtrovanie regiónov na základe vyhľadávania
  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Vyberte región" />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Vyhľadať región..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 w-full"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))
            ) : (
              <div className="text-muted-foreground p-2">Žiadne výsledky</div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RegionSelect;
