class MissingReceiptFieldsError extends Error{
    constructor(msg: string){
        super(msg)
    }
}

export default MissingReceiptFieldsError