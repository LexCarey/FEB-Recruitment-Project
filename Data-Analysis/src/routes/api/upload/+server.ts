import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clickhouse } from '$lib/clickhouse';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file || !(file instanceof File)) {
      throw error(400, 'No valid CSV file uploaded.');
    }

    const nodeStream = fs.createReadStream(await writeWebFileToTemp(file));

    await clickhouse.insert({
      table: 'formula_electric.can_logs',
      values: nodeStream,
      format: 'CSVWithNames'
    });

    return new Response(JSON.stringify({ success: true, message: 'CSV successfully ingested!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('ClickHouse Ingestion Error:', err);
    throw error(500, `Failed to process upload: ${errorMessage}`);
  }
};

async function writeWebFileToTemp(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempPath = `/tmp/${Date.now()}-${file.name}`;
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}