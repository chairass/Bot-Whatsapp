class InvalidParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidParameterError";
    }
}

module.exports = {
    InvalidParameterError,
};

// Usage example:
// const InvalidParameterError = require('./path/to/InvalidParameterError');
// throw new InvalidParameterError("This is an invalid parameter error message.");