class MalformedDateTimeError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export default MalformedDateTimeError