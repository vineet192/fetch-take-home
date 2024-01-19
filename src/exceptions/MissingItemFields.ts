class MissingItemFieldsError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export default MissingItemFieldsError