'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ja' | 'en';

const translations = {
    // Navigation
    home: { ja: "ホーム", en: "Home" },
    animals: { ja: "動物一覧", en: "Animals" },
    new_record: { ja: "新規記録", en: "New Record" },

    // Search
    search_placeholder: { ja: "動物名、個体識別番号などで検索...", en: "Search by name, microchip ID..." },

    // Animal Details
    name: { ja: "名前", en: "Name" },
    breed: { ja: "品種", en: "Breed" },
    owner: { ja: "所有者", en: "Owner" },
    sex: { ja: "性別", en: "Sex" },
    age: { ja: "年齢", en: "Age" },

    // SOAP
    subjective: { ja: "主観的所見 (S)", en: "Subjective (S)" },
    objective: { ja: "客観的所見 (O)", en: "Objective (O)" },
    assessment: { ja: "評価 (A)", en: "Assessment (A)" },
    plan: { ja: "計画 (P)", en: "Plan (P)" },

    // Actions
    transcribe: { ja: "音声文字起こし", en: "Transcribe Audio" },
    generate_soap: { ja: "SOAP生成", en: "Generate SOAP" },
    save: { ja: "保存", en: "Save" },
    cancel: { ja: "キャンセル", en: "Cancel" },

    // Status
    loading: { ja: "読み込み中...", en: "Loading..." },
    saving: { ja: "保存中...", en: "Saving..." },
    success: { ja: "成功", en: "Success" },
    error: { ja: "エラー", en: "Error" },

    // Demo Banner
    demo_mode: { ja: "デモモード", en: "Demo Mode" },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('ja');

    useEffect(() => {
        const saved = sessionStorage.getItem('LANG') as Language;
        if (saved && (saved === 'ja' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        sessionStorage.setItem('LANG', lang);
    };

    const t = (key: keyof typeof translations) => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
