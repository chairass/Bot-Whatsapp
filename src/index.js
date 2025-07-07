const { connect } = require("./utils/connection");

async function start(params) {
    const socket = await connect();

    load(socket);
}

start();