const Group = require('../models/groupModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createAGroup = async(req, res) =>{
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
                let newGroup = await new Group({
                    name: req.body.name,
                    admin_id: req.user.id,
                    members_id: [req.user.id]
                });

                let group = await newGroup.save();

                res.status(201).json({message: `Groupe créer: ${group.name}`});
            }
            catch(error){
                res.status(500);
                    console.log(error);
                    res.json({ message : 'Erreur serveur lors de la création du groupe'});
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