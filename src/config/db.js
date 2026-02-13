const mysql =require('mysql2');
const connection = mysql.createConnection({host:'localhost',user:'root',password:'',database:'valorant_db'});

connection.connect((err) => {if (err) {console.error('Error de conexión:', err);return;
  }console.log('Conectado a MySQL');
});module.exports = connection;