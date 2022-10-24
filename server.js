// Imports
const express = require('express')
// Const
const app = express()
const port = 3000
// Express preferences
app.use(express.json())
// Post method buy order
app.post('/buyOrder', (req, res) => {
    console.log("Requisição feita por " + req.ip + "  ")
    console.log(req.body)
    res.send("Work!")
});
// Post method order
app.post('/refundOrder', (req, res) => {
    console.log("Requisição feita por " + req.ip + "  ")
    console.log(req.body)
    res.send("Work!")
});
// GetTest
app.get('/getTest', (req, res) => {
    res.send("<h1>Bot Traders Rodando</h1>")
});
// Port listen
app.listen(port, () => {
    console.log(`The server started on port ${port}`)
})
