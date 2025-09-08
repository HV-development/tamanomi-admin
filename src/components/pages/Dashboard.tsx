import DashboardLayout from '../templates/DashboardLayout';
import MetricCard from '../atoms/MetricCard';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
          <p className="text-lg text-gray-600">
            たまのみの管理画面へようこそ
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="加盟店舗数"
            value="24"
            iconName="store"
            iconBgColor="bg-gradient-to-r from-green-400 to-green-600"
            change="+5%"
            changeType="positive"
          />
          <MetricCard
            title="ユーザー数"
            value="1,234"
            iconName="users"
            iconBgColor="bg-gradient-to-r from-blue-400 to-blue-600"
            change="+12%"
            changeType="positive"
          />
          <MetricCard
            title="管理者数"
            value="8"
            iconName="admin"
            iconBgColor="bg-gradient-to-r from-purple-400 to-purple-600"
            change="0%"
            changeType="neutral"
          />
          <MetricCard
            title="月間売上"
            value="¥2.4M"
            iconName="money"
            iconBgColor="bg-gradient-to-r from-orange-400 to-orange-600"
            change="+18%"
            changeType="positive"
          />
        </div>

        {/* コンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近のアクティビティ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">最近のアクティビティ</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">新しい加盟店舗「たまのみ 渋谷店」が登録されました</p>
                  <p className="text-xs text-gray-500 mt-1">2時間前</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-3 h-3 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">ユーザー「田中太郎」が新規登録しました</p>
                  <p className="text-xs text-gray-500 mt-1">4時間前</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-3 h-3 bg-purple-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">管理者「佐藤花子」がログインしました</p>
                  <p className="text-xs text-gray-500 mt-1">6時間前</p>
                </div>
              </div>
            </div>
          </div>

          {/* 売上概要 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">売上概要</h3>
              <span className="text-sm text-green-600 font-medium">+18% 今月</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100">
                <div>
                  <p className="text-sm font-medium text-gray-600">今日の売上</p>
                  <p className="text-2xl font-bold text-gray-900">¥85,400</p>
                </div>
                <div className="text-green-600">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                <div>
                  <p className="text-sm font-medium text-gray-600">今週の売上</p>
                  <p className="text-2xl font-bold text-gray-900">¥542,100</p>
                </div>
                <div className="text-blue-600">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100">
                <div>
                  <p className="text-sm font-medium text-gray-600">今月の売上</p>
                  <p className="text-2xl font-bold text-gray-900">¥2,400,000</p>
                </div>
                <div className="text-purple-600">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
