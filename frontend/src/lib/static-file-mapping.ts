/**
 * 静的ファイルのIDとパスのマッピング
 * 
 * セキュリティ対策として、IDベースで静的ファイルを取得するためのマッピング定義
 */

export const STATIC_FILE_MAP: Record<string, string> = {
  '1': '/history.png',
  '2': '/edit.svg',
  '3': '/tamanomi_logo.svg',
  '4': '/alert.svg',
  '5': '/coupon.svg',
  '6': '/info.png',
  '7': '/store-list.svg',
  '8': '/storefront-icon.svg',
  '9': '/trash.svg',
  '10': '/dustbox.png',
  '11': '/favicon.ico',
  '12': '/favicon.png',
};

// MIMEタイプのマッピング
export const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
};

/**
 * ファイルパスからMIMEタイプを取得
 */
export function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * IDが有効かどうかをチェック
 */
export function isValidFileId(id: string): boolean {
  return id in STATIC_FILE_MAP;
}

/**
 * IDからファイルパスを取得
 */
export function getFilePathById(id: string): string | null {
  return STATIC_FILE_MAP[id] || null;
}

