import { useReducer, useCallback } from 'react';
import { ProductWithUnit } from './useProducts';

interface ProductState {
  showForm: boolean;
  productToEdit: ProductWithUnit | null;
  productToDelete: string | null;
  selectedProducts: string[];
  isBulkEditing: boolean;
}

type ProductAction =
  | { type: 'SHOW_FORM'; show: boolean }
  | { type: 'SET_PRODUCT_TO_EDIT'; product: ProductWithUnit | null }
  | { type: 'SET_PRODUCT_TO_DELETE'; productId: string | null }
  | { type: 'SELECT_PRODUCT'; productId: string }
  | { type: 'DESELECT_PRODUCT'; productId: string }
  | { type: 'SELECT_ALL_PRODUCTS'; productIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_BULK_EDITING'; isEditing: boolean }
  | { type: 'RESET_STATE' };

const initialState: ProductState = {
  showForm: false,
  productToEdit: null,
  productToDelete: null,
  selectedProducts: [],
  isBulkEditing: false
};

function productStateReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'SHOW_FORM':
      return { ...state, showForm: action.show };
    
    case 'SET_PRODUCT_TO_EDIT':
      return { 
        ...state, 
        productToEdit: action.product,
        showForm: action.product !== null 
      };
    
    case 'SET_PRODUCT_TO_DELETE':
      return { ...state, productToDelete: action.productId };
    
    case 'SELECT_PRODUCT':
      return {
        ...state,
        selectedProducts: state.selectedProducts.includes(action.productId)
          ? state.selectedProducts
          : [...state.selectedProducts, action.productId]
      };
    
    case 'DESELECT_PRODUCT':
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(id => id !== action.productId)
      };
    
    case 'SELECT_ALL_PRODUCTS':
      return {
        ...state,
        selectedProducts: action.productIds
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedProducts: []
      };
    
    case 'SET_BULK_EDITING':
      return {
        ...state,
        isBulkEditing: action.isEditing
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

export function useProductState() {
  const [state, dispatch] = useReducer(productStateReducer, initialState);

  const showProductForm = useCallback(() => {
    dispatch({ type: 'SHOW_FORM', show: true });
  }, []);

  const hideProductForm = useCallback(() => {
    dispatch({ type: 'SHOW_FORM', show: false });
  }, []);

  const editProduct = useCallback((product: ProductWithUnit) => {
    dispatch({ type: 'SET_PRODUCT_TO_EDIT', product });
  }, []);

  const cancelEdit = useCallback(() => {
    dispatch({ type: 'SET_PRODUCT_TO_EDIT', product: null });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    dispatch({ type: 'SET_PRODUCT_TO_DELETE', productId });
  }, []);

  const cancelDelete = useCallback(() => {
    dispatch({ type: 'SET_PRODUCT_TO_DELETE', productId: null });
  }, []);

  const selectProduct = useCallback((productId: string) => {
    dispatch({ type: 'SELECT_PRODUCT', productId });
  }, []);

  const deselectProduct = useCallback((productId: string) => {
    dispatch({ type: 'DESELECT_PRODUCT', productId });
  }, []);

  const selectAllProducts = useCallback((productIds: string[]) => {
    dispatch({ type: 'SELECT_ALL_PRODUCTS', productIds });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setBulkEditing = useCallback((isEditing: boolean) => {
    dispatch({ type: 'SET_BULK_EDITING', isEditing });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return {
    ...state,
    showProductForm,
    hideProductForm,
    editProduct,
    cancelEdit,
    deleteProduct,
    cancelDelete,
    selectProduct,
    deselectProduct,
    selectAllProducts,
    clearSelection,
    setBulkEditing,
    resetState
  };
}
