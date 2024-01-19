import { randomUUID } from "crypto";
import Receipt from "../models/receipt.model";
import { Request, Response, NextFunction, Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import Item from "../models/item.model";
import MissingItemFieldsError from "../exceptions/MissingItemFields";
import MissingReceiptFieldsError from "../exceptions/MissingReceiptFields";
import MalformedDateTimeError from "../exceptions/MalformedDateTime";
import ReceiptNotFoundError from "../exceptions/ReceiptNotFound";

const router = Router();

//POST /receipts/process
router.route("/process").post((req: Request, res: Response, next: NextFunction) => {
    let receipt: Receipt = req.body as Receipt;

    //validate request payload
    try {
        validateReceipt(receipt)
        validatePurchaseDateTime(receipt.purchaseDate, receipt.purchaseTime)
    } catch (err: unknown) {
        next(err)
        return
    }

    let id: string = randomUUID()
    let fileDB: any;

    //Read db.json, if its empty initialize to {}
    try {
        fileDB = JSON.parse(readFileSync('/opt/db.json', { flag: "r" }).toString())
    } catch (err: unknown) {
        if (err instanceof SyntaxError) {
            fileDB = {}
        }
        else {
            console.log(err)
            next(err)
            return
        }
    }
    fileDB[id] = receipt
    writeFileSync("/opt/db.json", JSON.stringify(fileDB))

    res.status(201).send({ id: id })
})

//GET /receipts/:id/points
router.route("/:id/points").get((req: Request, res: Response, next: NextFunction) => {

    let fileDB: any;
    let id: string = req.params.id

    try {
        fileDB = JSON.parse(readFileSync('/opt/db.json', { flag: "r" }).toString())
    } catch (err: unknown) {
        if (err instanceof SyntaxError) {
            fileDB = {}
        }
        else {
            next(err)
            return
        }
    }

    let receipt: Receipt = fileDB[id]

    if (receipt === undefined) {
        let err: ReceiptNotFoundError = new ReceiptNotFoundError("Receipt not found, id may be malformed")
        next(err)
        return
    }

    let points: number = countAlphaNumeric(receipt.retailer) +
        roundedTotalBonus(receipt.total) +
        isTotalMultipleOfBonus(receipt.total) +
        everyNItemsBonus(receipt.items) +
        itemDescriptionLengthisMultipleOfBonus(receipt.items) +
        oddPurchaseDayBonus(receipt.purchaseDate) +
        purchaseBetweenRangeBonus(receipt.purchaseTime)

    res.status(200).send({ points: points })

})

//Checks recursively for all fields
function validateReceipt(receipt: Receipt) {

    if (!(receipt.items && receipt.purchaseDate && receipt.purchaseTime && receipt.retailer && receipt.total)) {
        let err: MissingReceiptFieldsError = new MissingReceiptFieldsError("Receipt fields missing")
        throw err
    }

    receipt.items.forEach((item: Item) => {
        if (!(item.price && item.shortDescription)) {
            let err: MissingItemFieldsError = new MissingItemFieldsError("Receipt item fields missing")
            throw err
        }
    })

}

//Performs validation for purchase date and time
function validatePurchaseDateTime(purchaseDate: String, purchaseTime: String, dateDelimiter: string = "-", timeDelimiter: string = ":") {
    const [year, month, day] = purchaseDate.split(dateDelimiter).map((s) => parseInt(s))
    const [hours, minutes] = purchaseTime.split(timeDelimiter).map((s) => parseInt(s))

    let date: Date = new Date(year, month, day, hours, minutes)

    if (isNaN(date.getTime())) {
        throw new MalformedDateTimeError("Malformed Date time")
    }
}

function countAlphaNumeric(s: String) {
    let count: number | undefined = s.match(/[a-zA-Z0-9]/g)?.length
    return count ? count : 0
}

function roundedTotalBonus(total: String, bonus: number = 50) {
    return parseFloat(total as string) === parseInt(total as string) ? bonus : 0
}


function isTotalMultipleOfBonus(total: String, multiple: number = 0.25, bonus: number = 25) {
    return parseFloat(total as string) % multiple == 0 ? bonus : 0
}

function everyNItemsBonus(items: Array<Item>, N: number = 2) {
    return Math.floor(items.length / N) * 5
}

function itemDescriptionLengthisMultipleOfBonus(items: Array<Item>, multiple: number = 3) {

    let points: number = 0

    items.forEach((item: Item) => {
        if (item.shortDescription.trim().length % multiple === 0) {

            points += Math.ceil(parseFloat(item.price as string) * 0.2)
        }
    })
    return points
}

function oddPurchaseDayBonus(purchaseDate: String, delimiter: string = "-", bonus: number = 6) {

    const [year, month, day] = purchaseDate.split(delimiter).map((s) => parseInt(s))
    let date: Date = new Date(year, month - 1, day)
    return date.getDate() % 2 === 0 ? 0 : bonus
}

function purchaseBetweenRangeBonus(purchaseTime: String, start: number = 14, end: number = 16, bonus: number = 10) {
    let date: Date = new Date("01/01/1970 " + purchaseTime)

    let startTime = new Date(`01/01/1970 ${start}:00`)
    let endTime = new Date(`01/01/1970 ${end}:00`)

    return startTime <= date && date <= endTime ? bonus : 0
}

module.exports = router