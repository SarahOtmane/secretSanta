const User = require('../models/userModel');
const Group = require('../models/groupModel');
const bcrypt = require('bcrypt');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
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
                    //l id sont admin_id sont recup depuis la bdd
                    const groupData = {
                        id: group._id,
                        admin_id: group.admin_id,
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

            //récup la liste des membres du group
            const groupM = await Group.findOne({_id: req.group.id});
            membersTab = groupM.members_id;

            //si l utilisateur fais partie du group il peut acceder a la liste des members
            if(membersTab.includes(req.group.user_id)){
                try {
                    let tabMembers = [];
                    for(let i=0; i<membersTab.length; i++){
                        //pour chaque user récup son email
                        const userMember = await User.find({_id : membersTab[i]});
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
                    //récup les données du user dans la bdd
                    const userInvited = await User.findOne({email: req.body.email});

                    //recupe les donnees du groupe ou l on veut add un user
                    const groupM = await Group.findOne({_id: req.group.id});

                    //récup la liste des membres invités a rejoindre le groupe
                    const membersInvitedTab = groupM.membresInvited;

                    //vérifier que l utilisateur existe bien dans la bdd sinon le créer
                    if(!userInvited){
                        //générer un mot de passe
                        let password = jwtMiddleware.genererMotDePasse();
                        password = await bcrypt.hash(password, 10);

                        //créer et ajouter le user dans la base de donnée
                        let newUser = new User({
                            email: req.body.email,
                            password: password,
                            created: false
                        })

                        let user = await newUser.save();

                        //ajouter le user au membres Invités
                        membersInvitedTab.push({
                            email: req.body.email,
                            id: user.id,
                            createdAt: new Date().getTime(),
                        })

                        //update dans la bdd les membres invites de ce groupe
                        groupM.membresInvited = membersInvitedTab;
                        const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});

                        user = await User.findOne({email: req.body.email});

                        //créer le token correspondant
                        const groupData = {
                            id: groupM._id,
                            admin_id: groupM.admin_id,
                            user_id: user.id
                        }
                        
                        const tokenInvit = await jwt.sign(groupData, process.env.JWT_KEY, {expiresIn: '24h'});
                        res.status(201).json({message: `${req.body.email} a été créé et invité a rejoindre ce groupe. Le token de l'invitation est ${tokenInvit}`});
                    }else{

                        //récup la liste des membres du group
                        const groupMembers = groupM.members_id;

                        //l invitation est valide pendant 24h
                        const expirationTime = 24 * 60 * 60 * 1000;
                        const currentTime = new Date().getTime();

                        //voir si l id du user quand veut inviter fais partis des membres deja invités
                        const id = membersInvitedTab.indexOf(req.group.user_id);

                        //envoyer une invitation que si l utilisateurs ne fais pas partie des membres du groupes
                        //ou si une invitation na pas déja été envoye
                        if(membersInvitedTab == undefined || !(groupMembers.includes(req.group.user_id)) || (id == -1)){
                            if(membersInvitedTab == undefined) membersInvitedTab = [];

                            membersInvitedTab.push({
                                email: req.body.email,
                                id: userInvited.id,
                                createdAt: new Date().getTime(),
                            })
    
                            
                            //je modifie dans la base de donnee
                            groupM.membresInvited = membersInvitedTab;
                            const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});

                            //créer le token correspondant
                            const groupData = {
                                id: groupM._id,
                                admin_id: groupM.admin_id,
                                user_id: userInvited.id
                            }

                            const tokenInvit = await jwt.sign(groupData, process.env.JWT_KEY, {expiresIn: '24h'});

                            res.status(201).json({message: `${req.body.email} a été créé et invité a rejoindre ce groupe. Le token de l'invitation est ${tokenInvit}`});
                        }else{
                            //si l utilisateur fais partie des membres
                            if(groupMembers.includes(req.group.user_id)){
                                res.status(500).json({message: "L\'utilisateur est déja membre du groupe"})
                            }else{
                                //si une invitation a été envoye
                                if(id !== -1){
                                    //si l invitation na pas expire
                                    if(currentTime - membersInvitedTab[id].createdA < expirationTime){
                                        res.status(500).json({message: "L\'utilisateur a déja été invité."})
                                    }else{
                                        // si l invit a été envoye mais elle a expiré on renvoie
                                        membersInvitedTab.push({
                                            email: req.body.email,
                                            id: userInvited.id,
                                            createdAt: new Date().getTime(),
                                        })
                
                                        
                                        //je modifie dans la base de donnee
                                        groupM.membresInvited = membersInvitedTab;
                                        const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});

                                        //créer le token correspondant
                                        const groupData = {
                                            id: groupM._id,
                                            admin_id: groupM.admin_id,
                                            user_id: userInvited.id
                                        }
                                    
                                        const tokenInvit = await jwt.sign(groupData, process.env.JWT_KEY, {expiresIn: '24h'});

                                        res.status(201).json({message: `${req.body.email} a été créé et invité a rejoindre ce groupe. Le token de l'invitation est ${tokenInvit}`});
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

exports.acceptInvitation = async(req, res) =>{
    try {
        let token = req.headers['authorization'];
        let tokenInvit = req.body.authorizationInvit;
        
        if(token != undefined && tokenInvit != undefined){
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

            const payloadInvit = await new Promise((resolve, reject) =>{
                jwt.verify(tokenInvit, process.env.JWT_KEY, (error, decoded) =>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(decoded);
                    }
                })
            })
            req.group = payloadInvit;
            //vérifier que le user qui est connecte est le user invite
            if(req.user.id == req.group.user_id){
                //recupe la liste des membres invités
                let groupM = await Group.findOne({_id: req.group.id});
                let membersInvitedTab = groupM.membresInvited;
                
                //vérifier que le user na pas déja accepter l invit
                let indexUser = -1;
                
                for(let i=0; i<membersInvitedTab.length; i++){
                    if(membersInvitedTab[i].id == req.user.id) indexUser = i;
                    
                }

                //si le user ne fais pas parti des membres invites donc il a deja accepter l invit
                if(indexUser === -1){
                    res.status(401).json({message: "Vous avez déja accepter l'invitation"})
                }else{
                    let membersTab = groupM.members_id;
                    membersTab.push(req.user.id);

                    //supprime de le user des membres qui ont été invite
                    for(let i=0; i<membersInvitedTab.length; i++){
                        if(membersInvitedTab[i].id == req.user.id) membersInvitedTab.splice(i, 1);
                    }

                    groupM.members_id = membersTab;
                    groupM.membersTab = membersInvitedTab;
                    
                    const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});
                    res.status(201).json({message: 'Vous venez de rejoindre le groupe '})
                }
            }else{
                res.status(401).json({message: 'Vous n avez pas été invité à joindre ce groupe '})
            }

        }else{
            if(token == undefined ) res.status(403).json({message: "Accès interdit: token de login maquant"});
            else res.status(403).json({message: "Accès interdit: token de l invitation manquant ou expiré"});
        } 
    } catch (error) {
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur (group inexistant)'});
    }
}

exports.refuseInvitation = async(req, res) =>{
    try {
        let token = req.headers['authorization'];
        let tokenInvit = req.body.authorizationInvit;
        
        if(token != undefined && tokenInvit != undefined){
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

            const payloadInvit = await new Promise((resolve, reject) =>{
                jwt.verify(tokenInvit, process.env.JWT_KEY, (error, decoded) =>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(decoded);
                    }
                })
            })
            req.group = payloadInvit;


            //vérifier que le user qui est connecte est le user invite
            if(req.user.id == req.group.user_id){

                //recupe la liste des membres invités
                let groupM = await Group.findOne({_id: req.group.id});
                let membersInvitedTab = groupM.membresInvited;
                
                let indexUser = -1;
                for(let i=0; i<membersInvitedTab.length; i++){
                    if(membersInvitedTab[i].id == req.user.id) indexUser = i;
                    
                }

                //si le user ne fais pas parti des membres invites donc il a deja accepter l invit
                if(indexUser === -1){
                    res.status(401).json({message: "Vous avez déja répondu à l'invitation"})
                }else{
                    //supprime de le user des membres qui ont été invite
                    for(let i=0; i<membersInvitedTab.length; i++){
                        if(membersInvitedTab[i].id == req.user.id) membersInvitedTab.splice(i, 1);
                    }

                    groupM.membersTab = membersInvitedTab;
                    
                    const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});
                    res.status(201).json({message: 'Vous venez refusé de rejoindre le groupe '})
                }
            }else{
                res.status(401).json({message: 'Vous n avez pas été invité à joindre ce groupe '})
            }

        }else{
            if(token == undefined ) res.status(403).json({message: "Accès interdit: token de login maquant"});
            else res.status(403).json({message: "Accès interdit: token de l invitation manquant ou expiré"});
        } 
    } catch (error) {
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur (group inexistant)'});
    }
}

exports.assignPerson = async(req, res) =>{
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

            //vérifier qu'il s agit bien de l admin
            if(req.group.admin_id == req.group.user_id){
                try {
                    let groupM = await Group.findOne({_id: req.group.id});

                    //vérifier qu'il y a minimum 2 membre dans le groupe
                    let members = groupM.members_id;
                    if(members < 2){
                        res.status(401).json({message: 'Il doit y avoir minimum deux membre dans le groupe pour faire un secret santa'});
                    }else{
                        //enlever de la liste des personnes invités celle qui ont dépasse le délais de reponse qui est 24h
                        let membersInvitedTab = groupM.membresInvited;
                        let expiration = 24 * 60 * 60 * 1000;

                        for(let i=0; i<membersInvitedTab.length; i++){
                            if(membersInvitedTab[i].createdAt >= expiration) membersInvitedTab.slice(i, 1);
                        }

                        //vérifier que tous les membres invite ont repondu
                        if(membersInvitedTab.length > 0) res.status(401).json({message: `Vous ne pouvez pas démarrer encore le secret santa, car il y a ${membersInvitedTab} qui n a/ont pas répondu encore à l invitation`});
                        else{
                            let tab = [];
                            for(let i=0; i < members.length; i++){
                                if(i+1 <members.length){
                                    tab.push({
                                        personneQuiOffre : members[i],
                                        personneAQuiOffrir : members[i+1]
                                    })
                                }else{
                                    tab.push({
                                        personneQuiOffre : members[i],
                                        personneAQuiOffrir : members[0]
                                    })
                                }
                            }

                            groupM.membersAssigned = tab;
                            const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});

                            res.status(201).json({message: 'Chaque membre à été assigné à un autre participant'})
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
        res.status(500);
            console.log(error);
            res.json({ message : 'Erreur serveur (group inexistant)'});
    }
}

exports.listAllMembersWithAssignement = async(req, res) =>{
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

            //si l utilisateur est un admin sinon pas d acces
            if(req.group.user_id == req.group.admin_id){
                try {
                    //récup la liste des membres avec leur assigniation
                    const groupM = await Group.findOne({_id: req.group.id});
                    membersAssignTab = groupM.membersAssigned;

                    let liste = "";

                    for(let i=0; i<membersAssignTab.length; i++){
                        let couple = membersAssignTab[i];

                        let user1 = await User.findOne({_id: couple.personneQuiOffre});
                        let user2 = await User.findOne({_id: couple.personneAQuiOffrir});

                        liste += `L'utilisateur ${user1.email} doit offrir au participant ${user2.email}. \n\n`
                    }

                    res.status(201).json(liste);

                } catch (error) {
                    res.status(500);
                        console.log(error);
                        res.json({ message : 'Erreur serveur'});
                }
            }else{
                res.status(403).json({message: "Accès interdit: Vous n'êtes pas l'admin par conséquant vous n avez pas accès à la liste."});
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