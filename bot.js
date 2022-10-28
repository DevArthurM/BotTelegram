// Const imports
const env = require('./.env')
const Telegraf = require('telegraf')
const sqlite3 = require('sqlite3').verbose()
// Launch bot.
const bot = new Telegraf.Telegraf(env.token);
bot.launch()
//Connect db
const db = new sqlite3.Database(env.pathDB, sqlite3.OPEN_READWRITE, (error) => {
    if (error) return console.error(error)
})

// Start command.
bot.start((content) => {
    const idUser = content.from.id
    const name = content.update.message.from.first_name
    try {
        db.all("SELECT * FROM user WHERE idTelegram = ?", [idUser], async (error, rows) => {
            console.log(rows)
            if (rows.length > 0) {
                await content.reply(`Você já possui um cadastro conosco.`)
            } else {
                await content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!\nDigite seu e-mail de compra da hotmart.\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
            }
        })
    } catch (error) {
        content.reply(`Erro ao iniciar o bot.`)
    }
})

// Read text
bot.on("text", async (content) => {
    //Routines
    const text = content.message.text
    const idUser = content.from.id
    const name = content.from.first_name
    const isAdmin = env.idsVipTelegram.includes(idUser)
    // Routines
    db.all("SELECT * FROM user WHERE idTelegram = ? AND email = ?", [idUser, text], async (error, rows) => {
        if (error) {
            content.reply(`Erro ao validar código.`)
        } else {
            if (rows.length > 0) {
                await content.reply(`${name}, você já possui um cadastro conosco.`)
            } else {
                db.all("UPDATE user SET idTelegram = ? WHERE email = ?", [idUser, text], (error) => {
                    if (error) {
                        content.reply("Um erro ocorreu ao realizar o cadastro.")
                    } else {
                        // TO-DO Generate telegram link.
                        content.reply(`${name} seu cadastro foi realizado com sucesso!`)
                    }
                })
            }
        }
    })
})




