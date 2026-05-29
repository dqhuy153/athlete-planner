'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AdminLocale = 'vi' | 'en';

export interface LangContextValue {
  locale: AdminLocale;
  setLocale: (l: AdminLocale) => void;
  t: (key: string) => string;
}

const translations: Record<AdminLocale, Record<string, string>> = {
  vi: {
    'nav.users': 'Người dùng',
    'nav.exercises': 'Bài tập',
    'nav.blog': 'Blog',
    'nav.assets': 'Tài nguyên',
    'nav.config': 'Cài đặt',
    'common.logout': 'Đăng xuất',
    'common.loading': 'Đang tải...',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.create': 'Tạo mới',
    'common.admin': 'Quản trị',
    'theme.light': 'Sáng',
    'theme.dark': 'Tối',
  },
  en: {
    'nav.users': 'Users',
    'nav.exercises': 'Exercises',
    'nav.blog': 'Blog',
    'nav.assets': 'Assets',
    'nav.config': 'Config',
    'common.logout': 'Logout',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.admin': 'Admin',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
  },
};

const LangContext = createContext<LangContextValue>({
  locale: 'vi',
  setLocale: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('vi');

  useEffect(() => {
    const stored = localStorage.getItem('admin_lang');
    if (stored === 'vi' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(l: AdminLocale) {
    setLocaleState(l);
    localStorage.setItem('admin_lang', l);
  }

  function t(key: string): string {
    return translations[locale][key] ?? key;
  }

  return (
    <LangContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
