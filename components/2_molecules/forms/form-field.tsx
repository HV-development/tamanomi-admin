import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { ComponentProps, useState } from 'react';
import { FieldValues, Path, useFormContext } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  description?: string;
}

export function FormFieldComponent<T extends FieldValues>({
  name,
  label,
  required = false,
  className,
  children,
  description,
}: FormFieldProps<T>) {
  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:text-red-500 after:ml-1'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>{children}</FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 入力フィールド用のヘルパーコンポーネント
interface InputFieldProps<T extends FieldValues> extends Omit<ComponentProps<'input'>, 'name'> {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export function InputField<T extends FieldValues>({
  name,
  label,
  required = false,
  className,
  description,
  ...inputProps
}: InputFieldProps<T>) {
  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:text-red-500 after:ml-1'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <input
              {...field}
              {...inputProps}
              value={inputProps.type === 'number' ? field.value || '' : (field.value ?? '')}
              onChange={(e) => {
                if (inputProps.type === 'number') {
                  const value = e.target.value;
                  field.onChange(value === '' ? undefined : Number(value));
                } else {
                  field.onChange(e.target.value);
                }
              }}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
                'text-sm ring-offset-background file:border-0 file:bg-transparent',
                'file:text-sm file:font-medium placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
              )}
            />
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// テキストエリアフィールド用のヘルパーコンポーネント
interface TextareaFieldProps<T extends FieldValues>
  extends Omit<ComponentProps<'textarea'>, 'name'> {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  required = false,
  className,
  description,
  ...textareaProps
}: TextareaFieldProps<T>) {
  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:text-red-500 after:ml-1'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <textarea
              {...field}
              {...textareaProps}
              value={field.value ?? ''}
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2',
                'text-sm ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'resize-vertical',
                className
              )}
            />
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// パスワードフィールド用のヘルパーコンポーネント（表示切り替え機能付き）
interface PasswordFieldProps<T extends FieldValues>
  extends Omit<ComponentProps<'input'>, 'name' | 'type'> {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export function PasswordField<T extends FieldValues>({
  name,
  label,
  required = false,
  className,
  description,
  ...inputProps
}: PasswordFieldProps<T>) {
  const form = useFormContext<T>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:text-red-500 after:ml-1'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <input
                {...field}
                {...inputProps}
                type={showPassword ? 'text' : 'password'}
                value={field.value ?? ''}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10',
                  'text-sm ring-offset-background file:border-0 file:bg-transparent',
                  'file:text-sm file:font-medium placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  className
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// セレクトフィールド用のヘルパーコンポーネント
interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  required = false,
  className,
  description,
  options,
  placeholder = '選択してください',
}: SelectFieldProps<T>) {
  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:text-red-500 after:ml-1'
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <select
              {...field}
              value={field.value ?? ''}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
                'text-sm ring-offset-background focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
                'disabled:opacity-50',
                className
              )}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
