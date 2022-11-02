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
    getUser
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
    console.log("Buy Order by => " + req.ip + "  ")
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        const eventType = body.event
        if (await isUser(email)) {
                console.log("is user")
                const idUser = await getIdTelegram(email).then((result) => { return result[0].idTelegram })
                const user = await getUser(idUser)
                console.log(user[0].status)
                if(user[0].status === (status.REFOUND)){
                    await unBanPerson(idUser).finally(() => {
                        console.log("UnBanPerson")
                        registerAgain(email, orderCode)
                    })
                }
                return res.status(200).send()
        } else {
            console.log("is not a user")
            pushNewUser(email, orderCode)
            return res.status(200).send()
        }
    } catch (error) {
        console.log("ERRO BUY ORDER")
        console.log(error)
        res.status(400).send()
    }
});

// Post method refund order (Incomplete)
app.post('/refundOrder', async (req, res) => {
    try {
        console.log("RefundOrder")
        const body = req.body
        const email = body.data.buyer.email
        await updateStatus(status.REFOUND, email)
            .then(() => {
                axios({
                    method: 'get',
                    url: fetchWebHookRef,
                    headers: {},
                    data: {}
                })
                res.send()
            })
    } catch (error) {
        console.log("ERRO REFUND ORDER")
        console.log(error)
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