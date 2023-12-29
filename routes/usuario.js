const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require("passport")

router.get('/registro', (req, res)=>{
    res.render('usuarios/registro')
})
router.post('/registro', (req, res)=>{
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha inválido'})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'A senha precisa ter no mínimo 5 letras'})
    }
    if(req.body.senha != req.body.senha2) {
        erros.push({texto:'As senhas não conferem'})
    }
    if(erros.length >0 ){
        res.render("usuarios/registro",{erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg','Este email já está cadastrado!')
                res.redirect('/usuarios/registro')
            }else{
                const novousuario = new Usuario ({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10,(err,salt)=> {
                    bcrypt.hash(novousuario.senha, salt , (err, hash)=>{
                        if(err){
                            req.flash('error_msg','Erro ao criar o usuário!')
                            return res.redirect('/')
                        }
                        novousuario.senha = hash
                        novousuario.save().then(()=>{
                            req.flash('success_msg','Cadastro realizado com sucesso!')
                            res.redirect('/')
                        }).catch((err)=>{
                            console.log(err)
                            req.flash('error_msg','Erro interno do servidor!')
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno!')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res)=>{
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) =>{
    passport.authenticate("local", {
        successRedirect:"/",
        failureRedirect:"/usuarios/login",
        failureFlash:true
    })(req, res, next)
});

router.get('/logout', (req, res)=>{
    /*req.logout((err)=>{
        if(err)return next(err);
    req.flash('success_msg','Deslogado com Sucesso!')
    res.redirect("/")
    });*/
    req.logOut();
    req.flash('success_msg','Deslogado com Sucesso!')
    res.redirect("/")
})

/*
router.post('/login',(req, res, next) =>{
    //isso é para validar os dados de entrada
    //console.log(req.body);
    //return;
    //aqui vamos usar a função require da lib bcryptjs que iremos instalar no próximo passo
    //para comparar as senhas
    //req.body.senha é a senha digitada pelo user e password é a nossa coluna na tabela users~
    //comparando se elas são iguais
    //se sim, logamos ele no sistema
    //se não mostramos uma mensagem de erro
    const password = req.body.senha;
    const email = req.body.email;
    Usuario.findOne({email:email}).then((user)=>{
        if(!user) {
            req.flash('error_msg','Usuário não encontrado!');
            return res.redirect('/usuarios/login');
            }
            bcrypt.compare(password, user.senha).then((result)=>{
                if (!result) {
                    req.flash('error_msg','Senha incorreta!');
                    return res.redirect('/usuarios/login');
                }
                req.session.userId= user._id;//guarda o id do usuario logado em uma sessão
                req.flash("success_msg", "Logado com Sucesso!");
                res.redirect("/");
            }).catch((err)=> {
                return next(err);
            });
        }, (erro)=> {
            req.flash('error_msg', 'Houve um erro ao logar!');
            return res.redirect('/usuarios/login');
    })
});
*/

module.exports= router
