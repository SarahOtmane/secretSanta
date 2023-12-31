const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = async(req, res, next) =>{
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
            next();
        }else{
            res.status(403).json({message: "Accès interdit: token manquant"});
        }
    } catch (error) {
        console.log(error);
        res.status(403).json({message: "Accès interdit: token invalide"});
    }
}

exports.verifyEmail = (email) =>{
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}


exports.genererMotDePasse = () =>{
    var caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    var motDePasse = "";
  
    for (var i = 0; i < 10; i++) {
      var index = Math.floor(Math.random() * caracteres.length);
      motDePasse += caracteres.charAt(index);
    }
  
    return motDePasse;
  }