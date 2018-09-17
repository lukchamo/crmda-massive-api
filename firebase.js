import admin from "firebase-admin"
import serviceAccount from "./serviceAccount.json"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://crm-diagnostiautos.firebaseio.com/"
})

//https://crm-diagnostiautos.firebaseio.com/
//https://dev-crmd.firebaseio.com

export const DB = admin.database()