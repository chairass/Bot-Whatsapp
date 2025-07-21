const { load } = require("./loader");
const { connect } = require("./connection");


async function start() {
   const socket = await connect();

    load(socket);
}

start();