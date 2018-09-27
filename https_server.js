var https = require('https')
var fs = require('fs')
var express = require("express")
var bodyParser = require("body-parser")
var cors = require("cors")
var customersRoutes = require("./routes/customers")

var options = {
  key: fs.readFileSync("./ssl/p.key"),
  cert: fs.readFileSync("./ssl/newcert.crt")

}

const app = express();

app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))


app.use((req, res) => {
  res.writeHead(200);
  res.end("hello sollers\n");
});


app.use("/api", customersRoutes)


app.listen(4000);

https.createServer(options, app).listen(4001);
