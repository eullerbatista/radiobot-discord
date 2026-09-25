const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static'); // usa o binário embutido
const { spawn } = require('child_process');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Link da rádio Mix FM (AAC)
const RADIO_URL = "https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac";

client.on('messageCreate', async message => {
  if (message.content === '!mixfm') {
    if (message.member.voice.channel) {
      const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();

      // Usa ffmpeg-static para converter o stream AAC em PCM
      const ffmpegProcess = spawn(ffmpeg, [
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-i', RADIO_URL,
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1'
      ], { stdio: ['ignore', 'pipe', 'ignore'] });

      const resource = createAudioResource(ffmpegProcess.stdout);
      player.play(resource);
      connection.subscribe(player);

      message.reply("🎶 Tocando Rádio Mix FM São Paulo!");
    } else {
      message.reply("Você precisa estar em um canal de voz!");
    }
  }
});

client.login(process.env.TOKEN);
