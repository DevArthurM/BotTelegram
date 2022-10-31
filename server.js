//Imports
import express from 'express'
import axios from 'axios'
import {
    isUser,
    updateStatus,
    pushNewUser,
    status,
    registerAgain,
    getIdTelegram
} from './databaseconfig.js'
import { fetchWebHook } from './env.js'

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
        console.log(getIdTelegram(email))
        if (await isUser(email)) {
            registerAgain(email, orderCode)
            console.log('look')
            return res.status(200).send()
        } else {
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
    try {
        const body = req.body
        const email = body.data.buyer.email
        await updateStatus(status.REFOUND, email)
            .then(() => { axios.get(fetchWebHook).then().finally() })
    } catch (error) {
        console.log(error)
    }
    return;
});