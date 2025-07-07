const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, decodeSyncdSnapshot } = require('@whiskeysockets/baileys');
const path = require("path");
const pino = require('pino');
const { question, onlyNumber     } = require('.');

exports.connect = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, '..', 'assets', 'auth', 'baileys')
    );

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino ({level: "error"}),
        browser: ["Chrome (Linux)", "", ""],
        markOnlineOnConnect: true,
    });

    if(!Socket.authState.creds.registered){
       const phoneNumber = await question("Informe o seu numero de telefone: "); 

       if (!phoneNumber){
        throw new Error("Numero de telefone inválido")
       }

       const code = await Socket.requestPairingCode(onlyNumber(phoneNumber));

       console.log(`Código de pareamento: ${code}`);
    }

    socket.ev.on("connection.update", (update) =>{
         const { connection, lastDisconnect } = update;

         if(connection == "close"){
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if(shouldReconnect){
                this.connect(); //caso o IF acima seja verdadeiro, vai realizar a conexão novamente  
            }
         }
    });

    socket.ev.on('creds.update', saveCreds);
};
