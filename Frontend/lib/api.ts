// lib/api.ts
// 実API/フェイクAPIを環境変数で切り替える薄いラッパー
const isServer = typeof window === 'undefined';

import { fakeApi } from "@/lib/fakeApi";
import { api as realApi } from "@/lib/realApi";

function getClient() {
    if (isServer) {
        const useFakeEnv = (process.env.NEXT_PUBLIC_USE_FAKE || "false").toLowerCase() === "true";
        return useFakeEnv ? fakeApi : realApi;
    }
    const demo = sessionStorage.getItem('demo') === 'true';
    return demo ? fakeApi : realApi;
}

type ApiClientType = typeof realApi | typeof fakeApi;

export const api = new Proxy({} as ApiClientType, {
    get: (_target, prop) => {
        const client = getClient();
        return (client as any)[prop];
    }
});

// 後方互換のための関数エクスポート（単純委譲）
export const searchAnimals = (...args: any[]) => (api.searchAnimals as any)?.(...args);
export const fetchAnimalDetail = (...args: any[]) => (api.fetchAnimalDetail as any)?.(...args);
export const createAnimal = (...args: any[]) => (api.createAnimal as any)?.(...args);
export const createRecord = (...args: any[]) => (api.createRecord as any)?.(...args);
export const updateRecord = (...args: any[]) => (api.updateRecord as any)?.(...args);
export const transcribeAudio = (...args: any[]) => (api.transcribeAudio as any)?.(...args);
export const generateSoapFromText = (...args: any[]) => (api.generateSoapFromText as any)?.(...args);
export const generateSoapFromAudio = (...args: any[]) => (api.generateSoapFromAudio as any)?.(...args);
export const generateSoapFromInput = (...args: any[]) => (api.generateSoapFromInput as any)?.(...args);
export const uploadImage = (...args: any[]) => (api.uploadImage as any)?.(...args);
export const uploadImages = (...args: any[]) => (api.uploadImages as any)?.(...args);
export const translateText = (...args: any[]) => (api.translateText as any)?.(...args);


