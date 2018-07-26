import { DB } from "../firebase"
import moment from "moment"

function writeMassive(req, res) {
  const json = req.body.json
  const customersRef = DB.ref("/customers")

  json.forEach((value, index) => {
    customersRef.child(value.placa).set({
      createdAt: moment().unix(),
      direccion: value.direccion,
      fechaRtm: value.fechaRtm,
      fechaRtmVencida: value.fechaRtmVencida,
      fuenteKey: value.fuenteKey,
      identificacion: value.identificacion,
      linea: value.linea,
      location: req.body.selectedLocation,
      marca: value.marca,
      modelo: value.modelo,
      nombreCliente: value.nombreCliente,
      placa: value.placa,
      registro1: value.registro1,
      registro2: value.registro2,
      telefonos: value.telefonos,
      tipoServicio: value.tipoServicio,
      tipoVehiculo: value.tipoVehiculo
    }).then(() => console.log(index, " customers registered succesfully!"))
  })
  res.status(200).json({ success: "PERFECT!!" })
}

module.exports = { writeMassive }