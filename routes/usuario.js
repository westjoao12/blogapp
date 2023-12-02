const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')

router.get('/registro', (req, res)=>{
    res.render('usuarios/registro')
})
router.post('registro', (req, res)=>{
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
                res.redirect('/registro')
            }else{}
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno!')
            res.redirect('/')
        })
    }


})

module.exports= router
