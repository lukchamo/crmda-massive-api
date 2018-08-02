import express from "express"
import customersController from "../controllers/customers"
import multipart from "connect-multiparty"

const api = express.Router()

api.post("/customers/write-massive", multipart(), customersController.writeMassive)

export default api