const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

// User Model
require("../models/Usuario")
var Usuario = mongoose.model('usuarios');
module.exports = function (passport) {
    // Local Strategy
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuario.findOne({ email: email }).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message:'Este usuário não existe'})
            }
            // Verificar se a senha está correta
            bcrypt.compare(senha, usuario.senha, (erro, isMatch)=>{
                if(erro) throw erro;
                if(!isMatch)
                    return done(null, false,{ message: "Senha incorreta" })
                return done(null, usuario);
            })
        })
    }))
    // Serializar o usuário
    passport.serializeUser((user, done)=>done(null, user.id));
    // Deserializar o usuário
    passport.deserializeUser((id, done)=>{
        Usuario.findById(id).then((user)=>{
            done(null, user);
        }).catch((err)=>{
            done(err, null);
        })
    })
}