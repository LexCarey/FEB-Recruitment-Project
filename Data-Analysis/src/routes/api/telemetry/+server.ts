import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clickhouse } from '$lib/clickhouse';

export const GET: RequestHandler = async ({ url }) => {
  const signalsParam = url.searchParams.get('signals');

  try {
    // If no specific signals are requested, return nothing to prevent massive full-db dumps
    if (!signalsParam) {
      return json({ data: [] });
    }

    // Split the comma-separated string into an array for ClickHouse IN clause
    const signalsArray = signalsParam.split(',').map(s => s.trim());

    const resultSet = await clickhouse.query({
      query: `
        SELECT timestamp, name, value, physical_value 
        FROM formula_electric.can_logs 
        WHERE name IN ({signals: Array(String)})
        ORDER BY timestamp ASC 
        LIMIT 150000
      `,
      query_params: { signals: signalsArray },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json();
    return json({ data: rows });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to fetch telemetry data' }, { status: 500 });
  }
};