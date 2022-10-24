// Imports
import express from 'express'
// Const
const app = express()
const PORT = 3000
// Express preferences
app.use(express.json())
// Post method
app.post('/', (req, res) => {
    console.log("Requisição feita por " + req.ip + "  ")
    console.log(req.body)
    res.send("Work!")
});
// GetTest
app.get('/getTest', (req, res) => {
    res.send("<h1>Bot Traders Rodando</h1>")
});
// Port listen
app.listen(PORT, () => {
    console.log(`The server started on port ${port}`)
})
