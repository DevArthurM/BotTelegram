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
    try {
        const message = content.update.message
        const name = content.update.message.from.first_name
        content.reply("Seja bem vindo(a) " + name + "!\nÉ um prazer ter você na industria do Trader!")
        content.reply("Insira seu código de compra.\n\n 🚨 OS CÓDIGOS DE COMPRA SÃO INICIADOS COM HP 🚨 \n\nCompletando essa etapa de cadastro iremos te enviar o link do nosso grupo!")
        console.log(message)
    } catch (err) {
        console.log(err)
    }
})

// Read text
bot.on("text", async (content) => {
    const text = content.message.text
    const idUser = content.from.id
    const isAdmin = env.idsVipTelegram.includes(idUser)
    const isACode = text.slice(0, 2) === "HP" && text.length() == 16
    if (isACode) {
        content.reply("Código validado com sucesso!\n link grupo 1: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br")
    } else if
        (text === "resume" && isAdmin) {
        db.all("SELECT * FROM user", [], async (error, rows) => {
            if (rows.length === 0) {
                content.reply("Nenhum usuário no banco dos Traders.")
            } else {
                await content.reply("LISTA DE PESSOAS CADASTRADAS EM SEU BANCO DE DADOS.")
                rows.forEach((index) => {
                    content.reply(`${index.email}`)
                })
            }
        })
    } else {
        content.reply("Digite um código válido.")
    }
})




