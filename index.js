const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    getVoiceConnection, 
    StreamType 
} = require('@discordjs/voice');
const { spawn } = require('child_process');

const ffmpegPath = 'C:/ffmpeg/bin/ffmpeg.exe';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('clientReady', () => {
    console.log(`Bot online como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!mixfm') {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('Entre em um canal de voz primeiro!');

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        // FFmpeg mantém o stream AAC aberto continuamente
        const ffmpeg = spawn(ffmpegPath, [
            '-reconnect', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '5',
            '-i', 'https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            'pipe:1'
        ]);

        const resource = createAudioResource(ffmpeg.stdout, {
            inputType: StreamType.Raw
        });

        player.play(resource);
        connection.subscribe(player);

        player.on('error', error => {
            console.error(`Erro no player: ${error.message}`);
            message.reply('⚠️ Ocorreu um erro ao tentar tocar a rádio.');
        });

        player.on('stateChange', (oldState, newState) => {
            console.log(`Player mudou de ${oldState.status} para ${newState.status}`);
        });

        message.reply('🎶 Tocando Mix FM!');
    }

    if (message.content.toLowerCase() === '!stop') {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.reply('⏹️ Rádio parada.');
        } else {
            message.reply('O bot não está em nenhum canal.');
        }
    }
});

client.login('MTU1MjgwNjcxNDE3OTMyMTkwOA.GgEf4j.OTZInfgb-xP1vLH-Ke53OH5sJiw-ickTGGnq_c');
