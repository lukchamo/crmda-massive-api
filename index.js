import app from "./app"
import bodyParser from "body-parser"
import cors from "cors"
import customersRoutes from "./routes/customers"

const PORT = 3000

app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

app.use("/api", customersRoutes)

app.listen(PORT, () => console.log("Server running on port: ", PORT))