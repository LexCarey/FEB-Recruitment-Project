import { createClient } from '@clickhouse/client';

export const clickhouse = createClient({
  url: 'http://localhost:8123',
  username: 'default',
  password: 'password',
  database: 'formula_electric'
});

export interface CanLogRow {
  timestamp: number;
  can_bus: number;
  can_id: number;
  name: string;
  value: number;
  physical_value: string | null;
}