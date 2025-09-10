'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';

interface User {
  id: string;
  nickname: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  birthDate: string;
  gender: number;
  saitamaAppId: string;
  rank: number;
  registeredStore: string;
  registeredAt: string;
  contractStatus: number;
}

// サンプルデータ
const sampleUsers: Record<string, User> = {
  '1': {
    id: '1',
    nickname: '田中太郎',
    postalCode: '330-0001',
    prefecture: '埼玉県',
    city: 'さいたま市浦和区',
    address: '高砂1-1-1',
    birthDate: '1990/05/15',
    gender: 1,
    saitamaAppId: 'SA001234',
    rank: 3,
    registeredStore: 'たまのみ 浦和店',
    registeredAt: '2024/01/15',
    contractStatus: 1,
  },
  '2': {
    id: '2',
    nickname: '佐藤花子',
    postalCode: '330-0062',
    prefecture: '埼玉県',
    city: 'さいたま市浦和区',
    address: '仲町2-2-2',
    birthDate: '1985/08/22',
    gender: 2,
    saitamaAppId: 'SA005678',
    rank: 4,
    registeredStore: 'たまのみ 浦和店',
    registeredAt: '2024/01/20',
    contractStatus: 2,
  },
  '3': {
    id: '3',
    nickname: '鈴木次郎',
    postalCode: '330-0043',
    prefecture: '埼玉県',
    city: 'さいたま市浦和区',
    address: '大東3-3-3',
    birthDate: '1995/12/03',
    gender: 1,
    saitamaAppId: 'SA009012',
    rank: 2,
    registeredStore: 'たまのみ 大宮店',
    registeredAt: '2024/02/01',
    contractStatus: 3,
  },
  '4': {
    id: '4',
    nickname: '山田美咲',
    postalCode: '330-0064',
    prefecture: '埼玉県',
    city: 'さいたま市浦和区',
    address: '岸町4-4-4',
    birthDate: '1992/03/18',
    gender: 2,
    saitamaAppId: 'SA003456',
    rank: 1,
    registeredStore: 'たまのみ 浦和店',
    registeredAt: '2024/02/10',
    contractStatus: 1,
  },
};

export default function UserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 実際はAPIからユーザーデータを取得
    const userData = sampleUsers[userId];
    if (userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, [userId]);

  const getGenderLabel = (gender: number) => {
    switch (gender) {
      case 1:
        return '男性';
      case 2:
        return '女性';
      case 3:
        return '未回答';
      default:
        return '未回答';
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return 'ブロンズ';
      case 2:
        return 'シルバー';
      case 3:
        return 'ゴールド';
      case 4:
        return 'ダイヤモンド';
      default:
        return 'ブロンズ';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-orange-100 text-orange-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getContractStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return '契約中（サブスクリプション契約）';
      case 2:
        return '契約中（サブスクリプション未契約）';
      case 3:
        return '解約';
      default:
        return '契約中（サブスクリプション未契約）';
    }
  };

  const getContractStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
          <p className="text-gray-500 mb-4">指定されたユーザーは存在しません。</p>
          <Link href="/users">
            <Button variant="primary">ユーザー一覧に戻る</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">ユーザー詳細</h1>
            <p className="text-gray-600">
              ユーザーの詳細情報を表示します
            </p>
          </div>
        </div>

        {/* ユーザー詳細 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* ニックネーム */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.nickname}</p>
            </div>

            {/* 郵便番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                郵便番号
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.postalCode}</p>
            </div>

            {/* 住所 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住所
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">
                {user.prefecture}{user.city}{user.address}
              </p>
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生年月日
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.birthDate}</p>
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性別
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{getGenderLabel(user.gender)}</p>
            </div>

            {/* さいたま市みんなのアプリID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                さいたま市みんなのアプリID
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.saitamaAppId}</p>
            </div>

            {/* ランク */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ランク
              </label>
              <div className="bg-gray-50 p-3 rounded">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRankColor(user.rank)}`}>
                  {getRankLabel(user.rank)}
                </span>
              </div>
            </div>

            {/* 登録店舗 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                登録店舗
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.registeredStore}</p>
            </div>

            {/* 登録日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                登録日
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{user.registeredAt}</p>
            </div>

            {/* 契約ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約ステータス
              </label>
              <div className="bg-gray-50 p-3 rounded">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getContractStatusColor(user.contractStatus)}`}>
                  {getContractStatusLabel(user.contractStatus)}
                </span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <Link href={`/users/${user.id}/edit`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8"
                >
                  編集
                </Button>
              </Link>
              <Link href={`/users/${user.id}/coupon-history`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  クーポン利用履歴
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}