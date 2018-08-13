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

        var countUpdated = 0;
        var countNews = 0;
        var countCustomers = 0;

        countCustomers = result.data.length;

        result.data.forEach(x => {

          //var self =  this
          console.log(x[0]);
          
          if(x[0] && x[12] != ''){


            let fechaRtmVencida 
            let fechaRtmVencidaUnix

            if(x[12] != ''){
             fechaRtmVencida = moment(x[12],'D/MM/YYYY')
             fechaRtmVencidaUnix = moment(fechaRtmVencida).unix()
            }else{
              fechaRtmVencidaUnix = ''
            }

            const Customer = {
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
              fechaRtmVencidaUnix: fechaRtmVencidaUnix,
              registro2: x[13],
              createdAt: now,
              sourceKey: sourceKey,
              location: selectedLocation,
              createdBy: uid,
            }

            DB.ref("/customers2/").child(x[2]).once('value',snapshot=>{
              if(snapshot.exists()){
                countUpdated++;
                console.log('Actualizó');
                
              }      

            })

            DB.ref("/customers2/" + x[2]).update(Customer)
                              
            
          }
        })
        return res.status(200).json({ success: true,  countUpdated:countUpdated ,   countNews: countNews, countCustomers: countCustomers})
      }
    })
  } catch(ex) {
    console.log(ex);
    
    return res.status(500).json({ error: ex })
  }
}

module.exports = { writeMassive }