//Imports
import express from 'express'
import axios from 'axios'
import {
    isUser,
    updateStatus,
    pushNewUser,
    status,
    registerAgain,
    getIdTelegram,
    getUser,
    setStateByMail,
    isUserRegister
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
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        const eventType = body.event
        if (await isUser(email)) {
            const idUser = await getIdTelegram(email).then((result) => { return result[0].idTelegram })
            const user = await getUser(idUser)
            if (user[0].status === (status.REFOUND)) {
                await unBanPerson(idUser).finally(() => {
                    registerAgain(email, orderCode)
                })
            } else if (user[0].status === (status.BUY)) {
                setStateByMail(status.REGISTER, email)
            }
            return res.status(200).send()
        } else {
            pushNewUser(email, orderCode)
            return res.status(200).send()
        }
    } catch (error) {
        res.status(400).send()
    }
});

// Post method refund order (Incomplete)
app.post('/refundOrder', async (req, res) => {
    try {
        const body = req.body
        const email = body.data.buyer.email
        const eventType = body.event
        if ((eventType === "PURCHASE_EXPIRED") && (await isUserRegister(email))) {
            setStateByMail(status.BUY, email)
            res.send()
        } else {
            await updateStatus(status.REFOUND, email)
                .then(() => {
                    axios({
                        method: 'post',
                        url: fetchWebHookRef,
                        headers: {},
                        data: { email: email }
                    })
                    res.send()
                })
        }
    } catch (error) {
    }
    return;
});

function unBanPerson(idTelegram) {
    return axios({
        method: 'post',
        url: fetchWebHookBuy,
        headers: {},
        data: { idTelegram: idTelegram }
    })
}