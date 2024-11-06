const express = require('express')
const testApp = express()

const Discord = require('discord.js')

const TOKEN = process.env.TELEGRAM_TOKEN
const DISKORD_TOKEN = process.env.DISKORD_TOKEN
const TelegramBot = require('node-telegram-bot-api')
const options = {
  webHook: {
    port: process.env.PORT
  }
}

const url = `https://${process.env.APP_URL}:${process.env.PORT}`
const bot = new TelegramBot(TOKEN, options)
const URL_WITH_WEBHOOK = `${url}/bot${TOKEN}`

bot.setWebHook(URL_WITH_WEBHOOK)

const { workByData } = require('./src/parse-command')

var logList = {}

const discordClient =  new Discord.Client({ intents: [Discord.Intents.ALL] })

discordClient.on('message', function(message) {
  try {
    if (message.author.bot) {return}

    const senderName = message.author.username + '#' + message.author.discriminator
    const msgText = message.content

    const sendMessage = (text, parseMode) => {
      message.channel.send(text)
    }

    if (msgText.startsWith('/')) {
      console.log(`discord message ${msgText} from ${senderName}`)
      workByData({
        msgText,
        senderName,
        sendMessage,
      })
    }
  } catch (e) {
    console.error(e)
  }
})
discordClient.once('ready', () => {
  console.log('Diskord client Ready!')
})
discordClient.login(DISKORD_TOKEN)

bot.on('message', function onMessage(msg) {
  if (!msg.text || !msg.chat) {
    return
  }

  try {
    const chatId = msg.chat.id
    let msgText = msg.text
    let senderName = msg.from.username ? msg.from.username : (msg.from.last_name ? msg.from.first_name : msg.from.first_name + ' ' + msg.from.last_name)

    senderName = senderName.trim().replace(/undefined$/, '').replace(/[^a-zA-Zа-яА-Я0-9 ]/g, '').trim()
    msgText = msgText.replace('@DiceTeleBot', '')
    console.log(`telegram message ${msgText} chatId ${chatId}`)

    var match = msgText.match(/^\/send\s*(\d*)(\s*)(.*)/)

    if (match) {
      bot.sendMessage(match[1], match[3], {
        parse_mode: 'Markdown'
      })

      return
    }

    const sendMessage = function(text, parseMode) {
      logList[chatId] = logList[chatId] || []
      logList[chatId].push(text)

      return bot.sendMessage(chatId, text, {
        parse_mode: parseMode
      })
    }

    if (msgText == '/getLog') {
      const textLog = logList[chatId] ? logList[chatId].join('\n-------\n') : 'Log is empty!'

      sendMessage(textLog, 'Markdown')

      return
    }

    workByData({
      msgText,
      senderName,
      sendMessage,
    })

  } catch (e) {
    console.error(e)
  }
})
bot.on('webhook_error', (error) => {
  console.log(`Webhook error: ${error.message} ${error.code}`)  // => 'EPARSE'
})

console.log(`Telegram bot start on ${URL_WITH_WEBHOOK}`)

testApp.get('/', (req, res) => {
  res.send('Hello World, i am dice telebot!')
})

testApp.listen(80, () => {
  console.log('Example app listening on port 80')
})
