'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbItem {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

// パスとタイトルのマッピング
const pathTitleMap: Record<string, string> = {
  // 運営者画面
  '/operation': 'ダッシュボード',
  '/operation/offices': '事業所管理',
  '/operation/offices/register': '事業所登録',
  '/operation/companies': '会社管理',
  '/operation/companies/register': '会社登録',
  '/operation/admins': '運営者管理',
  '/operation/admins/register': '運営者登録',

  // 事業所管理者画面
  '/facility': 'ダッシュボード',
  '/facility/residents': '利用者管理',
  '/facility/residents/new': '利用者登録',
  '/facility/residents/vitals': 'バイタル記録',
  '/facility/residents/care-records': '介助記録',
  '/facility/residents/individual-points': '個別ポイント',
  '/facility/care-records': '介護記録',
  '/facility/care-records/new': '記録登録',
  '/facility/staff': '職員管理',
  '/facility/staff/new': '職員登録',
  '/facility/communications': '連絡管理',
  '/facility/communications/new': '連絡登録',
  '/facility/documents': '書類管理',
  '/facility/documents/new': '書類登録',
  '/facility/trainings': '研修管理',
  '/facility/trainings/new': '研修登録',
  '/facility/manuals': 'マニュアル',
  '/facility/manuals/new': 'マニュアル登録',
  '/facility/settings': '設定',
  '/facility/settings/groups': 'グループ管理',
  '/facility/settings/groups/new': 'グループ作成',
  '/facility/settings/teams': 'チーム管理',
  '/facility/settings/teams/new': 'チーム作成',
  '/facility/settings/categories': 'カスタムカテゴリ',
  '/facility/settings/templates': 'テンプレート',
  '/facility/settings/thresholds': '閾値設定',
};

// 動的パスのパターン
const getDynamicTitle = (path: string): string | null => {
  // 運営者画面の動的パス
  if (path.match(/^\/operation\/offices\/[^/]+$/)) {
    return '事業所詳細';
  }
  if (path.match(/^\/operation\/offices\/[^/]+\/edit$/)) {
    return '事業所編集';
  }
  if (path.match(/^\/operation\/companies\/[^/]+$/)) {
    return '会社詳細';
  }
  if (path.match(/^\/operation\/companies\/[^/]+\/edit$/)) {
    return '会社編集';
  }
  if (path.match(/^\/operation\/admins\/[^/]+$/)) {
    return '運営者詳細';
  }
  if (path.match(/^\/operation\/admins\/[^/]+\/edit$/)) {
    return '運営者編集';
  }

  // 事業所管理者画面の動的パス
  if (path.match(/^\/facility\/residents\/[^/]+$/)) {
    return '利用者詳細';
  }
  if (path.match(/^\/facility\/residents\/[^/]+\/edit$/)) {
    return '利用者編集';
  }
  if (path.match(/^\/facility\/care-records\/[^/]+$/)) {
    return '記録詳細';
  }
  if (path.match(/^\/facility\/care-records\/[^/]+\/edit$/)) {
    return '記録編集';
  }
  if (path.match(/^\/facility\/staff\/[^/]+$/)) {
    return '職員詳細';
  }
  if (path.match(/^\/facility\/staff\/[^/]+\/edit$/)) {
    return '職員編集';
  }
  if (path.match(/^\/facility\/communications\/[^/]+$/)) {
    return '連絡詳細';
  }
  if (path.match(/^\/facility\/communications\/[^/]+\/edit$/)) {
    return '連絡編集';
  }
  if (path.match(/^\/facility\/documents\/[^/]+$/)) {
    return '書類詳細';
  }
  if (path.match(/^\/facility\/documents\/[^/]+\/edit$/)) {
    return '書類編集';
  }
  if (path.match(/^\/facility\/trainings\/[^/]+$/)) {
    return '研修詳細';
  }
  if (path.match(/^\/facility\/trainings\/[^/]+\/edit$/)) {
    return '研修編集';
  }
  if (path.match(/^\/facility\/manuals\/[^/]+$/)) {
    return 'マニュアル詳細';
  }
  if (path.match(/^\/facility\/manuals\/[^/]+\/edit$/)) {
    return 'マニュアル編集';
  }
  if (path.match(/^\/facility\/settings\/groups\/[^/]+$/)) {
    return 'グループ詳細';
  }
  if (path.match(/^\/facility\/settings\/groups\/[^/]+\/edit$/)) {
    return 'グループ編集';
  }
  if (path.match(/^\/facility\/settings\/teams\/[^/]+$/)) {
    return 'チーム詳細';
  }
  if (path.match(/^\/facility\/settings\/teams\/[^/]+\/edit$/)) {
    return 'チーム編集';
  }

  return null;
};

export const useBreadcrumb = (): BreadcrumbItem[] => {
  const pathname = usePathname();

  return useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // ルートパス（ダッシュボード）を判定
    const isOperationPath = pathname.startsWith('/operation');
    const isFacilityPath = pathname.startsWith('/facility');

    const rootPath = isOperationPath ? '/operation' : isFacilityPath ? '/facility' : '/operation';
    const rootTitle = 'ダッシュボード';

    // ルートパス（ダッシュボード）を追加
    if (pathname !== rootPath) {
      breadcrumbs.push({
        title: rootTitle,
        href: rootPath,
      });
    }

    // パスを分割して段階的にパンくずリストを構築
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length > 1) {
      let currentPath = '';

      for (let i = 0; i < pathSegments.length; i++) {
        currentPath += '/' + pathSegments[i];

        // 最後のセグメント（現在のページ）かどうか
        const isCurrentPage = i === pathSegments.length - 1;

        // タイトルを取得
        let title = pathTitleMap[currentPath];

        // 静的マッピングにない場合は動的タイトルを試す
        if (!title) {
          title = getDynamicTitle(currentPath);
        }

        // タイトルが見つからない場合はセグメント名をそのまま使用
        if (!title) {
          title = pathSegments[i];
        }

        // ダッシュボードは既に追加済みなのでスキップ
        if (currentPath === rootPath) {
          continue;
        }

        breadcrumbs.push({
          title,
          href: isCurrentPage ? undefined : currentPath,
          isCurrentPage,
        });
      }
    }

    // ダッシュボード自体の場合
    if (pathname === rootPath) {
      breadcrumbs.push({
        title: rootTitle,
        isCurrentPage: true,
      });
    }

    return breadcrumbs;
  }, [pathname]);
};
