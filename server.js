//Imports
import express from 'express'
import {
    getLinks,
    isUser,
    updateStatus,
    pushNewUser,
    status
} from './databaseconfig.js'

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
        if (await isUser(email, orderCode)) {
            return res.status(403).send()
        } else {
            console.log(await isUser(email, orderCode))
            pushNewUser(email, orderCode)
            return res.status(200).send()
        }
    } catch (error) {
        res.status(400).send()
    }
});

// Post method refund order (Incomplete)
app.post('/refundOrder', (req, res) => {
    console.log("Refund Order by => " + req.ip + "  ")
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        updateStatus(status.REFOUND, email)
        const links = getLinks(email)
    } catch (error) {
        console.log(error)
    }
});