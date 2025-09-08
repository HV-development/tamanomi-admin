import { facilityManagerService } from '@/services/facility-manager-service';
import type { FacilityManager, FacilityManagerFilters } from '@/types/facility-manager';
import { useCallback, useEffect, useState } from 'react';

export const useFacilityManagers = () => {
  const [data, setData] = useState<FacilityManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const managers = await facilityManagerService.getAll();
      setData(managers);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requestPasswordReset = useCallback(async (id: string) => {
    try {
      const result = await facilityManagerService.requestPasswordReset(id);
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'パスワード再発行に失敗しました');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: FacilityManager['status']) => {
    try {
      const updated = await facilityManagerService.updateStatus(id, status);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, []);

  const deleteManager = useCallback(async (id: string) => {
    try {
      await facilityManagerService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const search = useCallback(async (filters: FacilityManagerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await facilityManagerService.search(filters);
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索に失敗しました');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    requestPasswordReset,
    updateStatus,
    deleteManager,
    search,
  };
};

export const useFacilityManagersByOffice = (officeId: string) => {
  const [data, setData] = useState<FacilityManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!officeId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const managers = await facilityManagerService.getByOfficeId(officeId);
      setData(managers);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [officeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requestPasswordReset = useCallback(async (id: string) => {
    try {
      const result = await facilityManagerService.requestPasswordReset(id);
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'パスワード再発行に失敗しました');
    }
  }, []);

  const deleteManager = useCallback(async (id: string) => {
    try {
      await facilityManagerService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const updateManager = useCallback(async (id: string, updates: Partial<FacilityManager>) => {
    try {
      const updated = await facilityManagerService.update(id, updates);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: FacilityManager['status']) => {
    try {
      const updated = await facilityManagerService.updateStatus(id, status);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    requestPasswordReset,
    deleteManager,
    updateManager,
    updateStatus,
  };
};

export const useFacilityManager = (id: string) => {
  const [data, setData] = useState<FacilityManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const manager = await facilityManagerService.getById(id);
        setData(manager);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refetch = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const manager = await facilityManagerService.getById(id);
      setData(manager);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
