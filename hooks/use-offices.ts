import { officeService } from '@/services/office-service';
import type {
  CreateOfficeRequest,
  Office,
  OfficeFilters,
  OfficeStats,
  UpdateOfficeRequest,
} from '@/types/office';
import { useCallback, useEffect, useState } from 'react';

export function useOffices(filters?: Partial<OfficeFilters>) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffices = useCallback(async (searchFilters?: Partial<OfficeFilters>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await officeService.getOffices(searchFilters);
      setOffices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '事業所の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffices(filters);
  }, [fetchOffices, filters]);

  return {
    offices,
    loading,
    error,
    refetch: fetchOffices,
  };
}

export function useOffice(id: string) {
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOffice = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await officeService.getOfficeById(id);
        setOffice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '事業所の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOffice();
  }, [id]);

  return { office, loading, error };
}

export function useOfficeStats() {
  const [stats, setStats] = useState<OfficeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await officeService.getOfficeStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useOfficeActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffice = async (data: CreateOfficeRequest): Promise<Office | null> => {
    setLoading(true);
    setError(null);
    try {
      const office = await officeService.createOffice(data);
      return office;
    } catch (err) {
      setError(err instanceof Error ? err.message : '事業所の作成に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOffice = async (data: UpdateOfficeRequest): Promise<Office | null> => {
    setLoading(true);
    setError(null);
    try {
      const office = await officeService.updateOffice(data);
      return office;
    } catch (err) {
      setError(err instanceof Error ? err.message : '事業所の更新に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteOffice = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await officeService.deleteOffice(id);
      return true;
    } catch (err) {
      // サービス層からの具体的なエラーメッセージをそのまま使用
      setError(err instanceof Error ? err.message : '事業所の削除に失敗しました');
      throw err; // エラーを再スローして上位で処理できるようにする
    } finally {
      setLoading(false);
    }
  };

  const exportOffices = async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const csv = await officeService.exportOffices();
      return csv;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポートに失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disableOffice = async (id: string, reason?: string): Promise<Office | null> => {
    setLoading(true);
    setError(null);
    try {
      const office = await officeService.disableOffice(id, reason);
      return office;
    } catch (err) {
      setError(err instanceof Error ? err.message : '事業所の利用停止に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enableOffice = async (id: string): Promise<Office | null> => {
    setLoading(true);
    setError(null);
    try {
      const office = await officeService.enableOffice(id);
      return office;
    } catch (err) {
      setError(err instanceof Error ? err.message : '事業所の利用復元に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOffice,
    updateOffice,
    deleteOffice,
    exportOffices,
    disableOffice,
    enableOffice,
  };
}
