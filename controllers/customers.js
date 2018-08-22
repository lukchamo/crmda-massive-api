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

        const locationRef = DB.ref("/locations/"+selectedLocation)

        let locationName
        locationRef.once('value', locationSnap=>{
          locationName = locationSnap.val()
        })

        var countUpdated = 0;
        var countNews = 0;
        var countCustomers = 0;

        countCustomers = result.data.length;

        result.data.forEach(x => {

          //var self =  this
          //console.log(x[0]);
          
          if(x[0]){


            let fechaRtmVencida 
            let fechaRtmVencidaUnix

            if(x[12] != ''){
             fechaRtmVencida = moment(x[12],'D/MM/YYYY')
             fechaRtmVencidaUnix = moment(fechaRtmVencida).unix()
            }else{
              fechaRtmVencidaUnix = ''
            }

            //DB.ref("/customers/")
            var telefonos = [] 

            DB.ref("/customers").child(x[2]).once('value',customerSnapshot=>{

              const Customer = customerSnapshot.val()
              if(customerSnapshot.exists()){
                console.log('Existente', Customer.placa );
                  telefonos = Customer.telefonos

                  //console.log(telefonos)
                  if(Customer.telefonos){
                    if(x[6].length == 10){   
                      if(telefonos.indexOf(x[6]) === -1) {                                           
                        telefonos.push(x[6]) 
                      }
                    }                    
                    if(x[6].length == 10){            
                      if(telefonos.indexOf(x[13]) === -1) {
                        telefonos.push(x[13]) 
                      }
                    }
                  }
              }else{
                console.log('NUEVO');
                if(x[6].length == 10){ 
                 telefonos.push(x[6]) 
                }
                if(x[13].length == 7 && x[13] != 1000000){      
                  telefonos.push(x[13])
                } 
               
              }
              
              

            }).then(()=>{
              const Customer = {
                fechaRtm: x[0] || null,
                nombreCliente: x[1] || null,
                registro1: x[3] || null,
                identificacion: x[4] || null,
                direccion: x[5] || null,
                telefonos: telefonos,
                marca: x[7] || null,
                linea: x[8] || null,
                tipoServicio: x[9] || null,
                tipoVehiculo: x[10] || null,
                modelo: x[11] || null,
                fechaRtmVencida: x[12] || null,
                fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,
                //registro2: x[13],
                createdAt: now,
                sourceKey: sourceKey,
                location: selectedLocation,
                createdBy: uid,
                statusCode: 're_venta'
              }

              DB.ref("/customers/" + x[2]).update(Customer)
            })

            

            
            

            //console.log(Customer);
            
            //console.log('Placa:'+ x[2] +'Tel:'+ telefonos + 'fecha:' + (fechaRtmVencidaUnix || null)  );
            
            

            
                              
            
          }

          //console.log(countNews);
        })
        
        const response = {
          success:true,
          locationName: selectedLocation
        }

        return res.status(200).json(response)
      }
    })
  } catch(ex) {
    console.log(ex);
    
    
    return res.status(500).json({ error: ex })
  }
}


async function writeMassiveGarages(req, res) {
  try {
    const garagesRef = DB.ref("/garages")
    const c = await fs.readFileSync(req.files.csvFile.path, "utf8")
    const d = papaparse.parse(c, {
      complete: result => {
        const now = moment().unix()
        // const selectedLocation = req.body.selectedLocation
        // const sourceKey = req.body.sourceKey
        const uid = req.body.uid
        
        var i = 0
        result.data.forEach(x => {
          
          if(x[0] && i > 0 ){
            
            
            let telefonosArray = []

            if(x[4] != '' ) telefonosArray.push(x[4])
            if(x[5] != '' ) telefonosArray.push(x[5])
            if(x[6] != '' ) telefonosArray.push(x[6])

            const Garage = {
              //codigo:x[0],
              nombre:x[1] || null,
              propietario:x[2] || null,
              direccion:x[3] || null,
              telefonos:telefonosArray,
              zona:x[7] || null
            }

            //console.log(Garage);
            
            garagesRef.child(x[0]).update(Garage)


          }

          i++ 


        })
        
        const response = {
          success:true,
        }

        return res.status(200).json(response)
      }
    })
  } catch(ex) {
    console.log(ex);
    
    
    return res.status(500).json({ error: ex })
  }
}

module.exports = { writeMassive, writeMassiveGarages }