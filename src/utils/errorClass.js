export default class ErrorClass extends Error {
    constructor(sc, msg) {
        super();
        this.statusCode = sc;
        this.message = msg;
    }
}
