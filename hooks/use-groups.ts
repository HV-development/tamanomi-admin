import { groupService } from '@/services/group-service';
import type { CreateGroup, GroupWithDetails, UpdateGroup } from '@/types/group';
import type { GroupSearchParams } from '@/validations/group-validation';
import { useCallback, useEffect, useState } from 'react';

export const useGroups = (initialParams?: Partial<GroupSearchParams>) => {
  const [data, setData] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<Partial<GroupSearchParams>>(initialParams || {});

  const fetchData = useCallback(
    async (searchParams?: Partial<GroupSearchParams>) => {
      try {
        setLoading(true);
        setError(null);
        const groups = await groupService.getAll(searchParams || params);
        setData(groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams: Partial<GroupSearchParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const search = useCallback(
    (query: string) => {
      const searchParams = { ...params, query };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const filterByStatus = useCallback(
    (status: 'all' | 'active' | 'inactive') => {
      const searchParams = { ...params, status };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const sort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
      const searchParams = { ...params, sortBy, sortOrder };
      setParams(searchParams);
      fetchData(searchParams);
    },
    [params, fetchData]
  );

  const addGroup = useCallback(
    async (newGroup: CreateGroup): Promise<GroupWithDetails> => {
      try {
        const created = await groupService.create(newGroup);
        // データを再取得して最新状態を反映
        await fetchData();
        return {
          ...created,
          teams: [],
          recentActivity: {
            lastUpdated: created.updatedAt,
            updatedBy: created.createdBy,
          },
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '作成に失敗しました');
      }
    },
    [fetchData]
  );

  const updateGroup = useCallback(
    async (id: string, updates: UpdateGroup): Promise<GroupWithDetails> => {
      try {
        const updated = await groupService.update(id, updates);
        // データを再取得して最新状態を反映
        await fetchData();
        return {
          ...updated,
          teams: [],
          recentActivity: {
            lastUpdated: updated.updatedAt,
            updatedBy: updated.createdBy,
          },
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
      }
    },
    [fetchData]
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      try {
        await groupService.delete(id);
        // データを再取得して最新状態を反映
        await fetchData();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
      }
    },
    [fetchData]
  );

  const canDeleteGroup = useCallback(async (id: string) => {
    try {
      return await groupService.canDeleteGroup(id);
    } catch (err) {
      return { canDelete: false, reason: '削除可能性の確認に失敗しました' };
    }
  }, []);

  return {
    data,
    loading,
    error,
    params,
    updateParams,
    search,
    filterByStatus,
    sort,
    refetch: fetchData,
    addGroup,
    updateGroup,
    deleteGroup,
    canDeleteGroup,
  };
};

export const useGroup = (id: string) => {
  const [data, setData] = useState<GroupWithDetails | null>(null);
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
        const group = await groupService.getById(id);
        setData(group);
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
      const group = await groupService.getById(id);
      setData(group);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useGroupStats = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await groupService.getStats();
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
      const stats = await groupService.getStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
