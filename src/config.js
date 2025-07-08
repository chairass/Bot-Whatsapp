const path = require('path');
const { execPath } = require('process');

exports.PREFIX ="/";
exports.BOT_EMOJI = "👺";
exports.BOT_NAME = "Xaxado Bot";

exports.BOT_NUMBER = ""

exports.COMMAND_DIR = path.resolve(__dirname, "..", "commands")
exports.TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 500;

exports.OPENAI_API_KEY = "";