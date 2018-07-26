import express from "express"
import customersController from "../controllers/customers"

const api = express.Router()

api.post("/customers/write-massive", customersController.writeMassive)

export default api