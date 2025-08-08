import { useState, useCallback, useReducer } from 'react';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

type FormAction<T> =
  | { type: 'SET_VALUE'; field: keyof T; value: any }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_TOUCHED'; field: keyof T; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; initialValues: T }
  | { type: 'SET_VALUES'; values: Partial<T> };

function formReducer<T>(state: FormState<T>, action: FormAction<T>): FormState<T> {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: undefined // Clear error when value changes
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: action.touched
        }
      };
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };
    
    case 'RESET':
      return {
        values: action.initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true
      };
    
    case 'SET_VALUES':
      return {
        ...state,
        values: {
          ...state.values,
          ...action.values
        }
      };
    
    default:
      return state;
  }
}

interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
) {
  const { initialValues, validate, onSubmit } = options;

  const [state, dispatch] = useReducer(formReducer<T>, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  });

  const setValue = useCallback((field: keyof T, value: any) => {
    dispatch({ type: 'SET_VALUE', field, value });
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    dispatch({ type: 'SET_TOUCHED', field, touched });
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    dispatch({ type: 'SET_VALUES', values });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues });
  }, [initialValues]);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    const errors = validate(state.values);
    const hasErrors = Object.keys(errors).length > 0;
    
    // Update errors in state
    Object.entries(errors).forEach(([field, error]) => {
      dispatch({ type: 'SET_ERROR', field: field as keyof T, error });
    });
    
    return !hasErrors;
  }, [validate, state.values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!onSubmit) return;
    
    const isValid = validateForm();
    if (!isValid) return;
    
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await onSubmit(state.values);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [onSubmit, state.values, validateForm]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: state.values[field],
    onChange: (value: any) => setValue(field, value),
    onBlur: () => setTouched(field, true),
    error: state.errors[field],
    touched: state.touched[field]
  }), [state.values, state.errors, state.touched, setValue, setTouched]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setError,
    setTouched,
    setValues,
    reset,
    validateForm,
    handleSubmit,
    getFieldProps
  };
}
