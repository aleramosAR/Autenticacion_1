import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema({
  title: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  thumbnail: {
    type: 'String',
    maxLength: 40,
    required: true
  },
  price: {
    type: 'Number',
    required: true
  }
});

const Producto = mongoose.model('producto', ProductoSchema);
export default Producto;