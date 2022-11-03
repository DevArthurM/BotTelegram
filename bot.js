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
    getUser,
    isUserRegister
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
    console.log(`endPointRefoundBot - started`)
    try {
        const email = req.body.email
        const id = await getIdTelegram(email)
        const banIds = await getBanIds()
        banIds.forEach(async (user) => {
            if (!(user.idTelegram === "undefined")) {
                if (await banChatMemberRoutine(user.idTelegram)) {
                    bot.telegram.sendMessage(id[0].idTelegram, "Olá Trader!\nSua assinatura conosco foi encerrada, renove seu contrato conosco!")
                }
            }
        });
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }

})

// Buy order
app.post(endPointBuyBot, async (req, res) => {
    console.log(`endPointBuyBot - started`)
    try {
        const idTelegram = req.body.idTelegram
        if(idTelegram !== "undefined"){
            await bot.telegram.unbanChatMember(links.link1, idTelegram, true).catch((error) => { })
            await bot.telegram.unbanChatMember(links.link2, idTelegram, true).catch((error) => { })
            await bot.telegram.unbanChatMember(links.link3, idTelegram, true).catch((error) => { })
            bot.telegram.sendMessage(idTelegram, "Parabéns! Sua conta foi reativada!\nDigite o código HP novo gerado na sua nova compra para gerarmos seus links.")
        }
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

app.post("/unBan", async (req, res) => {
    const idTelegram = req.body.idTelegram
    await bot.telegram.unbanChatMember(links.link1, idTelegram, true).catch((error) => { })
    await bot.telegram.unbanChatMember(links.link2, idTelegram, true).catch((error) => { })
    await bot.telegram.unbanChatMember(links.link3, idTelegram, true).catch((error) => { })
    res.send()
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
                switch (user[0].status) {
                    case status.BUY:
                        content.reply(`${name}, você já possui um registro conosco.`)
                        break;
                    case status.EMPTY:
                        content.reply(`${name}, você já possui um registro disponível conosco, digite seu código HP para ativar sua conta.`)
                        break;
                    case status.REFOUND:
                        content.reply(`${name}, seu registro conosco está suspenço, renove seu plano para ter acesso aos nossos produtos.`)
                        break;
                }
            } else {
                content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na industria do Trader!\nDigite seu código de compra.\n\n🚨ATENÇÃO! O CÓDIGO SE INICIA COM HP 🚨\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
            }
        } catch (error) {
            content.reply(`Erro ao iniciar o bot.`)
        }
    } catch (error) {
    }
})

// Read text
bot.on("text", async (content) => {
    try {
        const typeChat = content.update.message.chat.type
        if (typeChat === 'private') {
            const orderCodeText = (content.message.text).toUpperCase()
            const idUser = content.from.id
            const name = content.from.first_name
            const isACode = orderCodeText.slice(0, 2) === ("HP") && orderCodeText.length === 16
            // Routines
            if (isACode) {
                if (await isNewUser(orderCodeText)) {
                    content.reply(`Seja bem vindo ${name}!\nSeus links estão sendo gerados, aguarde!`)
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
    } catch (error) { }
}

// Functions bot
function createChatLink(idChat) {
    return bot.telegram.createChatInviteLink(idChat, undefined, undefined, 1, undefined)
}