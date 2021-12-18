const mongoose = require('mongoose');

const Comentario_Schema = new mongoose.Schema({
  usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
  },
  empleado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empleado'
  },
  comentario: String,
  calificacion: Number,
  fechaComent: { type: Date, default: Date.now },
}, {
  versionKey: false
});
 
const ComentarioDB = mongoose.model("Comentario", Comentario_Schema);
module.exports = ComentarioDB;
