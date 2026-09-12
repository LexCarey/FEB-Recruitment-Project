import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clickhouse } from '$lib/clickhouse';

export const GET: RequestHandler = async () => {
  try {
    const resultSet = await clickhouse.query({
      query: `SELECT DISTINCT name FROM formula_electric.can_logs ORDER BY name ASC`,
      format: 'JSONEachRow'
    });
    const rows = await resultSet.json();
    const signals = rows.map((row: any) => row.name);
    return json({ signals });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
};