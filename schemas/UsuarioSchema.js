const mongoose = require('mongoose');

const Usuario_Schema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  fechaNaci: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  passwd: { type: String, required: true },
  telefono: Number,
  rolID: { 
	type: String, 
	default: "usuario",
	enum: ["usuario", "interno", "admin"]
  } 
}, {
  versionKey: false
});
 
const UsuarioDB = mongoose.model("Usuario", Usuario_Schema);
module.exports = UsuarioDB;
