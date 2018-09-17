import { DB } from "../firebase"
import moment from "moment"
import papaparse from "papaparse"
import fs from "fs"

import Validator from "fastest-validator"

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

           // fechaRtmVencida = moment(fechaRtmVencida).add(1,'Y')

            //DB.ref("/customers/")
            var telefonos = [] 
            var statusCode = 'venta'
            DB.ref("/customers").child(x[2]).once('value',customerSnapshot=>{

              const Customer = customerSnapshot.val()
              if(customerSnapshot.exists()){
                
                console.log('Existente')
                  if(fechaRtmVencidaUnix > Customer.fechaRtmVencidaUnix){
                    statusCode = 'post_venta'
                    console.log('post_venta')
                  }

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
                fechaRtmVencida: fechaRtmVencida || null,
                fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,
                //registro2: x[13],
                // poseedor: x[13] || null,
                // celular2: x[14] || null,
                createdAt: now,
                sourceKey: sourceKey,
                location: selectedLocation,
                createdBy: uid,
                statusCode: statusCode
              }

              //if(x[12])
              //console.log(Customer)

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


async function updateCustomers(req, res) {
  try {

    let v = new Validator();

    const schema = {
        0: { type: "date",  convert: true, required:true, min:2},        // Fecha RTM
        1: { type: "string", required:true, empty:false, min:2 },  // Nombre Cliente
        2: { type: "string", required:true, empty:false, min:2},  // Placa
        3: { type: "number",convert:true, required:true, empty:false}   // Certificado
    };

    var check = v.compile(schema);

    const customersRef = DB.ref("/customers")
    const checkCustomersRef = DB.ref("/checksCustomers")
    const c = await fs.readFileSync(req.files.csvFile.path, "utf8")
    const d = papaparse.parse(c, {
      complete: result => {
        
        const selectedLocation = req.body.selectedLocation
        
        const uid = req.body.uid

        const locationRef = DB.ref("/locations/"+selectedLocation)

        let locationName
        locationRef.once('value', locationSnap=>{
          locationName = locationSnap.val()
        })

        var countUpdated = 0;
        var countNews = 0;
        var countCustomers = 0;
        var countPostVenta = 0;
        var countArray = 1;
        var countFail = 0;
        var failCertificado = 0;
        var failNombre = 0;
        var sourceKey

        var errorValidator = {}

        countCustomers = result.data.length;

        var checkCustomerKey = checkCustomersRef.push().key

        result.data.forEach(x => {
               
          if(x[0]) {

            if(x[1] == '') failNombre++
            if(x[3] == '') failCertificado++
          
            if(check(x) && x[1] !=''  && x[3] !='' && x[3] !=0){
              console.log(x);                      
              
              
              let fechaRtm 
              let fechaRtmUnix

              var fechaRtmVencida
              var fechaRtmVencidaUnix

              if(x[0] != ''){
                fechaRtm = moment(x[0],'D/MM/YYYY')
                fechaRtmUnix = moment(fechaRtm).unix()

                fechaRtmVencida = moment(fechaRtm).add(1,'Y').format('D/MM/YYYY')
                fechaRtmVencidaUnix = moment(fechaRtm).add(1,'Y').unix()
              }else{
                fechaRtmUnix = ''
              }
              var now
              var telefonos = [] 
              var statusCode = 'venta'
              var typeRtm = ''
              var fechaRtmBD
              DB.ref("/customers").child(x[2]).once('value',customerSnapshot=>{
                
                now = moment().unix()

                const Customer = customerSnapshot.val()
                if(customerSnapshot.exists()){
                  countUpdated++

                  now = Customer.createdAt
                  sourceKey = Customer.sourceKey

                  fechaRtmBD = moment(Customer.fechaRtm,'D/MM/YYYY')
                  const fechaRtmBDUnix = moment(fechaRtmBD).unix()
                  
                  fechaRtmBD = fechaRtmBD.format('D/MM/YYYY')

                  
                  typeRtm = 'rtm_cita'

                  if(fechaRtmUnix > fechaRtmBDUnix){
                      statusCode = 'post_venta'
                      //console.log('post_venta', x)

                      console.log('POSTVENTA -> fechaRtmVencidaUnix: ', fechaRtm, 'Fecha RTM cUSTOMER: ',Customer.fechaRtm  )

                      countPostVenta++;
                    }else{
                      console.log('SIN CITA -> fechaRtmVencidaUnix: ', fechaRtm, 'Fecha RTM cUSTOMER: ',Customer.fechaRtm  )
                    }

                    telefonos = Customer.telefonos

                    //console.log(telefonos)
                    if(Customer.telefonos){
                      if(x[6].length == 10){   
                        if(telefonos.indexOf(x[6]) === -1) {                                           
                          telefonos.push(x[6]) 
                        }
                      }                    
                      if(x[6].length == 10){            
                        if(telefonos.indexOf(x[12]) === -1) {
                          telefonos.push(x[12]) 
                        }
                      }
                    }
                }else{

                  fechaRtmBD = null
                  
                  typeRtm = 'rtm_sin_cita'

                  countNews++
                  console.log('NUEVO');

                  statusCode = 'post_venta'
                  sourceKey = '-LLd8SAVBdA3lADfzw3s'
                  if(x[6]){
                    if(x[6].length == 10){ 
                    telefonos.push(x[6]) 
                    }
                  }
                  if(x[12]){
                    if(x[12].length == 7 && x[12] != 1000000){      
                      telefonos.push(x[12])
                    } 
                  }

                  
                
                }


                //logStatus.push(newLogStatus)
                
                

              }).then(()=>{


                var logsChecksCustomersKey = DB.ref('/logsChecksCustomers').push().key;
            
            
            
                const newLogsChecksCustomers = {					
                    uid:uid,
                    //ucode:user.code,
                    fechaRtmBD:fechaRtmBD,
                    customerKey: x[2],
                    checkCustomerKey:checkCustomerKey,
                    rtm:typeRtm,                  
                    createdAt: now
                }

                console.log(newLogsChecksCustomers);


                const Customer = {
                  fechaRtmBD:fechaRtmBD,
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
                  fechaRtmVencida: fechaRtmVencida || null,
                  fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,
                  //registro2: x[13],
                  poseedor: x[13] || null,
                  celular2: x[14] || null,
                  createdAt: now,
                  sourceKey: sourceKey,
                  location: selectedLocation,
                  createdBy: uid,
                  statusCode: statusCode,
                  checkCustomerKey:checkCustomerKey,     
                }

                //console.log(Customer);
                
                //console.log(countNews, countUpdated);
                DB.ref("/logsChecksCustomers/" + logsChecksCustomersKey).set(newLogsChecksCustomers)

                DB.ref("/customers/" + x[2]).update(Customer)
              })

            }else{
              //let  e = {}
              //e[countArray] = check(x)
              
              errorValidator[countArray] = check(x)
              countFail++
            }

            countArray++

          }

        })
       
        setTimeout(()=>{
          const response = {
            success:true,
            locationName: selectedLocation,
            countNews,
            countUpdated,
            //countPostVenta,
            countArray,
            countFail,
            errorValidator,
            failNombre,
            failCertificado
          }

          const checkCustomer = {
            uid: uid,
            createdAt: moment().unix(),
            customersUpdated:countUpdated,
            customersNew:countNews,
            location:selectedLocation,
            failCertificado: failCertificado,
            failNombre: failNombre
          }
          
          checkCustomersRef.child(checkCustomerKey).set(checkCustomer)
  
          return res.status(200).json(response)
        }, 5000)
        
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




async function fillDataClients(req, res) {
  try {
    const clientsRef = DB.ref("/customers")

    const uid = req.body.uid

    const response = {
      success:true,
      totalRecords: 1,
      rows: {}
    }

     return res.status(200).json(response)
      
    
  } catch(ex) {
    console.log(ex);    
    
    return res.status(500).json({ error: ex })
  }
}


module.exports = { writeMassive,updateCustomers, writeMassiveGarages, fillDataClients }