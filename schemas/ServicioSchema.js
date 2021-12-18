const mongoose = require('mongoose');

const Servicio_Schema = new mongoose.Schema({
  nombre: String,
  desc: String,
  costo: Number,
  duracion: Number 
}, {
  versionKey: false
});

const ServicioDB = mongoose.model("Servicio", Servicio_Schema);
module.exports = ServicioDB;
