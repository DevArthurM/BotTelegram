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
    isUserRegister,
    getAllUsers
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
        if (idTelegram !== "undefined") {
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

app.get("/test", async (req, res) => {
    res.send(await isAmd(1694198535))
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
                content.reply(`Seja bem vindo(a) ${name}!\nÉ um prazer ter você na indústria do Trader!\nDigite seu código de compra.\n\n🚨O CÓDIGO SE INICIA COM HP🚨\n\nCompletando essa etapa de cadastro iremos te enviar os links dos nossos grupos!`)
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
            const command = (content.message.text).toUpperCase()
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
                if (await isAmd(idUser)) {
                    switch (command) {
                        case "TODOS":
                            const allUsers = await getAllUsers().then((result) => { return result })
                            let message = "TODOS USUÁRIOS\n"
                            allUsers.forEach((user) => {
                                const userStatus = getTextMessageStatus(user.status)
                                message += `${user.email} - ${userStatus}\n`
                            })
                            content.reply(message)
                            break;
                    }
                } else {
                    content.reply(`Digite um código válido.`)
                }
            }
        }
    } catch (error) {
    }
})

// Functions
async function banChatMemberRoutine(userIdTelegram) {
    console.log(await isAmd(userIdTelegram))
    try {
        return new Promise(async (resolve, reject) => {
            if (await isAmd(userIdTelegram)) {
                bot.telegram.banChatMember(links.link1, userIdTelegram).then((result) => {
                    result ? null : reject(result)
                })
                bot.telegram.banChatMember(links.link2, userIdTelegram).then((result) => {
                    result ? null : reject(result)
                })
                bot.telegram.banChatMember(links.link3, userIdTelegram).then((result) => {
                    result ? null : reject(result)
                })
                return true
            } else {
                console.log("Is a admin or creator, can't remove.")
                return false
            }
        })
    } catch (error) { }
}

function getTextMessageStatus(statusParam) {
    console.log(statusParam)
    switch (statusParam) {
        case status.BUY:
            return "Ativo"
        case status.EMPTY:
            return "Não registrado";
        case status.REFOUND:
            return "Desativado";
    }
}

// Functions bot
function createChatLink(idChat) {
    return bot.telegram.createChatInviteLink(idChat, undefined, undefined, 1, undefined)
}

async function isAmd(userIdTelegram) {
    async function getAllAdms() {
        function getAdms(idGroup) {
            return new Promise(async (resolve, reject) => {
                const adms = await bot.telegram.getChatAdministrators(idGroup).then((response) => { return response })
                let responseBody = []
                adms.forEach((Element) => {
                    switch (Element.status) {
                        case 'administrator':
                        case 'creator':
                            responseBody.push(Element.user.id)
                            break;
                    }
                })
                resolve(responseBody)
            })
        }
        const admsGroup1 = await getAdms(links.link1).then((result) => { return result })
        const admsGroup2 = await getAdms(links.link2).then((result) => { return result })
        const admsGroup3 = await getAdms(links.link3).then((result) => { return result })
        const result = {
            admsGroup1,
            admsGroup2,
            admsGroup3
        }
        return result
    }
    const adms = await getAllAdms()
    const isAdmGroup1 = adms.admsGroup1.includes(userIdTelegram)
    const isAdmGroup2 = adms.admsGroup1.includes(userIdTelegram)
    const isAdmGroup3 = adms.admsGroup1.includes(userIdTelegram)
    if (isAdmGroup1 || isAdmGroup2 || isAdmGroup3) {
        return true
    } else {
        return false
    }
}