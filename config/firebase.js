const admin = require('firebase-admin');
const serviceAccount = require('./nodejs-1cc38-firebase-adminsdk-yno4r-6f71a838ae.json'); //archivo de credenciales

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://nodejs-1cc38.firebaseio.com'  //URL de la base de datos Firebase!
});

const db = admin.firestore();
module.exports = admin;
