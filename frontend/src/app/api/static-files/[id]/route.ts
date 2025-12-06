import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getMimeType, getFilePathById } from '@/lib/static-file-mapping';

/**
 * 静的ファイルをIDベースで取得するAPIエンドポイント
 * 
 * セキュリティ対策として、ファイル名の直接指定を防ぎ、IDベースでのみアクセス可能にする
 * 
 * @example
 * GET /api/static-files/1 -> /history.png
 * GET /api/static-files/2 -> /edit.svg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // IDのバリデーション（半角数字のみ許可）
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: '無効なID形式です' },
        { status: 400 }
      );
    }
    
    // IDからファイルパスを取得
    const filePath = getFilePathById(id);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      );
    }
    
    // パストラバーサル対策（念のため）
    if (filePath.includes('..') || !filePath.startsWith('/')) {
      return NextResponse.json(
        { error: '不正なファイルパスです' },
        { status: 400 }
      );
    }
    
    // ファイルを読み込む
    const publicPath = join(process.cwd(), 'public', filePath);
    
    try {
      const fileBuffer = await readFile(publicPath);
      
      // MIMEタイプを取得
      const contentType = getMimeType(filePath);
      
      // レスポンスを返す（BufferをUint8Arrayに変換）
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (fileError) {
      // ファイルが存在しない場合
      console.error('Static file not found:', publicPath, fileError);
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Static file API error:', error);
    return NextResponse.json(
      { error: 'ファイルの取得に失敗しました' },
      { status: 500 }
    );
  }
}

