const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const prism = require('prism-media');
const ffmpeg = require('ffmpeg-static');

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

// variável para guardar a conexão
let connection;

client.on('messageCreate', async message => {
  if (message.content === '!mixfm') {
    if (message.member.voice.channel) {
      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();

      // Log de erros do player
      player.on('error', error => {
        console.error('Erro no player:', error.message, error.stack);
      });

      const ffmpegStream = new prism.FFmpeg({
        args: [
          '-reconnect', '1',
          '-reconnect_streamed', '1',
          '-reconnect_delay_max', '5',
          '-i', RADIO_URL,
          '-c:a', 'libopus',   // força codec Opus
          '-f', 'opus',
          '-ar', '48000',
          '-ac', '2'
        ],
        shell: false,
        ffmpegPath: ffmpeg
      });

      // Logs do processo FFmpeg
      ffmpegStream.on('error', err => {
        console.error('Erro no FFmpeg stream:', err);
      });
      ffmpegStream.on('close', code => {
        console.log('FFmpeg finalizou com código:', code);
      });

      const resource = createAudioResource(ffmpegStream, { inputType: 'opus' });
      player.play(resource);
      connection.subscribe(player);

      message.reply("Tocando Rádio Mix FM São Paulo!");
    } else {
      message.reply("Você precisa estar em um canal de voz!");
    }
  }

  if (message.content === '!stop') {
    if (connection) {
      connection.destroy();
      connection = null;
      message.reply("Rádio Mix FM desligada!");
    } else {
      message.reply("O bot não está em nenhum canal de voz.");
    }
  }
});

client.login(process.env.TOKEN);
