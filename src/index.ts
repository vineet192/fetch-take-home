const express = require("express")
const cors = require("cors")
import MissingItemFieldsError from "./exceptions/MissingItemFields";
import MissingReceiptFieldsError from "./exceptions/MissingReceiptFields";
import MalformedDateTimeError from "./exceptions/MalformedDateTime";

import { Request, Response, NextFunction } from "express";

const app = express()
app.use(express.json())

app.use(cors())

const PORT = 3000

//Define /receipts route
let receiptRoutes = require("./routes/receipts")
app.use("/receipts", receiptRoutes)

//Global error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {

  if (err instanceof MissingReceiptFieldsError) {
    res.status(422).send({
      instance: req.originalUrl,
      title: "Missing fields",
      detail: "Certain fields are missing for the Receipt"
    })
    return
  }

  if (err instanceof MissingItemFieldsError) {
    res.status(422).send({
      instance: req.originalUrl,
      title: "Missing fields",
      details: "Some items are missing certain fields"
    })
    return
  }

  if (err instanceof MalformedDateTimeError) {
    res.status(400).send({
      instance: req.originalUrl,
      title: "Malformed Date or time",
      details: "The purchase date or purchase time might be malformed"
    })
    return
  }

  res.status(500).send({
    instance: req.originalUrl,
    title: "Server Error",
    details: err
  })

})

//Express server.
app.listen(PORT, () => {
  console.log(`Server started. Listening on port ${app.path() + ':' + PORT}`);
});