const stream = require("stream")

const { EventEmitter } = require("events")

const { ToneStream, utils, ssml } = require("tone-stream")

type Format = {
  audioFormat: number,
  sampleRate: number,
  channels: number,
  bitDepth: number,
}

type Params = {
  language: string,
  voice: string,
  text: string,
  times?: number,
}

type Config = Record<string, unknown>

type Opts = {
  uuid?: string,
  format: Format,
  params: Params,
  config: Config,
}

type EventCallback = (...args: any[]) => void

class BfskSpeechSynthStream extends ToneStream {
  sampleRate: number
  zero_freq: number
  one_freq: number
  tone_duration: number

  constructor(opts: Opts) {
    super(opts.format)
    this.sampleRate = opts.format.sampleRate

    this.params = opts.params
    if(!this.params.times) {
      this.params.times = 1
    }
    
    const arr = opts.params.language.split(":")
    this.zero_freq = parseInt(arr[0])
    this.one_freq = parseInt(arr[1])

    if(!this.zero_freq || !this.one_freq) {
      throw new Error(`Invalid language ${opts.params.language}`)
    }

    this.tone_duration = parseInt(opts.params.voice)

    if(!this.tone_duration) {
      throw new Error(`Invalid voice ${opts.params.voice}`)
    }

    this.on('empty', () => {
      //console.log('empty')
      this.params.times--
      //console.log("times", this.params.times)
      if(this.params.times > 0) {
        this.enqueue(this.params.text)
      }
    })

    this.enqueue(this.params.text)
  }

  enqueue(text: string) {
    const gen_tones = (sampleRate: number, text: string, duration: number) => {
      return utils.gen_binary_tones_from_text(text, duration, this.zero_freq, this.one_freq, sampleRate)
    }
    const tones = ssml.process(this.sampleRate, text, gen_tones, this.tone_duration)
    this.concat(tones)
    this.add([100, 's'])
  }
}

module.exports = BfskSpeechSynthStream
