import React from 'react';
import { renderToString } from 'react-dom/server';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Test() {
  return renderToString(
    <Select value="daily">
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Setiap hari pukul 02:00</SelectItem>
      </SelectContent>
    </Select>
  );
}
