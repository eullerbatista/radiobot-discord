const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');

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

      // Cria o recurso de áudio a partir do link AAC
      const resource = createAudioResource(RADIO_URL, {
        inputType: StreamType.Arbitrary
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎶 Tocando Rádio Mix FM São Paulo!");
    } else {
      message.reply("Você precisa estar em um canal de voz!");
    }
  }
});

client.login(process.env.TOKEN);
