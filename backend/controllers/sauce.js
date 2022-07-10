const fs = require('fs');
const Sauce = require('../models/Sauce');

exports.createSauce =  (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0
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
  const uId = req.body.userId;
  const statusLike = req.body.like;
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
    if(!sauce.usersDisliked.includes(uId) && !sauce.usersLiked.includes(uId)){
      if(statusLike === 1){
        Sauce.updateOne({_id:req.params.id},{$inc:{likes:1},$push:{usersLiked:uId}})
        .then(() => res.status(201).json({message : 'Like Ok' }))
        .catch(error => res.status(400).json( error ))
      }else if(statusLike === -1){
        Sauce.updateOne({_id:req.params.id},{$inc:{dislikes:1},$push:{usersDisliked:uId}})
        .then(() => res.status(201).json({message : 'DisLike Ok' }))
        .catch(error => res.status(400).json( error ))
      }
    }
    if(statusLike === 0){
      if(sauce.usersDisliked.includes(uId)){
        Sauce.updateOne({_id:req.params.id},{$inc:{dislikes:-1},$pull:{usersDisliked:uId}})
        .then(() => res.status(201).json({message : 'Annulation Dislike Ok' }))
        .catch(error => res.status(400).json( error ))
      }
      if(sauce.usersLiked.includes(uId)){
        Sauce.updateOne({_id:req.params.id},{$inc:{likes:-1},$pull:{usersLiked:uId}})
        .then(() => res.status(201).json({message : 'Annulation Like Ok' }))
        .catch(error => res.status(400).json( error ))
      }
    }
    })
    .catch(error => res.status(500).json( error ));
};