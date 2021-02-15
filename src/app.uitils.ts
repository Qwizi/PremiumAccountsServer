import {Browser, Page} from "puppeteer";
import {MYBB_COOKIE_OBJ} from "./forums/forums.constants";

export const handle = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}

export const openPageWithProxy = async (page: Page, url: string) => {
    const proxyUrl = 'https://hide.me/pl/proxy';
    const inputSelector = 'input[name="u"]';
    const goButton = 'button[name="go"]';

    await page.setCookie(MYBB_COOKIE_OBJ);
    await page.goto(proxyUrl);
    await page.waitForSelector(inputSelector);
    console.log(url);
    // @ts-ignore
    await page.type(inputSelector, url);

    await page.click(goButton);
    return page;
}