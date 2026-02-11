import React, { createContext, useContext, useState, useCallback } from 'react';
import zh from './zh.json';
import en from './en.json';

const translations = { zh, en };

const I18nContext = createContext();

export function I18nProvider({ children }) {
    const [locale, setLocale] = useState('zh');

    const t = useCallback((key) => {
        const keys = key.split('.');
        let value = translations[locale];
        for (const k of keys) {
            if (value == null) return key;
            value = value[k];
        }
        return value ?? key;
    }, [locale]);

    const toggleLocale = useCallback(() => {
        setLocale(prev => prev === 'zh' ? 'en' : 'zh');
    }, []);

    return (
        <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
