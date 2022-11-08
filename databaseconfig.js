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
    REGISTER: 3,
    EMPTY: 0
}

export function isNewUser(orderCode) {
    try {
        console.log('isNewUser inside')
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE orderCode = ? AND status = ?", [orderCode, status.EMPTY], async (error, rows) => {
                if (error) {
                    reject(error)
                } else {
                    if (rows.length > 0) {
                        rows.forEach((user) => {
                            user.status === 0 ? resolve(true) : resolve(false)
                        })
                    } else {
                        resolve(false)
                    }
                }
            })
        })
    } catch (error) { console.log(error) }
}

export function isRegisterById(idUser) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE idTelegram = ?", [idUser], async (error, rows) => {
                if (error) {
                    console.log(error)
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
    } catch (error) { console.log(error) }
}

export function isActiveById(idUser) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE idTelegram = ? AND status = ? OR ?", [idUser,status.BUY,status.EMPTY], async (error, rows) => {
                if (error) {
                    console.log(error)
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
    } catch (error) { console.log(error) }
}

export function getUser(idUser) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE idTelegram = ?", [idUser], async (error, rows) => {
                error ? reject(error) : resolve(rows)
            })
        })
    } catch (error) { console.log(error) }
}

export function getAllUsers() {
    try {
        return new Promise((resolve, reject) => { db.all("SELECT * FROM user", [], (error, rows) => { error ? reject(error) : resolve(rows) }) })
    } catch (error) { console.log(error) }
}

export function pushNewUser(email, orderCode) {
    try {
        db.run('INSERT INTO user (email,orderCode) values (?,?)', [email, orderCode])
    } catch (error) { console.log(error) }
}

export function updateStatus(status, email) {
    try {
        return new Promise((resolve, reject) => {
            db.run("UPDATE user SET status = ? WHERE email = ?", [status, email], (error) => {
                error ? reject(error) : resolve()
            })
        })
    } catch (error) { console.log(error) }
}

export function getLinksById(idTelegram) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE idTelegram = ?",
                [idTelegram],
                (error, rows) => {
                    {
                        if (error) {
                            reject(error)
                        } else {
                            resolve({
                                link1: rows[0].link1,
                                link2: rows[0].link2,
                                link3: rows[0].link3
                            })
                        }
                    }
                })
        })
    } catch (error) { console.log(error) }
}

export function isUser(email) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE email = ?",
                [email],
                (error, rows) => {
                    if (error) { reject(error) } else { rows.length > 0 ? resolve(true) : resolve(false) }
                })
        })
    } catch (error) { console.log(error) }
}

export function registerNewUser(idTelegram, orderCode, links) {
    try {
        db.run("UPDATE user SET idTelegram = ?, link1 = ?, link2 = ?, link3 = ?, status = ? WHERE orderCode = ?",
            [idTelegram, links.link1, links.link2, links.link3, status.BUY, orderCode])
    } catch (error) { console.log(error) }
}

export function botRefoundRoutine(orderCode) {
    try {
        db.run("UPDATE user SET , status = ? WHERE orderCode = ?",
            [status.REFOUND, orderCode])
    } catch (error) { console.log(error) }
}

export function isRegisterOrderCode(orderCode) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT orderCode FROM user WHERE orderCode = ?", [orderCode], (error, rows) => {
                if (error) {
                    reject(error)
                } else {
                    rows.length > 0 ? resolve(true) : resolve(false)
                }
            })
        })
    } catch (error) { console.log(error) }
}

export function registerAgain(email, orderCode) {
    try {
        db.run("UPDATE user SET orderCode = ?, link1 = ?, link2 = ?, link3 = ?, status = ? WHERE email = ?",
            [orderCode, null, null, null, status.EMPTY, email], (error) => { console.log(error) })
    } catch (error) { console.log(error) }
}

export function getIdTelegram(email) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT idTelegram FROM user WHERE email = ?", [email], (error, idTelegram) => {
                if (error) { reject(error) } else { resolve(idTelegram) }
            })
        })
    } catch (error) { console.log(error) }
}

export function getBanIds() {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE status = ?", [status.REFOUND], (error, rows) => {
                error ? reject(error) : resolve(rows)
            })
        })
    } catch (error) { console.log(error) }
}

export function isBuyBack(email) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE email = ?", [email], ((error, rows) => {
                if (!error) {
                    rows[0].status === (status.BUY || status.EMPTY) ? resolve(true) : resolve(false)
                } else {
                    reject(error)
                }
            }))
        })
    } catch (error) {
        return error
    }
}

export function setStateByMail(status, email) {
    try {
        db.run("UPDATE user SET status = ? WHERE email = ?", [status, email], ((error) => { }))
    } catch (error) {
    }
}

export function isUserRegister(email) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM user WHERE email = ?", [email], ((error, rows) => {
                if (!error) {
                    rows[0].status === (status.REGISTER) ? resolve(true) : resolve(false)
                } else {
                    reject(error)
                }
            }))
        })
    } catch (error) {
        return error
    }
}

export function getStatusByEmail(email) {
    try {
        return new Promise((resolve, reject) => {
            db.all("SELECT status FROM user WHERE email = ?", [email], ((error, rows) => {
                if (!error) {
                    resolve(rows[0].status)
                } else {
                    reject(error)
                }
            }))
        })
    } catch (error) {
        return error
    }
}

export function getOrderCodeById(idTelegram) {
    return new Promise((resolve, reject) => {
        db.all("SELECT orderCode FROM user WHERE idTelegram = ?", [idTelegram], (error, rows) => {
            if(error){
                reject(error)
            }else{
                resolve(rows)
            }
        })
    })
}