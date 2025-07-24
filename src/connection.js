// Importa funções e constantes da biblioteca Baileys
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, decodeSyncdSnapshot } = require('@whiskeysockets/baileys');
require('dotenv').config();
// Módulos nativos e de terceiros
const path = require("path");// Manipulação de caminhos
const pino = require('pino');// Logger leve para Node.js
//const { question, onlyNumber } = require('.');// Funções auxiliares importadas do módulo local (presumivelmente pergunta e sanitização do número)
const { readline } = require('readline');// Módulo para ler entradas do terminal

// Função auxiliar para perguntar algo no terminal
const question = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

// Remove tudo que não for número
const onlyNumber = (text) => text.replace(/\D/g, '');

// Exporta a função connect
exports.connect = async () => {    
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, '..', 'assets', 'auth', 'baileys')
    );

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "error" }),
        browser: ["Chrome (Linux)", "", ""],
        markOnlineOnConnect: true,
    });

    // ✅ ✅ Apenas aqui lidamos com conexão e pareamento
    socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("🟢 Conexão com o WhatsApp estabelecida com sucesso!");

            // Verifica se a sessão ainda precisa ser pareada
            if (!socket.authState.creds.registered && socket.user) {
                try {
                    const phoneNumber = await question("📱 Digite o número de telefone para pareamento (com DDD): ");

                    if (!phoneNumber || !onlyNumber(phoneNumber)) {
                        throw new Error("❌ Número de telefone inválido.");
                    }

                    const code = await socket.requestPairingCode(onlyNumber(phoneNumber));
                    console.log(`📲 Código de pareamento gerado: ${code}`);
                } catch (err) {
                    console.error("❌ Erro ao gerar código de pareamento:", err);
                }
            } else {
                console.log("✅ Sessão já registrada, pareamento não necessário.");
            }
        }


        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("🔴 Conexão encerrada:", lastDisconnect?.error?.output);

            if (shouldReconnect) {
                console.log("🔁 Tentando reconectar...");
                exports.connect();
            } else {
                console.log("🔒 Sessão encerrada, é necessário parear novamente.");
            }
        }
    });


    // Salva credenciais atualizadas
    socket.ev.on('creds.update', saveCreds);

    return socket;
};

