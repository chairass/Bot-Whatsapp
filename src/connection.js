// Importa funções e constantes da biblioteca Baileys
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, decodeSyncdSnapshot } = require('@whiskeysockets/baileys');

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
    // Obtém o estado de autenticação usando múltiplos arquivos para armazenamento
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, '..', 'assets', 'auth', 'baileys')// Caminho para salvar os arquivos de autenticação
    );

     // Busca a versão mais recente da API do WhatsApp suportada
    const { version } = await fetchLatestBaileysVersion();

     // Cria o socket de conexão com o WhatsApp
    const socket = makeWASocket({
        version,// Versão da API
        auth: state,// Estado de autenticação
        printQRInTerminal: false,// Desabilita a exibição do QR code no terminal
        logger: pino ({level: "error"}),// Configura o logger com nível de erro
        browser: ["Chrome (Linux)", "", ""],// Emula um navegador específico
        markOnlineOnConnect: true,// Marca o usuário como online ao conectar
    });

    // Verifica se o número ainda não está registrado
    if(!socket.authState.creds.registered){
       // Solicita ao usuário o número de telefone 
       const phoneNumber = await question("Informe o seu numero de telefone: "); 

       // Verifica se foi fornecido um número
       if (!phoneNumber){
        throw new Error("Numero de telefone inválido")// Lança erro se o número for inválido
       }

       // Solicita o código de pareamento com o WhatsApp
       const code = await socket.requestPairingCode(onlyNumber(phoneNumber));// Sanitiza o número antes de enviar

       // Exibe o código de pareamento no terminal
       console.log(`Código de pareamento: ${code}`);
    }

    // Evento que lida com atualizações de conexão
    socket.ev.on("connection.update", (update) =>{
         const { connection, lastDisconnect } = update;

         if(connection == "close"){
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if(shouldReconnect){
                this.connect(); //caso o IF acima seja verdadeiro, vai realizar a conexão novamente  
            }
         }
    });

    // Evento que escuta atualizações das credenciais e as salva
    socket.ev.on('creds.update', saveCreds);
};
