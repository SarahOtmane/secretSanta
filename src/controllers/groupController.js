const User = require('../models/userModel');
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

            //recup du token les données du user 
            req.user = payload;

            try{    
                let newGroup = await new Group({
                    name: req.body.name,
                    admin_id: req.user.id,
                    members_id: [req.user.id]
                });

                let group = await newGroup.save();

                res.status(201).json({message: `Groupe créer avec succès. Le nom de ce dernier est: ${group.name} , son id est:  ${group.id}`});
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
            //recup du token les infos du user qui veut se connecter au groupe
            req.user = payload;

            try{
                const group = await Group.findOne({_id:req.body.id, name: req.body.name});
                if(!group){
                    res.status(500).json({message: "Group non trouvé"});
                    return;
                }else{
                    //l id, admin_id et members_id sont recup depuis la bdd
                    const groupData = {
                        id: group._id,
                        admin_id: group.admin_id,
                        members_id: group.members_id,
                        user_id: req.user.id
                    }
                    
                    const token= await jwt.sign(groupData, process.env.JWT_KEY, {expiresIn: '24h'});
                    res.status(201).json({token});
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


exports.getAllUsersInGroup = async(req, res) =>{
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

            //si l utilisateur fais partie du group il peut acceder a la liste des members
            const groupMembers = req.group.members_id[0];
            if(groupMembers.includes(req.group.user_id)){
                try {
                    let tabMembers = [];
                    for(let i=0; i<groupMembers.length; i++){
                        const userMember = await User.find({_id : groupMembers[i]});
                        tabMembers.push({id: userMember[i]._id, email: userMember[i].email})
                    }
                    res.status(200);
                    res.json(tabMembers);

                } catch (error) {
                    res.status(500);
                        console.log(error);
                        res.json({ message : 'Erreur serveur'});
                }
            }else{
                res.status(403).json({message: "Accès interdit: Vous ne faites pas partie de ce group."});
            }
        }else{
            res.status(403).json({message: "Accès interdit: token manquant"});
        } 
    } catch (error) {
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur (group inexistant)'});
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

            //si l utilisateur actuel est un admin il pourra delete sinon acces interdit
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
            res.json({ message : 'Erreur serveur (group inexistant)'});
    }
}

exports.updateNameGroup = async(req, res) =>{
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
                    const group = await Group.findByIdAndUpdate(req.group.id, req.body, {new: true});
                    res.status(201).json({message: `Nom du groupe modifié avec succés. Le nouveau nom est : ${req.body.name}`});

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
            res.json({ message : 'Erreur serveur'});
    }
}
