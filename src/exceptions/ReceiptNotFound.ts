class ReceiptNotFoundError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export default ReceiptNotFoundError