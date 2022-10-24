// Imports
const express = require('express')
// Const
const app = express()
const port = 3000
// Express preferences
app.use(express.json())
// Post method buy order
app.post('/buyOrder', (req, res) => {
    console.log("Requisição de compra feita por " + req.ip + "  ")
    try {
        const body = req.body
        const code = body.data.purchase.transaction
        const mailBuyer = body.data.buyer.email
        res.send(`code: ${code} e-mail: ${mailBuyer}`)
    } catch (error) {
        res.send("Error!" + error)
    }
});
// Post method order
app.post('/refundOrder', (req, res) => {
    console.log("Requisição de estorno feita por " + req.ip + "  ")
    try {
        const body = req.body
        const code = body.data.purchase.transaction
        const mailBuyer = body.data.buyer.email
        res.send(`code: ${code} e-mail: ${mailBuyer}`)
    } catch (error) {
        res.send("Error!" + error)
    }
});
// GetTest
app.get('/getTest', (req, res) => {
    res.send("<h1>Bot Traders Rodando</h1>")
});
// Port listen
app.listen(port, () => {
    console.log(`The server started on port ${port}`)
})
