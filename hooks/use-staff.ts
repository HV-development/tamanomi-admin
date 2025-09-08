import { staffService } from '@/services/staff-service';
import type { Staff, StaffFilters } from '@/types/staff';
import { useCallback, useEffect, useState } from 'react';

export const useStaff = () => {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const staff = await staffService.getAll();
      setData(staff);
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

  const updateStatus = useCallback(async (id: string, status: Staff['status']) => {
    try {
      const updated = await staffService.updateStatus(id, status);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, []);

  const deleteStaff = useCallback(async (id: string) => {
    try {
      await staffService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const search = useCallback(async (filters: StaffFilters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await staffService.search(filters);
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
    updateStatus,
    deleteStaff,
    search,
  };
};

export const useStaffByOffice = (officeId: string) => {
  const [data, setData] = useState<Staff[]>([]);
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
      const staff = await staffService.getByOfficeId(officeId);
      setData(staff);
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

  const deleteStaff = useCallback(async (id: string) => {
    try {
      await staffService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const updateStaff = useCallback(async (id: string, updates: Partial<Staff>) => {
    try {
      const updated = await staffService.update(id, updates);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Staff['status']) => {
    try {
      const updated = await staffService.updateStatus(id, status);
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
    deleteStaff,
    updateStaff,
    updateStatus,
  };
};

export const useStaffMember = (id: string) => {
  const [data, setData] = useState<Staff | null>(null);
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
        const staff = await staffService.getById(id);
        setData(staff);
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
      const staff = await staffService.getById(id);
      setData(staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useStaffStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await staffService.getStaffStats();
        setData(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : '統計データの取得に失敗しました');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await staffService.getStaffStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
