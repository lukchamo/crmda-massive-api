var { DB } = require("../firebase")
var moment = require("moment")
var papaparse = require("papaparse")
var fs = require("fs")
var groupArray = require('group-array')


var Validator = require("fastest-validator")

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

        // const locationRef = DB.ref("/locations/"+selectedLocation)

        // let locationName
        // locationRef.once('value', locationSnap=>{
        //   locationName = locationSnap.val()
        // })

        var countUpdated = 0;
        var countNews = 0;
        var countCustomers = 0;

        countCustomers = result.data.length;
        var i = 0

       

        result.data.forEach(async (x) => {

        
          

          //var self =  this
          //console.log(x[0]);
          
          if(x[0]){


            let fechaRtmVencida 
            let fechaRtmVencidaUnix

            if(x[0] != ''){

             fechaRtmBD = moment(x[0],'D/MM/YYYY')
             fechaRtmBDUnix = fechaRtmBD.unix()

             fechaRtmVencida = fechaRtmBD.add(1,'Y')             
             fechaRtmVencidaUnix = fechaRtmVencida.unix()
            }else{
              fechaRtmVencidaUnix = ''
            }

           // fechaRtmVencida = moment(fechaRtmVencida).add(1,'Y')

            //DB.ref("/customers/")
            var telefonos = [] 
            var statusCode = 're_venta'
            var rtm = 'customer_bd'
            var fechaRtmBD
            var fechaRtmBDUnix
          

              DB.ref("/customers").child(x[2]).once('value', customerSnapshot=>{

                const Customer = customerSnapshot.val()                
               
                

                  countNews++

                  
                  if(x[6].length == 10){ 
                   telefonos.push(x[6]) 
                  }
                  if(x[13]){
                    if(x[13].length == 7 && x[13] != 100000){      
                      telefonos.push(x[13])
                    } 
                  }

                  //const jsRtmDBUnix = jsFechaRtmBD.getTime() / 1000
                  //const jsRtmDBUnix = jsFechaRtmBD.getTime() / 1000
                
                

              }).then(()=>{




                const Customer = {
                  // fechaRtm2017: x[0] || null,
                  // fechaRtm2017Unix: jsDateUnix || null,
                  // fechaRtmVencida: jsDateVencimiento || null,
                  // fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,       
                  fechaRtm: x[0] || null,
                  fechaRtmBD: fechaRtmBD.format('DD/MM/YYYY') || null,
                  fechaRtmBDUnix: fechaRtmBDUnix || null,
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
                  fechaRtmVencida: fechaRtmVencida.format('DD/MM/YYYY') || null,
                  fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,               
                  createdAt: now,
                  sourceKey: sourceKey,
                  location: selectedLocation,
                  createdBy: uid,
                  rtm:rtm,
                  statusCode: statusCode
                }

                console.log(Customer);
                //if(x[12])
                

                // setTimeout(()=>{
                //   console.log(i,Customer)
                // }, 50)

               DB.ref("/customers/" + x[2]).update(Customer)
              })
            

            

            
            

            
            
            //console.log('Placa:'+ x[2] +'Tel:'+ telefonos + 'fecha:' + (fechaRtmVencidaUnix || null)  );
            
            

            
                              
            
          }
          
          //console.log(countNews);
        })
        

        setTimeout(()=>{

          const response = {
            success:true,
            countNews,
            countUpdated
          }
  
          return res.status(200).json(response)

        }, 5000)
        
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

        result.data.forEach(async (x) => {
               
          if(x[0]) {

            if(x[1] == '') failNombre++
            if(x[3] == '') failCertificado++
          
            if(check(x) && x[1] !=''  && x[3] !='' && x[3] !=0){
              console.log(x);                      
              
              
              let fechaRtm 
              let fechaRtmUnix

              var fechaRtmVencida
              var fechaRtmVencidaUnix

              var jsDate
              var jsDateUnix

              var jsDateVencimiento
              var jsDateVencimientoUnix

              if(x[0] != ''){
                jsDate = moment(x[0], 'DD/MM/YYYY')
                jsDateUnix = jsDate.unix()

                jsDateVencimiento =  jsDate.add(1,'y')
                jsDateVencimientoUnix = jsDateVencimiento.unix()

              }


              

              var now
              var telefonos = [] 
              var statusCode = 'venta'
              var typeRtm = ''
              var fechaRtmBD
              var Customer
              DB.ref("/customers").child(x[2]).once('value',customerSnapshot=>{
                
                now = moment().unix()

                Customer = customerSnapshot.val()
                if(customerSnapshot.exists()){
                  //countUpdated++

                  now = Customer.createdAt
                  sourceKey = Customer.sourceKey
                  
                  typeRtm = 'customer_exist'
                  statusCode = 'post_venta'

                  if(Customer.rtm != typeRtm){
                    typeRtm = 'customer_new'
                    countNews++
                  }else{
                    typeRtm = 'customer_exist'
                    countUpdated++
                  }

                  // if(fechaRtmUnix > fechaRtmBDUnix){
                  //     statusCode = 'post_venta'
                  //     //console.log('post_venta', x)

                  //     console.log('POSTVENTA -> fechaRtmVencidaUnix: ', fechaRtm, 'Fecha RTM cUSTOMER: ',Customer.fechaRtm  )

                  //     countPostVenta++;
                  //   }else{
                  //     console.log('SIN CITA -> fechaRtmVencidaUnix: ', fechaRtm, 'Fecha RTM cUSTOMER: ',Customer.fechaRtm  )
                  //   }

                    

                    //console.log(telefonos)
                    if(Customer.telefonos){
                      telefonos = Customer.telefonos

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
                    }else{
                      telefonos.push(x[6])
                    }
                }else{                  
                  
                  typeRtm = 'customer_new'

                  

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
                    //fechaRtmBD:fechaRtmBD,
                    customerKey: x[2],
                    checkCustomerKey:checkCustomerKey,
                    rtm:typeRtm,
                    fechaRtm2018:jsDate,
                    fechaRtm2018Unix:jsDateUnix,
                    createdAt: now
                }

                //console.log(newLogsChecksCustomers);


                


                const nCustomer = {

                  fechaRtm2018: jsDate.format('DD/MM/YYYY') || null,
                  fechaRtm2018Unix: jsDateUnix || null,
                  fechaRtmVencida: jsDateVencimiento.format('DD/MM/YYYY') || null,
                  fechaRtmVencidaUnix: jsDateVencimientoUnix || null,

                  // fechaRtmBD:fechaRtmBD,
                  // fechaRtm: x[0] || null,
                   nombreCliente: x[1] ||  null,
                  // registro1: x[3] || null,
                   identificacion: x[4] || null,
                   direccion: x[5] || null,
                   telefonos: telefonos || null,
                   marca: x[7] ||  null,
                   linea: x[8] ||  null,
                   tipoServicio: x[9] ||  null,
                   tipoVehiculo: x[10] ||  null,
                   modelo: x[11] || Customer.modelo || null,
                  // fechaRtmVencida: fechaRtmVencida || null,
                  // fechaRtmVencidaUnix: fechaRtmVencidaUnix || null,
                   //registro2: x[13],
                   poseedor: x[13] ||  null,
                   celular2: x[14] || null,
                  // createdAt: now,
                  // sourceKey: sourceKey,
                   location: selectedLocation,
                  // createdBy: uid,
                  rtm:typeRtm,
                  statusCode: statusCode,
                  //checkCustomerKey:checkCustomerKey,     
                }

                console.log(nCustomer);
                
                //console.log(countNews, countUpdated);
                //DB.ref("/logsChecksCustomers/" + logsChecksCustomersKey).set(newLogsChecksCustomers)

                DB.ref("/customers/" + x[2]).update(nCustomer)
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
            failNombre: failNombre,
            countFail: countFail
          }
          
          checkCustomersRef.child(checkCustomerKey).set(checkCustomer)
  
          return res.status(200).json(response)
        }, 4000)
        
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
    const customerRef = DB.ref("/customers")

    const uid = req.body.uid

    const response = {
      success:true,
      totalRecords: 1,
      rows: {}
    }

    customerRef.once('value', (customerSnap)=>{
      let i = 0
      
      
      customerSnap.forEach((snap)=>{
        const data = snap.val()

      
        
          if(data.rtm){
            
          }else{
            

            const uCustomer = {
              rtm: 'customer_bd'
            }
            //DB.ref('/customers/'+snap.key).update(uCustomer)
            console.log(snap.key, uCustomer, data.rtm);
            
          }
            
       

        i++
      })

      
      

     // return res.status(200).json(clientsSnap.val())
    })


     return res.status(200).json(response)
      
    
  } catch(ex) {
    
      
    
    return res.status(500).json({ error: ex })
  }
}


async function postVenta(req,res){
  console.log('ok');

  DB.ref("/customers").orderByChild('statusCode').equalTo('post_venta').once('value',logCheckSnapshot=>{
    logCheckSnapshot.forEach((snap)=>{
      const Customer = snap.val()
      

      // const fechaRtm = moment(Customer.fechaRtmBD,'D/MM/YYYY')


      // const data = {
      //   fechaRtm: fechaRtm.add(1,'y').format('D/MM/YYYY')
      // }

      // console.log(Customer.fechaRtmBD, data.fechaRtm);

      console.log(Customer.fechaRtm, Customer.fechaRtmBD,Customer.fechaRtmBDUnix );
      
      
    })
  })
  res.send('Post Ventas Log')
}


module.exports = { writeMassive,updateCustomers, writeMassiveGarages, fillDataClients, postVenta }