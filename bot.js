// Const and imports
import Telegraf from 'telegraf'
import express from 'express'
import {
    token,
    links,
    endPointRefoundBot,
    portBotWebHook,
    endPointBuyBot
} from './env.js'
import {
    isRegisterById,
    registerNewUser,
    isNewUser,
    getBanIds,
} from './databaseconfig.js'

// Comunicate with server
const app = express()
app.use(express.json())
app.listen(portBotWebHook, () => {
    console.log(`The bot server started on port ${portBotWebHook}`)
})

// Refound order
app.get(endPointRefoundBot, async () => {
    const banIds = await getBanIds()
    banIds.forEach(async (user) => {
        if (user.idTelegram === "undefined") {
        } else {
            if (await banChatMemberRoutine(user.idTelegram)) {
                console.log("Ban work.")
            } else {
                console.log("Ban does not work")
            }
        }
    });
})

// Buy order
app.post(endPointBuyBot, (req, res) => {
    try {
        const idTelegram = req.body.idTelegram
        bot.telegram.unbanChatMember(links.link1, idTelegram, true)
        bot.telegram.unbanChatMember(links.link2, idTelegram, true)
        bot.telegram.unbanChatMember(links.link3, idTelegram, true)
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

// Start command bot.
const bot = new Telegraf.Telegraf(token);
bot.launch()
bot.start(async (content) => {
    try {
        const idUser = content.from.id
        const name = content.update.message.from.first_name
        try {
            if (await isRegisterById(idUser)) {
                content.reply(`${name}, você já possui um registro conosco.`)
            } else {
                content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!\nDigite seu código de compra.\n\n🚨ATENÇÃO! O CÓDIGO SE INICIA COM HP 🚨\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
            }
        } catch (error) {
            content.reply(`Erro ao iniciar o bot.`)
        }
    } catch (error) {
        console.log(error)
    }
})

// Read text
bot.on("text", async (content) => {
    try {
        const typeChat = content.update.message.chat.type
        if (typeChat === 'private') {
            const orderCodeText = content.message.text
            const idUser = content.from.id
            const name = content.from.first_name
            const isACode = orderCodeText.slice(0, 2) === ("HP" || "hP" || "Hp" || "hp") && orderCodeText.length === 16
            // Routines
            if (isACode) {
                if (await isNewUser(orderCodeText)) {
                    content.reply(`Seja bem vindo ${name}!\nSeus links estão sendo gerados, aguarde!`)
                    console.log(await createChatLink(links.link1))
                    const link = {
                        link1: await createChatLink(links.link1).then((link) => { return link.invite_link }),
                        link2: await createChatLink(links.link2).then((link) => { return link.invite_link }),
                        link3: await createChatLink(links.link3).then((link) => { return link.invite_link })
                    }
                    registerNewUser(idUser, orderCodeText, link)
                    content.reply(`Grupo 1 - ${link.link1}`)
                    content.reply(`Grupo 2 - ${link.link2}`)
                    content.reply(`Grupo 3 - ${link.link3}`)
                } else {
                    if (await isRegisterById(idUser)) {
                        content.reply("Seu telegram já está cadastrado conosco.")
                    } else {
                        content.reply("Seu código não está registrado como um código válido em nosso sistema.")
                    }
                }
            } else {
                content.reply(`Digite um código válido.`)
            }
        }
    } catch (error) {
        console.log(error)
    }
})

// Functions
function banChatMemberRoutine(userIdTelegram) {
    return new Promise((resolve, reject) => {
        bot.telegram.banChatMember(links.link1, userIdTelegram).then((result) => {
            result ? null : reject(result)
        })
            .finally(() => {
                bot.telegram.banChatMember(links.link2, userIdTelegram).then((result) => {
                    result ? null : reject(result)
                })
                    .finally(() => {
                        bot.telegram.banChatMember(links.link3, userIdTelegram).then((result) => {
                            result ? null : reject(result)
                        })
                            .finally(() => { resolve(true) })
                    })
            })
    })
}

// Functions bot
function createChatLink(idChat) {
    return bot.telegram.createChatInviteLink(idChat, undefined, undefined, 1, undefined)
}