const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.userRegister = async(req, res) =>{
    try {
        let newUser = new User(req.body);  
        let user = await newUser.save();
        res.status(201).json({message: `User créer: ${user.email}`});
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
            if(user.email == req.body.email && user.password == req.body.password){
                const userData = {
                    id: user._id,
                    email: user.email
                }

                const token = await jwt.sign(userData, process.env.JWT_KEY, {expiresIn: '10h'});
                res.status(200).json({token});
            }else{
                res.status(401).json({message: 'Email ou password incorrect'});
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Une erreur s est produite lors du traitement'});
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
            const user = await User.findByIdAndUpdate(req.user.id, req.body, {new: true});
            res.status(200);
            res.json(user);
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