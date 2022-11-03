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
    status,
    isRegisterById,
    registerNewUser,
    isNewUser,
    getBanIds,
    getIdTelegram,
    getUser
} from './databaseconfig.js'
//Bot
const bot = new Telegraf.Telegraf(token);
// Comunicate with server
const app = express()
app.use(express.json())
app.listen(portBotWebHook, () => {
    console.log(`The bot server started on port ${portBotWebHook}`)
})

// Refound order
app.post(endPointRefoundBot, async (req, res) => {
    try {
        const email = req.body.email
        const id = await getIdTelegram(email)
        const banIds = await getBanIds()
        console.log(id)
        banIds.forEach(async (user) => {
            if (user.idTelegram === "undefined") {
            } else {
                if (await banChatMemberRoutine(user.idTelegram)) {
                    bot.telegram.sendMessage(id[0].idTelegram,"Olá Trader! Seu plano com a industria do trader venceu, renove seu contrato conosco!")
                    console.log("Ban work.")
                } else {
                    console.log("Ban does not work")
                }
            }
        });
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
        console.log(error)
    }
    
})

// Buy order
app.post(endPointBuyBot,async  (req, res) => {
    console.log("end point buy order")
    try {
        const idTelegram = req.body.idTelegram
        console.log("UNBAN")
        console.log(idTelegram)
        await bot.telegram.unbanChatMember(links.link1, idTelegram, true).catch((error) => { console.log(error) })
        await bot.telegram.unbanChatMember(links.link2, idTelegram, true).catch((error) => { console.log(error) })
        await bot.telegram.unbanChatMember(links.link3, idTelegram, true).catch((error) => { console.log(error) })
        bot.telegram.sendMessage(idTelegram,"Parabéns! Sua conta foi reativada! Digite o código HP novo gerado na sua nova compra para gerarmos seus links.")
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

// Start command bot.

bot.launch()
bot.start(async (content) => {
    try {
        const idUser = content.from.id
        const name = content.update.message.from.first_name
        try {
            if (await isRegisterById(idUser)) {
                const user = await getUser(idUser)
                if(user[0].status === status.EMPTY){
                    content.reply(`${name}, você já possui um registro antigo conosco, digite seu código HP para reativar sua conta.`)
                }else{
                    content.reply(`${name}, você já possui um registro conosco.`)
                }
            } else {
                content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!\nDigite seu código de compra.\n\n🚨ATENÇÃO! O CÓDIGO SE INICIA COM HP 🚨\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
            }
        } catch (error) {
            console.log(error)
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
                    await content.reply(`Grupo de interação 👥 - ${link.link1}`)
                    await content.reply(`Grupo de sinais LISTA 💸🧾- ${link.link2}`)
                    await content.reply(`Grupo de sinais 🔴 AO VIVO 🤑 - ${link.link3}`)
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
    try {
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
    } catch (error) { console.log(error) }
}

// Functions bot
function createChatLink(idChat) {
    return bot.telegram.createChatInviteLink(idChat, undefined, undefined, 1, undefined)
}