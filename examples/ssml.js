const Speaker = require('speaker')

const BfskSpeechSynthStream = require('../index.js')
const BfskSpeechRecogStream = require('bfsk-speech-recog-stream')

const zero_freq = 500
const one_freq = 2000

const sampleRate = 8000

const language = `${zero_freq}:${one_freq}`
const voice = '5' // tone_duration

const audioFormat = 1 // LINEAR16

const signed = true

const format = {
  audioFormat,
  channels: 1,
  sampleRate,
  bitDepth: 16,
  signed,
}

const params = {
  text: '<speak><prosody rate="5ms">hello</prosody><prosody rate="10ms"> world</prosody><break time="500ms"/></speak>',
  language,
  voice,
  times: 3,
}

const opts = {
  format,
  params,
}

const ss = new BfskSpeechSynthStream(opts)

const sr = new BfskSpeechRecogStream({
  format,
  params: {
    language,
  }
})

const speaker = new Speaker(format)

sr.on('bit', data => {
  console.log(new Date(), 'bit', data)
})

sr.on('speech', data => {
  console.log(new Date(), 'speech', JSON.stringify(data, null, 2))
})

ss.pipe(sr)
ss.pipe(speaker)
