const mongoose = require('mongoose');

const Empleado_Schema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  email: String,  
  telefono: Number,
  servicios: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servicio'
  },
}, {
  versionKey: false
});
 
const EmpleadoDB = mongoose.model("Empleado", Empleado_Schema);
module.exports = EmpleadoDB;
