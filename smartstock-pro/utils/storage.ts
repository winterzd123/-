
import { AppState } from '../types';

const STORAGE_KEY = 'smart_stock_pro_data_v2';

export const saveState = (state: AppState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("无法保存数据", err);
  }
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return { products: [], transactions: [] };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("无法加载数据", err);
    return { products: [], transactions: [] };
  }
};
