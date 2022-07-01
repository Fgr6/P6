const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer');
const auth = require('../middleware/auth');
const sauceCtrl = require('../controllers/sauce');

/*Nouvelle sauce*/
router.post('/', auth, multer, sauceCtrl.createSauce);

  /*Affichage des sauces sur la page*/
router.get('/', auth,  sauceCtrl.listeSauce );

  /*Affichage de la sauce sellectionné via l'id*/
router.get('/:id', auth, sauceCtrl.pageSauce);

  /*Modifier la sauce*/
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

  /*Supprimer une sauce*/
router.delete('/:id', auth, sauceCtrl.suppSauce);


module.exports = router;