import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

const FILENAME = 'merchant-start-manual-20260313.pptx';

export async function getMerchantStartManualResponse(): Promise<NextResponse> {
  const filePath = join(process.cwd(), 'public', FILENAME);
  const buffer = await readFile(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${FILENAME}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}