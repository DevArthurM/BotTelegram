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
                await content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!`)
                await content.reply(`Insira seu código de compra.`)
                await content.reply(`🚨 OS CÓDIGOS DE COMPRA SÃO INICIADOS COM HP 🚨`)
                await content.reply(`Completando essa etapa de cadastro iremos te enviar o link do nosso grupo!`)
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
    const isAdmin = env.idsVipTelegram.includes(idUser)
    const isACode = text.slice(0, 2) === ("HP" || "hP" || "Hp" || "hp") && text.length === 16
    const errorMessage = content.reply("Digite um código válido.")
    // Routines
    if (isACode) {
        content.reply("Código validado com sucesso!\n link grupo 1: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br")
    } else {
        switch (text) {
            case "resume":
                if (isAdmin) {
                    content.reply("OnResumeMode")
                } else {
                    errorMessage
                }
                break;
            default:
                errorMessage
                break;
        }
    }
})




