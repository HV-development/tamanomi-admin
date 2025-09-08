'use client';

import { LoadingSpinner } from '@/components/1_atoms/common/loading-spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGroups } from '@/hooks/use-groups';
import { useTeam } from '@/hooks/use-teams';
import { teamService } from '@/services/team-service';
import type { Team } from '@/types/team';
import { teamFormSchema, type TeamFormData } from '@/validations/team-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string; // 編集の場合のみ指定
  onSuccess?: (team: Team) => void;
}

const colorOptions = [
  { value: '#3B82F6', label: 'ブルー', color: 'bg-blue-500' },
  { value: '#10B981', label: 'グリーン', color: 'bg-green-500' },
  { value: '#F59E0B', label: 'オレンジ', color: 'bg-amber-500' },
  { value: '#EF4444', label: 'レッド', color: 'bg-red-500' },
  { value: '#8B5CF6', label: 'パープル', color: 'bg-violet-500' },
  { value: '#EC4899', label: 'ピンク', color: 'bg-pink-500' },
  { value: '#6B7280', label: 'グレー', color: 'bg-gray-500' },
  { value: '#14B8A6', label: 'ティール', color: 'bg-teal-500' },
];

export function TeamModal({ open, onOpenChange, teamId, onSuccess }: TeamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!teamId;

  // 編集の場合のみチームデータを取得
  const { data: existingTeam, loading: loadingTeam, error: teamError } = useTeam(teamId || '');

  // グループ一覧を取得
  const { data: groups, loading: loadingGroups } = useGroups({ status: 'active' });

  // TODO: 実際の実装では認証されたユーザーの情報から取得
  const currentUserId = 'current-user-id';
  const currentFacilityId = 'current-facility-id';

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      groupId: '',
      facilityId: currentFacilityId,
      status: 'active',
      createdBy: currentUserId,
    },
  });

  // 編集時にフォームデータを初期化
  useEffect(() => {
    if (isEditing && existingTeam && !loadingTeam) {
      form.reset({
        name: existingTeam.name,
        description: existingTeam.description || '',
        color: existingTeam.color || '#3B82F6',
        groupId: existingTeam.groupId,
        facilityId: existingTeam.facilityId,
        status: existingTeam.status,
        createdBy: currentUserId,
      });
    } else if (!isEditing) {
      form.reset({
        name: '',
        description: '',
        color: '#3B82F6',
        groupId: '',
        facilityId: currentFacilityId,
        status: 'active',
        createdBy: currentUserId,
      });
    }
  }, [isEditing, existingTeam, loadingTeam, form, currentUserId, currentFacilityId]);

  // モーダルが閉じられた時にフォームをリセット
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);
    try {
      let result: Team;

      if (isEditing && teamId) {
        // 編集の場合
        const { groupId, facilityId, createdBy, ...updateData } = data;
        result = await teamService.update(teamId, updateData);
        toast.success('チームが更新されました');
      } else {
        // 作成の場合
        result = await teamService.create(data);
        toast.success('チームが作成されました');
      }

      onSuccess?.(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Team operation error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? 'チームの更新に失敗しました'
            : 'チームの作成に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // 編集時のローディング状態
  if (isEditing && loadingTeam) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>チームを編集</DialogTitle>
            <DialogDescription>チーム情報を読み込んでいます...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 編集時のエラー状態
  if (isEditing && (teamError || !existingTeam)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>チームを編集</DialogTitle>
            <DialogDescription>チーム情報の取得でエラーが発生しました。</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-destructive text-sm">{teamError || 'チームが見つかりません'}</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'チームを編集' : '新しいチームを作成'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'チーム情報を編集してください。'
              : '職員を効率的に管理するためのチームを作成してください。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* チーム名 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    チーム名 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="チーム名を入力してください"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    チームを識別するための名前を入力してください（50文字以内）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="チームの説明や目的を入力してください（任意）"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    チームの目的や特徴を説明してください（200文字以内）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* グループ選択 */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    所属グループ <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || loadingGroups || isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="グループを選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups?.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              {group.color && (
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: group.color }}
                                />
                              )}
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? 'チーム作成後はグループを変更できません'
                      : 'チームが所属するグループを選択してください'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* カラー選択 */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>チームカラー</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                colorOptions.find((opt) => opt.value === field.value)?.color ||
                                'bg-gray-500'
                              }`}
                            />
                            {colorOptions.find((opt) => opt.value === field.value)?.label ||
                              'カラーを選択'}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${option.color}`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    チームを視覚的に識別するためのカラーを選択してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ステータス */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ステータス <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            アクティブ
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            非アクティブ
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>チームの現在の状態を選択してください</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 隠しフィールド */}
            <input type="hidden" {...form.register('facilityId')} />
            <input type="hidden" {...form.register('createdBy')} />

            {/* ボタン */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? '更新中...' : '作成中...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? '変更を保存' : 'チームを作成'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
