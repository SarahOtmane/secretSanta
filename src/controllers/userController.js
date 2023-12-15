const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/userModel');

const jwtMiddleware = require('../middlewares/jwtMiddleware');

/*
    userRegister :

    Fonction qui permet à une personne de créer un compte user

    Elle prend en entrée : Un email et un mot de passe ${email} , ${password}

    Les vérifications : 
        - L'email entré correspond au format d'email


    Reponses: 
        201 : création du compte user. 
            la fonction retourne l'email du user: ${email} 
        400 : Bad request : le format de l'email n'est pas respécté
        500 : Erreur lors du traitement de donnée
*/
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
            res.status(400).json({message: 'Le format de l\'email n\'a pas été respecté'});
        }
    } catch(error){
        res.status(500).json({message: 'Erreur lors du traitement des données'});
    }
}


/*
    loginRegister :

    Fonction qui permet à une personne de se connecter à son compte user

    Elle prend en entrée : Un email et un mot de passe ${email} , ${password}

    Les vérifications : 
        - Vérifier que l'utilisateur existe dans la base de donnée
        - Vérifier que le mot de passe fournis est le bon


    Reponses: 
        201 : Connection au compte user. 
            la fonction retourne le token user: ${token} 
        401 : Accès refusé : Mot de passe incorrect
        404 : Utilisateur non trouvé
        500 : Erreur lors du traitement de donnée
*/
exports.loginRegister = async(req, res) =>{
    try {
        const user = await User.findOne({email: req.body.email});

        if(!user){
            res.status(404).json({message: "utilisateur non trouvé"});
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



/*
    userModify :

    Fonction qui permet à un user de modifier son mot de passe
        il faut être connecté a un compte user (token user)

    Elle prend en entrée : Un mot de passe ${password}

    Les vérifications : 
        - Existence du token de connection à un compte user
        - Vérifier que l'utilisateur existe dans la base de donnée


    Reponses: 
        201 : Mot de passe modifié
        403 : Accès interdit : token manquant ou expiré
        404 : Utilisateur non trouvé
        500 : Erreur lors du traitement de donnée
*/
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

            const user = await User.findOne({_id: req.user.id});
            //verifier l existance du user dans la bdd
            if(user){
                try{
                    //hachage du password
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
                res.status(404).json({message: "Utilisateur non trouvé"});
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
    deleteUser :

    Fonction qui permet à un user de supprié son compte
        il faut être connecté a un compte user (token user)

    Elle prend rien en entrée

    Les vérifications : 
        - Existence du token de connection à un compte user
        - Vérifier que l'utilisateur existe dans la base de donnée


    Reponses: 
        201 : Compte supprimé
        403 : Accès interdit : token manquant ou expiré
        404 : Utilisateur non trouvé
        500 : Erreur lors du traitement de donnée
*/
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

            const user = await User.findOne({_id: req.user.id});

            if(user){
                try{
                    const user = await User.findByIdAndDelete(req.user.id, req.body, {new: true});
                    res.status(201);
                    res.json({ message : 'Supprimé'});
                }
                catch(error){
                    res.status(500);
                        console.log(error);
                        res.json({ message : 'Erreur serveur'});
                }
            }else{
                res.status(404).json({message: "Utilisateur non trouvé"});
                    return;
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