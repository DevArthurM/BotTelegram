// Imports
const env = require('./.env')
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
// TO DO Telegraf implementation
// const Telegraf = require('telegraf')

// Const
const app = express()
const port = 3000

// Building database.
const db = new sqlite3.Database(env.pathDB, sqlite3.OPEN_READWRITE, (error) => {
    if (error) return console.error(error)
})

// Express config
app.use(express.json())
app.listen(port, () => {
    console.log(`The server started on port ${port}`)
})

// Post method buy order (Completed)
app.post('/buyOrder', (req, res) => {
    console.log("Buy Order by => " + req.ip + "  ")
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        db.run('INSERT INTO user (email,orderCode) values (?,?)', [email, orderCode], (error) => {
            if (error) console.log(error)
        })
    } catch (error) {
        console.log(error)
    }
});

// Post method refund order (Incomplete)
app.post('/refundOrder', (req, res) => {
    console.log("Refund Order by =>  " + req.ip + "  ")
    try {
        const body = req.body
        const orderCode = body.data.purchase.transaction
        const email = body.data.buyer.email
        db.run('UPDATE user SET status = ? WHERE email = ? and orderCode = ?', [2, email, orderCode], (error) => {
            if (error) throw error
            console.log(`User ${email} update status to ${2}`)
        })
        db.all('SELECT * FROM user WHERE email = ? AND orderCode = ?', [email, orderCode], (error, rows) => {
            const user = rows
            const link1 = user.link1
            const link2 = user.link2
            const link3 = user.link3
            //
            // Remove from group.
        })
    } catch (error) {
        console.log(error)
    }
});

// GetTest
app.get('/getTest', (req, res) => {
    res.send("<h1>Server is Running</h1>")
})


