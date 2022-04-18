import fetch from "node-fetch";

const API_URL = process.env.API_URL;
const TOKEN = process.env.TOKEN;

const headers = {
    'content-type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    'authorization': `${TOKEN}`
}

const request = async (method, url, data) => {
    const init = {method, headers};

    if (data !== undefined)
        init['body'] = JSON.stringify(data);
    try {
        const res = await fetch(API_URL + url, init);

        try {
            const body = await res.text();

            return JSON.parse(body);
        } catch (err) {
            return Promise.resolve();
        }
    } catch (err) {
        return Promise.reject(err);
    }
}

export const post = async (url, data) =>
    request('POST', url, data);

export const get = (url) =>
    request('GET', url);
