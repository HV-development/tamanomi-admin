import { useState, useCallback } from 'react';
import {
  validateRequired,
  validateMaxLength,
  validateEmail,
  validatePassword,
} from '@/utils/validation';
import { type AdminFormDataBase, type AdminFormField } from '@hv-development/schemas';

interface UseAdminFormReturn<T extends AdminFormDataBase> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: Partial<T>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (field: AdminFormField, value: string) => void;
  validateField: (field: AdminFormField, value: string) => void;
  validateAllFields: () => boolean;
}

export function useAdminForm<T extends AdminFormDataBase>(
  initialFormData: T
): UseAdminFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialFormData);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: AdminFormField, value: string) => {
      const newErrors = { ...errors };

      switch (field) {
        case 'role': {
          const roleError = validateRequired(value, '権限');
          if (roleError) {
            (newErrors as Partial<T>).role = roleError as T['role'];
          } else {
            delete (newErrors as Partial<T>).role;
          }
          break;
        }
        case 'lastName': {
          const lastNameError =
            validateRequired(value, '姓') || validateMaxLength(value, 50, '姓');
          if (lastNameError) {
            (newErrors as Partial<T>).lastName = lastNameError as T['lastName'];
          } else {
            delete (newErrors as Partial<T>).lastName;
          }
          break;
        }
        case 'firstName': {
          const firstNameError =
            validateRequired(value, '名') || validateMaxLength(value, 50, '名');
          if (firstNameError) {
            (newErrors as Partial<T>).firstName = firstNameError as T['firstName'];
          } else {
            delete (newErrors as Partial<T>).firstName;
          }
          break;
        }
        case 'email': {
          const emailError =
            validateRequired(value, 'メールアドレス') ||
            validateMaxLength(value, 255, 'メールアドレス') ||
            validateEmail(value);
          if (emailError) {
            (newErrors as Partial<T>).email = emailError as T['email'];
          } else {
            delete (newErrors as Partial<T>).email;
          }
          break;
        }
        case 'password': {
          const passwordError =
            validateRequired(value, 'パスワード') ||
            validateMaxLength(value, 255, 'パスワード') ||
            validatePassword(value);
          if (passwordError) {
            (newErrors as Partial<T>).password = passwordError as T['password'];
          } else {
            delete (newErrors as Partial<T>).password;
          }
          break;
        }
        case 'passwordConfirm': {
          const passwordConfirmError =
            validateRequired(value, 'パスワード確認') ||
            validateMaxLength(value, 255, 'パスワード確認') ||
            validatePassword(value);
          if (passwordConfirmError) {
            (newErrors as Partial<T>).passwordConfirm = passwordConfirmError as T['passwordConfirm'];
          } else {
            delete (newErrors as Partial<T>).passwordConfirm;
          }
          break;
        }
      }

      setErrors(newErrors);
    },
    [errors]
  );

  const validateAllFields = useCallback((): boolean => {
    const newErrors: Partial<T> = {};

    const roleError = validateRequired(formData.role, '権限');
    if (roleError) (newErrors as Partial<T>).role = roleError as T['role'];

    const lastNameError =
      validateRequired(formData.lastName, '姓') ||
      validateMaxLength(formData.lastName, 50, '姓');
    if (lastNameError) (newErrors as Partial<T>).lastName = lastNameError as T['lastName'];

    const firstNameError =
      validateRequired(formData.firstName, '名') ||
      validateMaxLength(formData.firstName, 50, '名');
    if (firstNameError) (newErrors as Partial<T>).firstName = firstNameError as T['firstName'];

    const emailError =
      validateRequired(formData.email, 'メールアドレス') ||
      validateMaxLength(formData.email, 255, 'メールアドレス') ||
      validateEmail(formData.email);
    if (emailError) (newErrors as Partial<T>).email = emailError as T['email'];

    const passwordError =
      validateRequired(formData.password, 'パスワード') ||
      validateMaxLength(formData.password, 255, 'パスワード') ||
      validatePassword(formData.password);
    if (passwordError) (newErrors as Partial<T>).password = passwordError as T['password'];

    const passwordConfirmError =
      validateRequired(formData.passwordConfirm, 'パスワード確認') ||
      validateMaxLength(formData.passwordConfirm, 255, 'パスワード確認') ||
      validatePassword(formData.passwordConfirm);
    if (passwordConfirmError)
      (newErrors as Partial<T>).passwordConfirm = passwordConfirmError as T['passwordConfirm'];

    const passwordMatchError =
      formData.password !== formData.passwordConfirm ? 'パスワードが一致しません' : null;
    if (passwordMatchError)
      (newErrors as Partial<T>).passwordConfirm = passwordMatchError as T['passwordConfirm'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: AdminFormField, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // リアルタイムバリデーション
      validateField(field, value);
    },
    [validateField]
  );

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    validateField,
    validateAllFields,
  };
}

