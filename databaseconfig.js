// Imports
import { pathDB } from './env.js'
import sqlite3 from 'sqlite3'
// Constants
const db = new sqlite3.Database(pathDB, sqlite3.OPEN_READWRITE, (error) => {
    if (error) return console.error(error)
})

// Functions
export const status = {
    BUY: 1,
    REFOUND: 2,
    EMPTY: 0
}

export function isNewUser(orderCode) {
    console.log('isNewUser inside')
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE orderCode = ? AND status = ?", [orderCode, status.EMPTY], async (error, rows) => {
            if (error) {
                reject(error)
            } else {
                if (rows.length > 0) {
                    rows.forEach((user) => {
                        user.idTelegram === "undefined" ? resolve(true) : resolve(false)
                    })
                } else {
                    resolve(false)
                }
            }
        })
    })
}

export function isRegisterById(idUser) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE idTelegram = ?", [idUser], async (error, rows) => {
            if (error) {
                console.log('error')
                reject(error)
            } else {
                console.log(rows.length)
                console.log(rows)
                if (rows.length > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

export function getUser(idUser) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE idTelegram = ?", [idUser], async (error, rows) => {
            error ? reject(error) : resolve(rows)
        })
    })
}

export function getAllUsers() {
    return new Promise((resolve, reject) => { db.all("SELECT * FROM user", [], (error, rows) => { error ? reject(error) : resolve(rows) }) })
}

export function pushNewUser(email, orderCode) {
    db.run('INSERT INTO user (email,orderCode) values (?,?)', [email, orderCode])
}

export function updateStatus(status, email) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE user SET status = ? WHERE email = ?", [status, email], (error) => {
            error ? reject(error) : resolve()
        })
    })
}

export function getLinks(email) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE email = ?",
            [email],
            (error, rows) => {
                {
                    if (error) {
                        reject(error)
                    } else {
                        resolve({
                            link1: rows.link1,
                            link2: rows.link2,
                            link3: rows.link3
                        })
                    }
                }
            })
    })
}

export function isUser(email) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE email = ?",
            [email],
            (error, rows) => {
                if (error) { reject(error) } else { rows.length > 0 ? resolve(true) : resolve(false) }
            })
    })
}

export function registerNewUser(idTelegram, orderCode, links) {
    db.run("UPDATE user SET idTelegram = ?, link1 = ?, link2 = ?, link3 = ?, status = ? WHERE orderCode = ?",
        [idTelegram, links.link1, links.link2, links.link3, status.BUY, orderCode])
}

export function botRefoundRoutine(idTelegram, orderCode, links) {
    db.run("UPDATE user SET , status = ? WHERE orderCode = ?",
        [status.REFOUND, orderCode])
}

export function isRegisterOrderCode(orderCode) {
    return new Promise((resolve, reject) => {
        db.all("SELECT orderCode FROM user WHERE orderCode = ?", [orderCode], (error, rows) => {
            if (error) {
                reject(error)
            } else {
                rows.length > 0 ? resolve(true) : resolve(false)
            }
        })
    })
}

export function registerAgain(email, orderCode) {
    db.run("UPDATE user SET idTelegram = ?,orderCode = ?, link1 = ?, link2 = ?, link3 = ?, status = ? WHERE email = ?",
        ["undefined", orderCode, null, null, null, status.EMPTY, email], (error) => { console.log(error) })
}

export function getIdTelegram(email) {
    return new Promise((resolve, reject) => {
        db.all("SELECT idTelegram FROM user WHERE email = ?", [email], (error, idTelegram) => {
            if (error) { reject(error) } else { resolve(idTelegram) }
        })
    })
}

export function getBanIds() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user WHERE status = ?", [status.REFOUND], (error, rows) => {
            error ? reject(error) : resolve(rows)
        })
    })
}