const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
require('dotenv').config();

exports.userRegister = async(req, res) =>{
    try {
        if (jwtMiddleware.verifyEmail(req.body.email)) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            let newUser = new User({
                email: req.body.email,
                password: hashedPassword
            });
              
            let user = await newUser.save();
            res.status(201).json({message: `User créer: ${user.email}`});
        } else {
            res.status(401).json({message: 'Le format de l\'email n\'a pas été respecté'});
        }
    } catch(error){
        res.status(401).json({message: 'Requete invalide'});
    }
}


exports.loginRegister = async(req, res) =>{
    try {
        const user = await User.findOne({email: req.body.email});

        if(!user){
            res.status(500).json({message: "utilisateur non trouvé"});
            return;
        }else{
            const passwordMatch = await bcrypt.compare(req.body.password, user.password);

            if(user.email == req.body.email && passwordMatch){
                const userData = {
                    id: user._id,
                    email: user.email
                }

                const token = await jwt.sign(userData, process.env.JWT_KEY, {expiresIn: '10h'});
                res.status(201).json({token});
            }else{
                res.status(401).json({message: 'Email ou password incorrect'});
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Une erreur s\'est produite lors du traitement'});
    }
}


exports.userModify = async(req, res) =>{
    try {
        let token = req.headers['authorization'];
        if(token != undefined){
            const payload = await new Promise((resolve, reject) =>{
                jwt.verify(token, process.env.JWT_KEY, (error, decoded) =>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(decoded);
                    }
                })
            })

            req.user = payload;

            try{
                req.body.password = await bcrypt.hash(req.body.password, 10);
                const user = await User.findByIdAndUpdate(req.user.id, req.body, {new: true});
                res.status(201).json({message : "votre mot de passe a bien été modifié"});
            }
            catch(error){
                res.status(500);
                    console.log(error);
                    res.json({ message : 'Erreur serveur lors du traitement'});
            }
        }else{
            res.status(403).json({message: "Accès interdit: token manquant"});
        }
    } catch (error) {
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur'});
    }
}


exports.deleteUser = async(req, res) =>{
    try {
        let token = req.headers['authorization'];
        if(token != undefined){
            const payload = await new Promise((resolve, reject) =>{
                jwt.verify(token, process.env.JWT_KEY, (error, decoded) =>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(decoded);
                    }
                })
            })

            req.user = payload;

            try{
                const user = await User.findByIdAndDelete(req.user.id, req.body, {new: true});
                res.status(200);
                res.json({ message : 'Supprimé'});
            }
            catch(error){
                res.status(500);
                    console.log(error);
                    res.json({ message : 'Erreur serveur'});
            }
        }else{
            res.status(403).json({message: "Accès interdit: token manquant"});
        }  
    } catch (error) {
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur (user inexistant)'});
    }
}