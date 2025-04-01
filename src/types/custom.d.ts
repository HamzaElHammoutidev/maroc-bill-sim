declare module 'i18next' {
  interface i18n {
    changeLanguage(lng: string): Promise<any>;
    language: string;
    dir(): string;
  }
  
  const i18n: {
    use(plugin: any): typeof i18n;
    init(options: any): Promise<any>;
    changeLanguage(lng: string): Promise<any>;
    language: string;
    t(key: string, options?: any): string;
    dir(): string;
  };
  
  export default i18n;
}

declare module 'react-i18next' {
  export function useTranslation(ns?: string | string[]): {
    t: (key: string, options?: any) => string;
    i18n: any;
  };
  
  export const initReactI18next: any;
}

declare module 'i18next-browser-languagedetector' {
  const LanguageDetector: any;
  export default LanguageDetector;
}

declare module 'i18next-http-backend' {
  const Backend: any;
  export default Backend;
} 