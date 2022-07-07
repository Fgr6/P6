const fs = require('fs');
const Sauce = require('../models/Sauce');

exports.createSauce =  (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.listeSauce = (req, res, next) => {
    Sauce.find()
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({ error }));
};

exports.pageSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Non authorizé'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.suppSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const nomFichier = sauce.imageUrl.split('images')[1];
      fs.unlink(`images/${nomFichier}`, () => {
        Sauce.deleteOne({_id: req.params.id })
          .then(() => res.status(200).json({ message : 'Objet supprimé' }))
          .catch(error => res.status(400).json({ error }));
      });
    }) 
    .catch(error => res.status(500).json({ error }));
};

exports.likeDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    if(sauce.usersDisliked.indexOf(req.body.userId) == -1 && sauce.usersLiked.indexOf(req.body.userId) == -1) {
      if(req.body.like == 1) {
        sauce.usersLiked.push(req.body.userId);
        sauce.likes == req.body.like;
      } else if(req.body.like == -1) {
        sauce.usersDisliked.push(req.body.userId);
        sauce.dislikes == req.body.like;
      };
    };
    if(sauce.usersLiked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
      const indexLikes = sauce.usersLiked.findIndex(user => user === req.body.userId);
      sauce.usersLiked.splice(indexLikes, 1);
      sauce.likes == 1;
    };
    if(sauce.usersDisliked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
      const indexLikes = sauce.usersDisliked.findIndex(user => user === req.body.userId);
      sauce.usersDisliked.splice(indexLikes, 1);
      sauce.likes == 1;
    }
    sauce.save();
    res.status(201).json({ message: 'Like ou Dislike : OK' });
  })
  .catch(error => res.status(500).json({ error }));
};