// Const imports
const env = require('./.env')
const Telegraf = require('telegraf');
const sqlite3 = require('sqlite3').verbose()
// Launch bot.
const bot = new Telegraf.Telegraf(env.token);
const status = {
    BUY: 1,
    REFOUND: 2,
    EMPTY: 0
}
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
                await content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!\nDigite seu código de compra.\n\n🚨ATENÇÃO! O CÓDIGO SE INICIA COM HP 🚨\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
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
    const isACode = text.slice(0, 2) === ("HP" || "hP" || "Hp" || "hp") && text.length === 16
    // Routines
    if (isACode) {
        db.all("SELECT * FROM user WHERE idTelegram = ? AND orderCode = ?", [idUser, text], async (error, rows) => {
            console.log()
            if (error) {
                content.reply(`Erro ao validar código.`)
            } else {
                if (rows.length > 1) {
                    await content.reply(`Cadastro duplicado no banco de dados! Fale com o suporte!`)
                } else if (rows.length === 1) {
                    await content.reply(`${name}, você já possui um cadastro conosco.`)
                }
                else {
                        db.all("UPDATE user SET idTelegram = ?, status = ? WHERE orderCode = ?", [idUser, status.BUY, text], async (error) => {
                            if (error) {
                                content.reply("Um erro ocorreu ao realizar o cadastro.")
                            } else {
                                // To - Do Limit member
                                content.reply("Cadastro feito com sucesso!\nAguarde, seus links estão sendo gerados.")
                                //Generate link 1
                                await bot.telegram.createChatInviteLink("-1001456522037", undefined, undefined, 1, undefined).then((link) => {
                                    db.run("UPDATE user SET link1 = ? WHERE orderCode = ?",
                                        [link.invite_link, text], (error) => {
                                            if (error) {
                                                content.reply("Erro ao salvar links.")
                                            }
                                        })
                                    content.reply(`Grupo 1 : ${link.invite_link}`)
                                })
                                //Generate link 2
                                await bot.telegram.createChatInviteLink("-1001456522037", undefined, undefined, 1, undefined).then((link) => {
                                    db.run("UPDATE user SET link2 = ? WHERE orderCode = ?",
                                        [link.invite_link, text], (error) => {
                                            if (error) {
                                                content.reply("Erro ao salvar links.")
                                            }
                                        })
                                    content.reply(`Grupo 2 : ${link.invite_link}`)
                                })
                                //Generate link 3
                                await bot.telegram.createChatInviteLink("-1001456522037", undefined, undefined, 1, undefined).then((link) => {
                                    db.run("UPDATE user SET link3 = ? WHERE orderCode = ?",
                                        [link.invite_link, text], (error) => {
                                            if (error) {
                                                content.reply("Erro ao salvar links.")
                                            }
                                        })
                                    content.reply(`Grupo 3 : ${link.invite_link}`)
                                })
                            }
                            
                        })
                }
            }
        })
    } else {
        switch (text) {
            case "resume":
                if (isAdmin) {
                    content.reply("OnResumeMode")
                } else {
                    content.reply("OnResumeMode")
                }
                break;
            default:
                content.reply("Digite um código válido.")
                break;
        }
    }
})




