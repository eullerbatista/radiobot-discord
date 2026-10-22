# 📻 Rádio Mix FM — Bot para Discord

Bot para Discord que transmite ao vivo a **Rádio Mix FM São Paulo** em canais de voz, 24 horas por dia.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-required-007808?logo=ffmpeg&logoColor=white)

---

## ✨ Funcionalidades

- 🎶 Toca a Mix FM São Paulo ao vivo no canal de voz em que você estiver
- 🔁 Reconexão automática ao stream caso a transmissão oscile
- 🖥️ Funciona em **Windows** (desenvolvimento) e **Linux** (produção) sem alterar código
- 🪵 Logs detalhados do player e do FFmpeg para facilitar o diagnóstico

## 💬 Comandos

| Comando  | Descrição                                                  |
|----------|------------------------------------------------------------|
| `!mixfm` | Entra no seu canal de voz e começa a tocar a rádio         |
| `!stop`  | Para a rádio e desconecta o bot do canal de voz            |

> É preciso estar em um canal de voz para usar `!mixfm`.

## 🧱 Como funciona

```
Stream AAC (StreamTheWorld) ──► FFmpeg (PCM 48 kHz estéreo) ──► @discordjs/voice ──► Canal de voz
```

O FFmpeg mantém a conexão com o stream aberta e converte o áudio para PCM bruto, que é codificado em Opus e enviado ao Discord pelo `@discordjs/voice`.

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) **22.x**
- [FFmpeg](https://ffmpeg.org/) instalado
  - **Windows:** em `C:/ffmpeg/bin/ffmpeg.exe`
  - **Linux:** disponível no `PATH` (`sudo apt install ffmpeg`)
  - Outro local: defina a variável `FFMPEG_PATH`
- Um bot criado no [Discord Developer Portal](https://discord.com/developers/applications) com o intent **Message Content** habilitado

## ⚙️ Configuração

| Variável      | Obrigatória | Descrição                                        |
|---------------|:-----------:|--------------------------------------------------|
| `TOKEN`       | ✅          | Token do bot (Developer Portal → Bot → Token)    |
| `FFMPEG_PATH` | ❌          | Caminho do executável do FFmpeg, se não for o padrão |

> 🔒 **Nunca coloque o token no código nem faça commit dele.** O arquivo `.env` já está no `.gitignore`.

### Convidando o bot para o servidor

No Developer Portal, em **OAuth2 → URL Generator**, selecione o escopo `bot` e as permissões:

- `View Channels`, `Send Messages`, `Read Message History`
- `Connect`, `Speak`

## 🚀 Rodando localmente

```bash
git clone https://github.com/eullerbatista/radiobot-discord.git
cd radiobot-discord
npm install
```

**Windows (PowerShell):**
```powershell
$env:TOKEN="seu_token"; npm start
```

**Linux / macOS:**
```bash
TOKEN="seu_token" npm start
```

Se tudo estiver certo, aparece no terminal: `Bot online como NomeDoBot#0000`.

## ☁️ Deploy

### VPS Linux (ex.: Oracle Cloud Always Free) com PM2

```bash
# Dependências do sistema
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg git build-essential python3

# Projeto
git clone https://github.com/eullerbatista/radiobot-discord.git
cd radiobot-discord
npm install

# Token em um arquivo .env (uma única linha: TOKEN=seu_token)
read -s -p "Token: " T && printf 'TOKEN=%s\n' "$T" > .env && unset T && echo
chmod 600 .env

# Execução contínua com PM2
sudo npm install -g pm2
pm2 start index.js --name mixfm --node-args="--env-file=$PWD/.env"
pm2 save
pm2 startup   # execute o comando sugerido para iniciar junto com o sistema
```

**Atualizando:**
```bash
cd ~/radiobot-discord && git pull && npm install && pm2 restart mixfm
```

### Railway / Nixpacks

O repositório já inclui um `nixpacks.toml`, que instala Node.js 22 e FFmpeg. Basta conectar o repositório e definir a variável `TOKEN` no painel do serviço.

## 🛠️ Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `TokenInvalid` | Token incorreto, antigo ou com caracteres extras | Gere um novo token e confira se o `.env` tem uma única linha `TOKEN=...` |
| Bot entra no canal mas fica mudo | FFmpeg não encontrado | Verifique `ffmpeg -version` ou defina `FFMPEG_PATH`; confira os logs `Erro ao iniciar o FFmpeg` |
| Bot não responde aos comandos | Intent **Message Content** desabilitado | Ative em Developer Portal → Bot → Privileged Gateway Intents |
| Dois bots respondendo | Mesma instância rodando em dois lugares | Mantenha apenas um deploy ativo por token |

Para ver os logs em produção: `pm2 logs mixfm`.

## 📁 Estrutura

```
.
├── index.js         # Lógica do bot (comandos, conexão de voz e FFmpeg)
├── nixpacks.toml    # Build para Railway/Nixpacks (Node 22 + FFmpeg)
├── package.json
└── README.md
```

## ⚠️ Aviso

Este é um projeto pessoal e sem fins lucrativos, sem vínculo oficial com a Rádio Mix FM. Todo o conteúdo transmitido pertence aos seus respectivos detentores de direitos.

---

Desenvolvido por **Euller Batista**.
