class DangerError extends Error {
    constructor(message) {
        super(message);
        this.name = "DangerError";
    }
}; 

module.exports = {
    DangerError, 
};

// Usage example:
// const DangerError = require('./path/to/DangerError');
// throw new DangerError("This is a danger error message.");