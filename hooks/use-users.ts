import { userService } from '@/services/user-service';
import type { User, UserFilters } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';

export const useUsers = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await userService.getAll();
      setData(users);
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

  const updateStatus = useCallback(async (id: string, status: User['status']) => {
    try {
      const updated = await userService.updateStatus(id, status);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const search = useCallback(async (filters: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await userService.search(filters);
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
    deleteUser,
    search,
  };
};

export const useUsersByOffice = (officeId: string) => {
  const [data, setData] = useState<User[]>([]);
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
      const users = await userService.getByOfficeId(officeId);
      setData(users);
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

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.delete(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const updated = await userService.update(id, updates);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新に失敗しました');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: User['status']) => {
    try {
      const updated = await userService.updateStatus(id, status);
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
    deleteUser,
    updateUser,
    updateStatus,
  };
};

export const useUser = (id: string) => {
  const [data, setData] = useState<User | null>(null);
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
        const user = await userService.getById(id);
        setData(user);
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
      const user = await userService.getById(id);
      setData(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
