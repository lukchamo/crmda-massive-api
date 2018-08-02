import { DB } from "../firebase"
import moment from "moment"
import papaparse from "papaparse"
import fs from "fs"

async function writeMassive(req, res) {
  try {
    const customersRef = DB.ref("/customers")
    const c = await fs.readFileSync(req.files.csvFile.path, "utf8")
    const d = papaparse.parse(c, {
      complete: result => {
        const now = moment().unix()
        const selectedLocation = req.body.selectedLocation
        const sourceKey = req.body.sourceKey
        const uid = req.body.uid

        result.data.forEach(x => {
          DB.ref("/customers/" + x[2]).update({
            fechaRtm: x[0],
            nombreCliente: x[1],
            registro1: x[3],
            identificacion: x[4],
            direccion: x[5],
            telefonos: x[6],
            marca: x[7],
            linea: x[8],
            tipoServicio: x[9],
            tipoVehiculo: x[10],
            modelo: x[11],
            fechaRtmVencida: x[12],
            registro2: x[13],
            createdAt: now,
            sourceKey: sourceKey,
            location: selectedLocation,
            createdBy: uid,
          })
        })
        return res.status(200).json({ success: true })
      }
    })
  } catch(ex) {
    return res.status(500).json({ error: ex })
  }
}

module.exports = { writeMassive }