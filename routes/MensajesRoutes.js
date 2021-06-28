import express from "express";
import Mensaje from '../models/Mensaje.js';
import { authAPI } from '../middlewares/Middlewares.js';

const router = express.Router();
router.use(express.json());

router.get("/", async(req, res) => {
  try {
    const mensajes = await Mensaje.find();
    res.status(200).json(mensajes);
  } catch (err) {
    return res.status(404).json({
      error: "No hay mensajes cargados.",
    });
  }
});

router.post("/", authAPI, async(req, res) => {
  try {
    const newMensaje = new Mensaje(req.body);
    await newMensaje.save();
    res.status(201).json(newMensaje);
  } catch (err) {
    res.status(400).send();
  }
});

export default router;