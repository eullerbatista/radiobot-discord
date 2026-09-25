if (message.content === '!mixfm') {
  if (message.member.voice.channel) {
    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    // Adiciona log de erros
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

    const resource = createAudioResource(ffmpegStream, { inputType: 'opus' });
    player.play(resource);
    connection.subscribe(player);

    message.reply("Tocando Rádio Mix FM São Paulo!");
  } else {
    message.reply("Você precisa estar em um canal de voz!");
  }
}
