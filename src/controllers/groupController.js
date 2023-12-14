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

                res.status(201).json({message: `Groupe créer: ${group.name} and ${group.id}`});
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

exports.connectToAGroup = async(req, res) =>{
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
                const group = await Group.findOne({_id:req.body.id, name: req.body.name});
                if(!group){
                    res.status(500).json({message: "Group non trouvé"});
                    return;
                }else{
                    const groupData = {
                        id: group._id,
                        admin_id: group.admin_id,
                        members_id: [group.members_id],
                        user_id: req.user.id
                    }
                    
                    const token= await jwt.sign(groupData, process.env.JWT_KEY, {expiresIn: '24h'});
                    res.status(201).json(token);
                }
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
        console.log(error);
        res.status(500).json({message: 'Une erreur s\'est produite lors du traitement'});
    }
}


exports.deleteGroup = async(req, res) =>{
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

            req.group = payload;

            if(req.group.admin_id == req.group.user_id){
                try {
                    const group = await Group.findByIdAndDelete(req.group.id, req.body, {new: true});
                    res.status(201).json({message : 'Group Supprimé'});
                    
                } catch (error) {
                    res.status(500);
                        console.log(error);
                        res.json({ message : 'Erreur serveur'});
                }
            }else{
                res.status(403).json({message: "Accès interdit: Vous n\'etes pas l\'admin"});
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