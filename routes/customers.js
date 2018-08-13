import express from "express"
import customersController from "../controllers/customers"
import multipart from "connect-multiparty"

const api = express.Router()

api.post("/customers/write-massive", multipart(), customersController.writeMassive)
api.get("/customers/test", function(req,res){
  res.send('Test ok jajjajaja - Rama LK ')
})

export default api