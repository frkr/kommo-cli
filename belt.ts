import {load} from "https://deno.land/std@0.219.0/dotenv/mod.ts";

interface Env {
    KOMMO_LONGLIVED_TOKEN: string;
    DOMAIN: string;
}

let params = {};
Object.keys({
    KOMMO_LONGLIVED_TOKEN: '',
    DOMAIN: '',
} as Env).forEach((k) => {
    Deno.env.get(k) && (params[k] = Deno.env.get(k));
});

params = {
    ...params,
    ...await load() as Env
};

export const env = params as Env;

export function urlmake(env, args: string[]) {
    return `https://${env.DOMAIN}.kommo.com/api/v4/${args.join('/')}`
}

export const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.KOMMO_LONGLIVED_TOKEN}`
};

export function onlyNumbers(text: string): string {
    return new String(text).replaceAll(/[^0-9]/g, '');
}

export function getUniqueListBy(arr: any[], key: string) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}
