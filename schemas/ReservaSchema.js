const mongoose = require('mongoose');

const Reserva_Schema = new mongoose.Schema({
  usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
  },
  empleado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empleado'
  },
  fechaRerv: { type: Date, default: Date.now },
  estado: { type: Number, required: true }  
}, {
  versionKey: false
});
 
const ReservaDB = mongoose.model("Reserva", Reserva_Schema);
module.exports = ReservaDB;
