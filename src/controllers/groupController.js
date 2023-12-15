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
                    members_id: [req.user.id],
                    membresInvited: [],
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
                        membresInvited: group.membresInvited,
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
            const groupMembers = req.group.members_id;
            console.log(groupMembers);
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


exports.inviteToGroup = async(req, res) =>{
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
                    const userInvited = await User.findOne({email: req.body.email});

                    //vérifier que l utilisateur existe bien dans la bdd
                    if(!userInvited){
                        res.status(500).json({message: "L\'utilisateur n\'existe pas dans la base de donnée"})
                    }else{

                        //récup la liste des membres du group
                        const groupMembers = req.group.members_id;

                        //récup la liste des membres invités a rejoindre le groupe
                        const membersInvited = req.group.membresInvited;

                        //l invitation est valide pendant 24h
                        const expirationTime = 24 * 60 * 60 * 1000;
                        const currentTime = new Date().getTime();

                        //voir si l id du user quand veut inviter fais partis des membres deja invités
                        const id = membersInvited.indexOf(req.group.user_id);

                        //envoyer une invitation que si l utilisateurs ne fais pas partie des membres du groupes
                        //ou si une invitation na pas déja été envoye
                        if(membersInvited == undefined || !(groupMembers.includes(req.group.user_id)) || (id == -1)){
                            if(membersInvited == undefined) membersInvited = [];

                            membersInvited.push({
                                email: req.body.email,
                                createdAt: new Date().getTime(),
                            })

                            res.status(201).json({message: `${req.body.email} a été invité a rejoindre ce groupe.`});
                        }else{
                            //si l utilisateur fais partie des membres
                            if(groupMembers.includes(req.group.user_id)){
                                res.status(500).json({message: "L\'utilisateur est déja membre du groupe"})
                            }else{
                                //si une invitation a été envoye
                                if(id !== -1){
                                    //si l invitation na pas expire
                                    if(currentTime - membersInvited[id].createdA < expirationTime){
                                        res.status(500).json({message: "L\'utilisateur a déja été invité."})
                                    }else{
                                        // si l invit a été envoye mais elle a expiré on renvoie
                                        membersInvited.push({
                                            email: req.body.email,
                                            createdAt: new Date().getTime(),
                                        })

                                        res.status(201).json({message: `${req.body.email} a été invité a rejoindre ce groupe.`});
                                    }
                                }
                            }
                        }
                    }
                    
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
        console.log(error);
        res.status(500).json({message: 'Une erreur s\'est produite lors du traitement'});
    }
}