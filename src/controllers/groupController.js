const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/userModel');
const Group = require('../models/groupModel');

const jwtMiddleware = require('../middlewares/jwtMiddleware');



/*
    createAGroup :

    Fonction qui permet à un utilisateur de créer un group
        il faut être connecté a un compte user (token user)

    Elle prend en entrée : le nom du groupe ${name}

    Les vérifications : 
        - Existence du token de connection à un compte user


    Reponses: 
        201 : création du groupe. 
            la fonction retourne le nom du groupe ainsi que son id : ${name} , ${id}
        403 : Accès interdit : Token de connection au compte user manquant ou expiré
        500 : Erreur lors du traitement de donnée
*/
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

            /*
                Créer le groupe avec : 
                    le nom passé en paramètre
                    l admin_id qui correspond au user qui créer le groupe
                    un tableau qui contient les membres, qui contient un premier membre qui est l amdin
                    un tableau qui contient les membres qui ont reçu une invitation
                    un tableau qui contient chaque user et la personne à qui il a été assigné
            */
            try{    
                let newGroup = await new Group({
                    name: req.body.name,
                    admin_id: req.user.id,
                    members_id: [req.user.id],
                    membresInvited: [],
                    membersAssigned: []
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


/*
    connectToAGroup :

    Fonction qui permet à un utilisateur de se connecter à un groupe auquel il est deja membre ou admin
        il faut être connecté a un compte user (token user)

    Elle prend en entrée : le nom et l'id du groupe ${name} , ${id}

    Les vérifications : 
        - Existence du token de connection à un compte user
        - Vérifier que le groupe existe bien dans la bdd

    Reponses: 
        201 : Connection au groupe (générer un token de groupe avec l id du groupe, admin_id, id du user qui vient de se connecte). 
            la fonction retourne le token de connection : ${token}
        403 : Accès interdit : Token de connection au groupe manquant ou expiré
        404 : Le groupe recherché n'existe pas dans la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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
                //vérifier que le groupe existe dans la base de donnée
                const group = await Group.findOne({_id:req.body.id, name: req.body.name});
                if(!group){
                    res.status(404).json({message: "Groupe non trouvé"});
                    return;
                }else{
                    //si le groupe existe créer le token de connection au groupe
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



/*
    getAllUsersInGroup :

    Fonction qui permet à un user faisant parti d'un groupe de voir la liste des membres du groupe
        il faut être connecté au groupe(token groupe)

    Elle ne prend rien en entrée

    Les vérifications : 
        - Existence du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user fais partie du groupe sinon il n'a pas accès à la liste
    
    Reponses: 
        201 : Affichage de la liste des membres
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Utilisateur ne fait pas partie du groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});

            //Vérifier que le groupe n'a pas été supprimé
            if(groupM){

                //récup la liste des membres du groupe
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
                        res.status(201).json(tabMembers);

                    } catch (error) {
                        res.status(500);
                            console.log(error);
                            res.json({ message : 'Erreur serveur'});
                    }
                }else{
                    res.status(403).json({message: "Accès interdit: Vous ne faites pas partie de ce group."});
                }
            }else{
                res.status(404).json({message: "Groupe non trouvé"});
                    return;
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


/*  
    deleteGroup :

    Fonction qui permet à l'admin d'un groupe de supprimé le groupe
        il faut être connecté au groupe(token groupe)

    Elle ne prend rien en entrée

    Les vérifications :
        - Existence du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui essaye de delete est l admin du groupe 

    Reponses: 
        201 : Groupe supprimé
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / l'utilisateur n'est pas l'admin du groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});
            //vérifier que le groupe n'a pas déja été supprimé de la bdd
            if(groupM){
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
                res.status(404).json({message: "Groupe non trouvé"});
                    return;
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


/*  
    updateNameGroup :

    Fonction qui permet à l'admin d'un groupe de modifié le nom du groupe
        il faut être connecté au groupe(token groupe)

    Elle prend en entrée : le nouveau nom du groupe ${name}

    Les vérifications :
        - Existence du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui essaye d'update est l admin du groupe 

    Reponses: 
        201 : Groupe modifié : retourner le nouveau name ${name}
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / l'utilisateur n'est pas l'admin du groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});

            //vérifier l existance du groupe
            if(groupM){
                //vérifier le role du user
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
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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

/*
    inviteToGroup :

    Fonction qui permet à l'admin d'un groupe d'inviter un membre à joindre le groupe
        il faut être connecté au groupe(token groupe)

    Elle prend en entrée : l'email de l'utilisateur à inviter ${email}

    Les vérifications :
        - Existence du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui essaye d'update est l admin du groupe
        - Vérifier l'existance du user à inviter dans la base de donnée 
            - S'il n'existe pas : lui créer un compte + ajouter le user aux membres invités du groupe
                  créer le token d'invitation
            - S'il existe : 
                - Vérifier qu'il ne fait pas parti du groupe
                - Vérifier s'il a déja été invité
                    - Si il a été invité vérifié si le lien de l'inviation n'a pas expiré
                
        - Dans ce cas l'envoie de l'invit est fait si : 
            - User inexistant dans la BDD
            - User ne fait pas partie du groupe et n'a jamais reçu d'invit
            - User à reçu une invitation à joindre le groupe mais elle a expiré
        Le user invité est ajouté a la liste des membres invité du groupe

    Reponses: 
        201 : User invité : retourner l'email du user ${email}
        400 : User déja membre / User à déja reçu une invit qui n'a pas expiré
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / l'utilisateur n'est pas l'admin du groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});
            //vérifier l'existance du groupe
            if(groupM){
                //vérifier le role du user
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
                                    res.status(400).json({message: "L\'utilisateur est déja membre du groupe"})
                                }else{
                                    //si une invitation a été envoye
                                    if(id !== -1){
                                        //si l invitation na pas expire
                                        if(currentTime - membersInvitedTab[id].createdA < expirationTime){
                                            res.status(400).json({message: "L\'utilisateur a déja été invité."})
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
                res.status(404).json({message: "Groupe non trouvé"});
                return;
            }
        }else{
            res.status(403).json({message: "Accès interdit: token manquant"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Une erreur s\'est produite lors du traitement'});
    }
}


/*  
    acceptInvitation :

    Fonction qui permet à un user d'accepter l'invitation à joindre un groupe 
        il faut être connecté au compte user(token user)

    Elle prend en entrée : le token de l'invitation

    Les vérifications :
        - Existence du token de connection au compte user
        - Existance du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui veut joindre le groupe est celui qui a été invité
        - Vérifier que le user n'a pas déja accepter l'invit

        Dans ce cas la, le user est retiré de la liste des membres invité et est ajouté à la liste des membres

    Reponses: 
        201 : User ajouté au groupe
        401 : Accès refusé : Le user a déja répondu à l'invitation
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Token invitation manquant ou expiré /
                Le user n'a pas été invité à joindre le groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});
            //verifier l existance du groupe
            if(groupM){
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
                        res.status(401).json({message: "Accès refusé: Vous avez déja accepter l'invitation"})
                    }else{
                        //ajouter le user à la liste des membres
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
                    res.status(403).json({message: 'Accès interdit: Vous n avez pas été invité à joindre ce groupe '})
                }
            }else{
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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


/*  
    refuseInvitation :

    Fonction qui permet à un user de refuser l'invitation à joindre un groupe 
        il faut être connecté au compte user(token user)

    Elle prend en entrée : le token de l'invitation

    Les vérifications :
        - Existence du token de connection au compte user
        - Existance du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui veut joindre le groupe est celui qui a été invité
        - Vérifier que le user n'a pas déja refusé l'invit

        Dans ce cas la, le user est retiré de la liste des membres invité. 
            Suppresion de son compte s'il a été créer lors de l envoie de l'invitation

    Reponses: 
        201 : Le user à refusé de joindre le groupe
        401 : Accès refusé : Le user à déja répondu à l'invitation
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Token invitation manquant ou expiré /
                Le user n'a pas été invité à joindre le groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});
            if(groupM){
                if(req.user.id == req.group.user_id){

                    //recupe la liste des membres invités
                    let groupM = await Group.findOne({_id: req.group.id});
                    let membersInvitedTab = groupM.membresInvited;
                    
                    let indexUser = -1;
                    for(let i=0; i<membersInvitedTab.length; i++){
                        if(membersInvitedTab[i].id == req.user.id) indexUser = i;
                        
                    }
    
                    //si le user ne fais pas parti des membres invites donc il a deja refusé l invit
                    if(indexUser === -1){
                        res.status(401).json({message: "Accès refusé: Vous avez déja répondu à l'invitation"})
                    }else{
                        //supprime de le user des membres qui ont été invite
                        for(let i=0; i<membersInvitedTab.length; i++){
                            if(membersInvitedTab[i].id == req.user.id) membersInvitedTab.splice(i, 1);
                        }
    
                        groupM.membersTab = membersInvitedTab;
                        
                        const groupUpdate = await Group.findByIdAndUpdate(req.group.id, groupM, {new: true});

                        //supprimé le compte du user s'il a été créer au moment de l'envoie de l'invitation
                        const user = await User.findOne({_id: req.user.id});
                        if(!user.created){
                            const userD = await User.findByIdAndDelete(req.user.id, req.body, {new: true});
                        }

                        res.status(201).json({message: 'Vous venez refusé de rejoindre le groupe '})
                    }
                }else{
                    res.status(403).json({message: 'Accès interdit: Vous n avez pas été invité à joindre ce groupe '})
                }
            }else{
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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


/*  
    assignPerson :

    Fonction qui permet d'assigné un utilisateur à un autre membre du même groupe
        il faut être connecté au groupe (token groupe)

    Elle prend rien en entrée

    Les vérifications :
        - Existance du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui veut lancer le SantaSecret est l'admin du groupe
        - Vérifier qu'il y'a minimum deux membres
        - Vérifier que tous les users invité ont répondu
            - Il n'y a plus aucun membre dans la liste des membres invités
            - Les membres invités qui n'ont toujours pas répondu ont dépassé le délais de réponse => supprimé automatiquement

        L'algo SantaSecret ne commence que s'il y'a au minimum 2 membres et il n'ya personne dans la liste des memebres invités

    Reponses: 
        201 : Chaque memebre a été assigné à un autre
        401 : Accès refusé : moins de 2 membres / Il y'a des users qui n'ont pas encore répondu à l'invit
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Le user n'est pas l'admin
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});

            if(groupM){
                if(req.group.admin_id == req.group.user_id){
                    try {
                        let groupM = await Group.findOne({_id: req.group.id});
    
                        //vérifier qu'il y a minimum 2 membre dans le groupe
                        let members = groupM.members_id;
                        if(members < 2){
                            res.status(401).json({message: 'Accès refusé: Il doit y avoir minimum deux membre dans le groupe pour faire un secret santa'});
                        }else{
                            //enlever de la liste des personnes invités celle qui ont dépasse le délais de reponse qui est 24h
                            let membersInvitedTab = groupM.membresInvited;
                            let expiration = 24 * 60 * 60 * 1000;
    
                            for(let i=0; i<membersInvitedTab.length; i++){
                                if(membersInvitedTab[i].createdAt >= expiration) membersInvitedTab.slice(i, 1);
                            }
    
                            //vérifier que tous les membres invite ont repondu
                            if(membersInvitedTab.length > 0) res.status(401).json({message: `Accès refusé: Vous ne pouvez pas démarrer encore le secret santa, car il y a ${membersInvitedTab} qui n a/ont pas répondu encore à l invitation`});
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
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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



/*  
    listAllMembersWithAssignement :

    Fonction qui permet à l'admin d'un groupe de voir qui a été assigné à qui
        il faut être connecté au groupe (token groupe)

    Elle prend rien en entrée

    Les vérifications :
        - Existance du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user qui veut avoir la liste est l'admin du groupe

    Reponses: 
        201 : La liste des users et à qui ils ont été assignés
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Le user n'est pas l'admin
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
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

            const groupM = await Group.findOne({_id: req.group.id});

            if(groupM){
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
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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


/*  
    getUserAssigned :

    Fonction qui permet à un membre de groupe de voir qui lui a été assigné
        il faut être connecté au groupe (token groupe)

    Elle prend rien en entrée

    Les vérifications :
        - Existance du token de connection au groupe
        - Vérifier que le groupe existe toujours dans la bdd
        - Vérifier que le user fais partie des memebres du groupe

    Reponses: 
        201 : Le nom du membre qui a été assigné au user
        403 : Accès interdit : Token de connection au groupe manquant ou expiré / Le user ne fais pas partie du groupe
        404 : Le groupe recherché a été supprimé de la base de donnée
        500 : Erreur lors du traitement de donnée
*/
exports.getUserAssigned = async(req, res) =>{
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
            req.group = payloadInvit;

            const groupM = await Group.findOne({_id: req.group.id});

            if(groupM){
                //vérifier que le user est membre du groupe
                if(groupM.members_id.includes(req.group.user_id)){
                    try {
                        //récup la liste des utilisateurs assignés
                        membersAssignTab = groupM.membersAssigned;

                        let assigned;
                        
                        //recup l id qui a été assigné au user
                        for(let i=0; i<membersAssignTab.length; i++){
                            if(membersAssignTab[i].personneQuiOffre == req.user.id){
                                assigned = membersAssignTab[i].personneAQuiOffrir;
                            }
                        }
    
                        let user = await User.findOne({_id: assigned});
                        res.status(201).json({message: `Vous devez offir à ${user.email}`});
    
                    } catch (error) {
                        res.status(500);
                            console.log(error);
                            res.json({ message : 'Erreur serveur'});
                    }
                }else{
                    res.status(403).json({message: "Accès interdit: vous ne faites pas partie du groupe"});
                }
            }else{
                res.status(404).json({message: "Groupe non trouvé"});
                return;
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