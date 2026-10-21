const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    getVoiceConnection, 
    StreamType 
} = require('@discordjs/voice');
const { spawn } = require('child_process');

// No Windows usa o FFmpeg local; no Railway (Linux) usa o ffmpeg instalado pelo nixpacks
const ffmpegPath = process.env.FFMPEG_PATH
    || (process.platform === 'win32' ? 'C:/ffmpeg/bin/ffmpeg.exe' : 'ffmpeg');

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

        // Sem isso, se o FFmpeg não abrir o bot fica mudo sem mostrar erro nenhum
        ffmpeg.on('error', err => {
            console.error(`Erro ao iniciar o FFmpeg (${ffmpegPath}): ${err.message}`);
        });
        ffmpeg.stderr.on('data', data => {
            const line = data.toString();
            if (/error|fail|invalid/i.test(line)) console.error(`FFmpeg: ${line.trim()}`);
        });
        ffmpeg.on('close', code => {
            console.log(`FFmpeg finalizou com código: ${code}`);
        });

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


client.login(process.env.TOKEN);
