import axios from 'axios';

export const forumAxios = axios.create({
    baseURL: `https://epremki.com/`,
    headers: {
        Cookie: `mybbuser=${process.env.MYBB_COOKIE};`
    }
})