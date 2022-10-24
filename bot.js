const env = require('./.env')
const Telegraf = require('telegraf')

// Constants
const bot = new Telegraf.Telegraf(env.token);
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
    const isACode = text.slice(0, 2) === "HP"
    if (isACode) {
        content.reply("Código validado com sucesso!\n link grupo 1: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br\n link grupo 2: www.exemplolink.com.br")
    } else {
        content.reply("Digite um código válido.")
    }
})
// Launch bot.
bot.launch()



