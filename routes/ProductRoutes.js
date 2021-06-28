import express from "express";
import Producto from '../models/Producto.js';
import { authAPI } from '../middlewares/Middlewares.js';

const router = express.Router();
router.use(express.json());

router.get("/", async(req, res) => {
  try {
    const productos = await Producto.find();
    if (productos.length === 0) {
      return res.status(404).json({
        error: "No hay productos cargados.",
      });
    }
    res.status(200).json(productos);
  } catch (err) {
    return res.status(404).json({
      error: "No hay productos cargados.",
    });
  }
});

router.get("/:id", async(req, res) => {
  const { id } = req.params;
  try {
    const prod = await Producto.findOne({ _id: id });
    if (!prod) {
      return res.status(404).json({
        error: "Producto no encontrado.",
      });
    }
    res.status(200).json(prod);
  } catch (err) {
    return res.status(404).json({
      error: "Producto no encontrado.",
    });
  }
});

router.post("/", authAPI, async(req, res) => {
  try {
    const newProducto = new Producto(req.body);
    await newProducto.save();
    res.status(201).json(newProducto);
  } catch (err) {
    res.status(400).send();
  }
});

router.put("/actualizar/:id", authAPI, async(req, res) => {
  const { id } = req.params;
  const updatedPro = req.body;

  const prod = await Producto.findOne({ _id: id });
  if (!prod) {
    return res.status(404).json({
      error: "Producto no encontrado!!.",
    });
  }

  let newProd = {};
  newProd.title = updatedPro.title || prod.title;
  newProd.price = updatedPro.price || prod.price;
  newProd.thumbnail = updatedPro.thumbnail || prod.thumbnail;

  try {
    await Producto.replaceOne({ _id: id }, newProd );
    res.status(200).json(newProd);
  } catch (err) {
    res.status(404).json({
      error: "Producto no encontrado2."
    });
  }

});

router.delete("/borrar/:id", authAPI, async(req, res) => {
  const { id } = req.params;

  try {
    const prod = await Producto.findOneAndRemove({ _id: id });
    res.status(201).json(prod);
  } catch (err) {
    res.status(404).json({
      error: "Producto no encontrado."
    });
  }
});

export default router;