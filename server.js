const express = require('express')
// Const
const app = express()
// Express preferences
app.use(express.json())
// Post method
app.post('/',(req, res) => {
    console.log("Requisição feita por " + req.ip + "  " )
    console.log(req.body)
    res.send("Work!")
});
// Port listen
app.listen(3000)
