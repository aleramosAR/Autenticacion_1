import mongoose from 'mongoose';

const MensajeSchema = new mongoose.Schema({
  username: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  fecha: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  texto: {
    type: 'String',
    required: true
  }
});

const Mensaje = mongoose.model('mensaje', MensajeSchema);
export default Mensaje;