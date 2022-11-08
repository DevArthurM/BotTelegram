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
    isActiveById,
    isRegisterById,
    registerNewUser,
    isNewUser,
    getBanIds,
    getIdTelegram,
    getUser,
    isUserRegister,
    getOrderCodeById,
    getAllUsers,
    getLinksById
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
    let globalOrderCode = ""
    async function sendLinks(idUser, orderCodeText) {
        const link = {
            link1: await createChatLink(links.link1).then((link) => { return link.invite_link }),
            link2: await createChatLink(links.link2).then((link) => { return link.invite_link }),
            link3: await createChatLink(links.link3).then((link) => { return link.invite_link })
        }
        registerNewUser(idUser, orderCodeText, link)
        await content.reply(`Grupo de interação 👥 - ${link.link1}`)
        await content.reply(`Grupo de sinais LISTA 💸🧾- ${link.link2}`)
        await content.reply(`Grupo de sinais 🔴 AO VIVO 🤑 - ${link.link3}`)
        content.reply("Caso os links estejam expirados, digite a palavra link, e enviaremos novamente.")
    }
    try {
        const typeChat = content.update.message.chat.type
        if (typeChat === 'private') {
            const command = (content.message.text).toUpperCase()
            const orderCodeText = (content.message.text).toUpperCase()
            const idUser = content.from.id
            const name = content.from.first_name
            const isACode = orderCodeText.slice(0, 2) === ("HP")
            // Routines
            if (isACode) {
                globalOrderCode = orderCodeText
                if (await isNewUser(orderCodeText)) {
                    content.reply(`Seja bem vindo ${name}!\nSeus links estão sendo gerados, aguarde!`)
                    sendLinks(idUser, orderCodeText)
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
                        case "LINKS":
                            content.reply("Comando restrito a usuários.")
                            break;
                    }
                } else {
                    switch (command) {
                        case "LINKS":
                            if (await isActiveById(idUser)) {
                                if (await isOnGroup(idUser)) {
                                    content.reply("Você já está em um dos grupos.")
                                } else {
                                    revokeLinks(idUser)
                                    const getOrderCodeUser = await getOrderCodeById(idUser).then((result) => { return result[0].orderCode })
                                    sendLinks(idUser, getOrderCodeUser)
                                }
                            }else{
                                content.reply("Você não tem acesso a esse comando.")
                            }
                            break;
                        default:
                            content.reply(`Digite um código válido.`)
                            break;
                    }
                }
            }
        }
    } catch (error) {
    }
})

// Functions
async function banChatMemberRoutine(userIdTelegram) {
    try {
        return new Promise(async (resolve, reject) => {
            if (await isAmd(userIdTelegram)) {
                console.log("Is a admin or creator, can't remove.")
                return false
            } else {
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
            }
        })
    } catch (error) { }
}

function getTextMessageStatus(statusParam) {
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
    const thirtyMinutes = 1800000
    const currentDate = Date.now()
    const expireDate = currentDate + thirtyMinutes
    return bot.telegram.createChatInviteLink(idChat, "industriaDoTrade", expireDate, 1, false)
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

function isOnGroup(idTelegram) {
    return new Promise(async (resolve, reject) => {
        const membersChat1 = await bot.telegram.getChatMember(links.link1, idTelegram).then((user) => { return user })
        const membersChat2 = await bot.telegram.getChatMember(links.link2, idTelegram).then((user) => { return user })
        const membersChat3 = await bot.telegram.getChatMember(links.link3, idTelegram).then((user) => { return user })
        if ((membersChat1.status || membersChat2.status || membersChat3.status) === "left") {
            resolve(false)
        } else {
            resolve(true)
        }
    })
}

async function revokeLinks(idTelegram) {
    const linksUser = await getLinksById(idTelegram).then((result) => { return result })
    bot.telegram.revokeChatInviteLink(links.link1, linksUser.link1)
    bot.telegram.revokeChatInviteLink(links.link2, linksUser.link2)
    bot.telegram.revokeChatInviteLink(links.link3, linksUser.link3)
}