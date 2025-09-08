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
import { useGroup } from '@/hooks/use-groups';
import { groupService } from '@/services/group-service';
import type { Group } from '@/types/group';
import { groupFormSchema, type GroupFormData } from '@/validations/group-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string; // 編集の場合のみ指定
  onSuccess?: (group: Group) => void;
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

export function GroupModal({ open, onOpenChange, groupId, onSuccess }: GroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!groupId;

  // 編集の場合のみグループデータを取得
  const { data: existingGroup, loading: loadingGroup, error: groupError } = useGroup(groupId || '');

  // TODO: 実際の実装では認証されたユーザーの情報から取得
  const currentUserId = 'current-user-id';
  const currentFacilityId = 'current-facility-id';

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      facilityId: currentFacilityId,
      status: 'active',
      createdBy: currentUserId,
    },
  });

  // 編集時にフォームデータを初期化
  useEffect(() => {
    if (isEditing && existingGroup && !loadingGroup) {
      form.reset({
        name: existingGroup.name,
        description: existingGroup.description || '',
        color: existingGroup.color || '#3B82F6',
        facilityId: existingGroup.facilityId,
        status: existingGroup.status,
        createdBy: currentUserId,
      });
    } else if (!isEditing) {
      form.reset({
        name: '',
        description: '',
        color: '#3B82F6',
        facilityId: currentFacilityId,
        status: 'active',
        createdBy: currentUserId,
      });
    }
  }, [isEditing, existingGroup, loadingGroup, form, currentUserId, currentFacilityId]);

  // モーダルが閉じられた時にフォームをリセット
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: GroupFormData) => {
    setIsSubmitting(true);
    try {
      let result: Group;

      if (isEditing && groupId) {
        // 編集の場合
        const { facilityId, createdBy, ...updateData } = data;
        result = await groupService.update(groupId, updateData);
        toast.success('グループが更新されました');
      } else {
        // 作成の場合
        result = await groupService.create(data);
        toast.success('グループが作成されました');
      }

      onSuccess?.(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Group operation error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditing
            ? 'グループの更新に失敗しました'
            : 'グループの作成に失敗しました'
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
  if (isEditing && loadingGroup) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>グループを編集</DialogTitle>
            <DialogDescription>グループ情報を読み込んでいます...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 編集時のエラー状態
  if (isEditing && (groupError || !existingGroup)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>グループを編集</DialogTitle>
            <DialogDescription>グループ情報の取得でエラーが発生しました。</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-destructive text-sm">{groupError || 'グループが見つかりません'}</p>
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
          <DialogTitle>{isEditing ? 'グループを編集' : '新しいグループを作成'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'グループ情報を編集してください。'
              : '職員を効率的に管理するためのグループを作成してください。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* グループ名 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    グループ名 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="グループ名を入力してください"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    グループを識別するための名前を入力してください（50文字以内）
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
                      placeholder="グループの説明や目的を入力してください（任意）"
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    グループの目的や特徴を説明してください（200文字以内）
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
                  <FormLabel>グループカラー</FormLabel>
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
                    グループを視覚的に識別するためのカラーを選択してください
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
                  <FormDescription>グループの現在の状態を選択してください</FormDescription>
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
                    {isEditing ? '変更を保存' : 'グループを作成'}
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
