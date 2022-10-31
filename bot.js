// Const and imports
import Telegraf from 'telegraf'
import sqlite3 from 'sqlite3'
import express from 'express'
import {
    token,
    pathDB,
    links,
    endPointRefoundBot,
    portBotWebHook
} from './env.js'
import {
    isRegisterById,
    registerNewUser,
    isNewUser,
    getBanIds,
    botRefoundRoutine
} from './databaseconfig.js'

// Comunicate with server
const app = express()
app.listen(portBotWebHook, () => {
    console.log(`The bot server started on port ${portBotWebHook}`)
})
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

app.get("/test", async (req, res) => {
    console.log("TEST")
    bot.telegram.unbanChatMember(links.link1,"1694198535").then((result) => {
        console.log(result)
    })
    res.status(200).send()
})

// Start command bot.
const bot = new Telegraf.Telegraf(token);
bot.launch()
bot.start(async (content) => {
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
})

// Read text
bot.on("text", async (content) => {
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
                const link = {
                    link1: await createChatLink(links.link1).then(link => link.invite_link),
                    link2: await createChatLink(links.link2).then(link => link.invite_link),
                    link3: await createChatLink(links.link3).then(link => link.invite_link)
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
    return bot.telegram.createChatInviteLink(idChat,undefined,undefined,1,false).then((link) => { link })
}