//Imports
import express from 'express'
import axios from 'axios'
import {
    isUser,
    pushNewUser,
    status,
    registerAgain,
    getIdTelegram,
    setStateByMail,
    getStatusByEmail,
} from './databaseconfig.js'
import { fetchWebHookRef, fetchWebHookBuy } from './env.js'

// Const
const app = express()
const port = 3000

// Express config
app.use(express.json())
app.listen(port, () => {
    console.log(`The server started on port ${port}`)
})

// Post method buy order (Completed)
app.post('/buyOrder', async (req, res) => {
    console.log(`buyOrder - Start`)
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        if (await isUser(email)) {
            const statusUser = await getStatusByEmail(email)
            if (statusUser === status.REFOUND) {
                const idUser = await getIdTelegram(email).then((result) => { return result[0].idTelegram })
                await unBanPerson(idUser).finally(() => {
                    registerAgain(email, orderCode)
                }).finally(() => {
                    console.log(`unBanPerson => ${email}`)
                })
            } else {
                console.log(`is not a refound order  => ${email}`)
            }
            return res.status(200).send()
        } else {
            console.log(`pushNewUser  => ${email}`)
            pushNewUser(email, orderCode)
            return res.status(200).send()
        }
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
});

// Post method refund order (Incomplete)
app.post('/refundOrder', async (req, res) => {
    console.log(`refundOrder - Start`)
    try {
        const body = req.body
        const eventType = body.event
        const email = eventType === "SUBSCRIPTION_CANCELLATION" ? await body.data.subscriber.email : await body.data.buyer.email
        if (isUser(email)) {
            setStateByMail(status.REFOUND, email)
            banPerson(email).finally(() => {
                console.log(`User ${email} banned`)
                res.send()
            })
        }
    } catch (error) {
        console.log(`Refund order error.`)
        console.log(error)
        res.send()
    }
    return;
});

function unBanPerson(idTelegram) {
    console.log(`unBanChatMember => ${idTelegram}`)
    return axios({
        method: 'post',
        url: fetchWebHookBuy,
        headers: {},
        data: { idTelegram: idTelegram }
    })
}

function banPerson(email) {
    console.log(`BanChatMember => ${email}`)
    return axios({
        method: 'post',
        url: fetchWebHookRef,
        headers: {},
        data: { email: email }
    })
}