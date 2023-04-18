const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const schema = require('../middleware/passwordValidator');
// const dotenv = require('dotenv').config()
require('dotenv').config()

const User = require('../models/User');


exports.signup = (req, res, next) => {

    if (!schema.validate(req.body.password)) {
        console.log('Le mot de passe doit contenir au moins 8 caractères');
        res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' });
        return;
    } else {


        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    }
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {

            if (user === null) {
                res.status(401).json({ message: 'Paire identidiant/mote de passe incorrect' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {

                        if (!valid) {
                            res.status(500).json({ message: 'Paire identidiant/mote de passe incorrect' })
                        } else {
                            res.status(200).json({

                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.SECRET_TOKEN,
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error });
                    });
            }
        })
        .catch(error => {
            res.status(500).json({ error })
        })
};