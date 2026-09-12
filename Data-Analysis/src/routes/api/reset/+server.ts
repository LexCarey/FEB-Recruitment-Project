import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clickhouse } from '$lib/clickhouse';

export const POST: RequestHandler = async () => {
  try {
    await clickhouse.exec({
      query: `TRUNCATE TABLE formula_electric.can_logs`
    });
    return json({ success: true, message: 'Telemetry data cleared.' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to reset data' }, { status: 500 });
  }
};