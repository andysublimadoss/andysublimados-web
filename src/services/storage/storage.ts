import { TabType } from '@/types';

const ACTIVE_TAB_KEY = 'andy_active_tab';

export const getActiveTab = (): TabType => {
  return (localStorage.getItem(ACTIVE_TAB_KEY) as TabType) || 'dashboard';
};

export const setActiveTab = (tab: TabType): void => {
  localStorage.setItem(ACTIVE_TAB_KEY, tab);
};

export const storage = {
  getActiveTab,
  setActiveTab
};
