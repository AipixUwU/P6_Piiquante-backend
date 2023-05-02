const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });

};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                        .catch(error => res.status(401).json({ error }));

                });
            }
        })
        .catch(error => {
            res.status(500).json({ error })
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));

};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};


exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const sauceId = req.params.id;
    const like = req.body.like;

    Sauce.findOne({ _id: sauceId })
        .then(sauce => {

            // Si l'utilisateur a aimé la sauce
            if (like === 1) {
                if (!sauce.usersLiked.includes(userId)) {
                    sauce.likes += 1;
                    sauce.usersLiked.push(userId);
                }
                
                // Si l'utilisateur n'a pas aimé la sauce
            } else if (like === -1) {
                if (!sauce.usersDisliked.includes(userId)) {
                    sauce.dislikes += 1;
                    sauce.usersDisliked.push(userId);
                }

                // Si l'utilisateur a retiré son like/dislike
            } else if (like === 0) {
                const userIndex = sauce.usersLiked.indexOf(userId);

                // Si l'utilisateur avait précédemment aimé la sauce
                if (userIndex !== -1) {
                    sauce.likes -= 1;
                    sauce.usersLiked.splice(userIndex, 1);
                } else {
                    const userIndex = sauce.usersDisliked.indexOf(userId);

                    // Si l'utilisateur avait précédemment pas aimé la sauce
                    if (userIndex !== -1) {
                        sauce.dislikes -= 1;
                        sauce.usersDisliked.splice(userIndex, 1);
                    }
                }
            }
            sauce.save()
                .then(() => res.status(200).json({ message: 'Like/dislike ajouté/supprimé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error }));
};