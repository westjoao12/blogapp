const express= require('express')
const router =express.Router()
//BD
const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/',eAdmin, (req,res)=>{
    res.render('admin/index')
})

router.get('/posts',eAdmin, (req, res)=>{
    res.send('Página de Posts')
})

router.get('/categorias',eAdmin, (req, res)=>{
    Categoria.find().sort({data:"desc"}).lean().then((categorias)=>{
        console.log(categorias);
        res.render('admin/categorias', {categorias: categorias})
    }).catch((erro)=>{
        req.flash('error_msg','Houve um erro ao listar as categorias!')
        res.redirect('/admin')
    })
    
})

router.get('/categorias/add',eAdmin, (req, res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova',eAdmin, (req, res)=>{
    const erros = []

    //Validação do formulário
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug Inválido'})
    }

    if(req.body.slug.length < 2){
        erros.push({texto:'O Slug precisa ter mais que 1 caractere!'})
    }

    if(erros.length>0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria={
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg','Cadastro realizado com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((erro)=>{
            req.flash('error_msg','Erro ao cadastrar categoria')
            res.redirect('/admin/categorias')
            console.log('Erro ao cadastrar categoria:'+ erro)
        })
    }
})

router.get('/categorias/edit/:id',eAdmin,(req, res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria:categoria})
        }).catch((err)=>{
            req.flash('error_msg','Essa categoria não existe!')
            res.redirect('/admin/categorias')
        })
})

router.post('/categorias/edit',eAdmin, (req, res)=>{
    const erros =[]
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug Inválido'})
    }
    if(req.body.slug.length < 2){
        erros.push({texto:'O Slug precisa ter mais que 1 caractere!'})
    }
    if(erros.length > 0){
        res.render('admin/editcategorias',{erros: erros})
    } else{
        Categoria.findOneAndUpdate({_id : req.body.id},{$set:{
            nome:req.body.nome,
            slug:req.body.slug
            }}).then(() =>{
                req.flash('success_msg','Editado com Sucesso!')
                res.redirect('/admin/categorias')
                }).catch((err)=>{
                    req.flash('error_msg','Houve um Erro no Cadastro!')
                    res.redirect('/admin/categorias')
                })
    }
})

//ELIMINAR CATEGORIA:

//1 Metodo: Usando o GET
/*
router.get('/categorias/delete/:id', (req, res)=>{
    Categoria.deleteOne({_id:req.params.id}).then(()=>{
        req.flash('success_msg','Deletado com Sucesso!')
        res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg','Houve um Erro Interno!')
            res.redirect('/admin/categorias')
            })
})
*/

//2º Usando o POST
router.post('/categorias/deletar',eAdmin, (req, res)=>{
    Categoria.deleteOne({_id:req.body.id}).then(()=>{
        req.flash('success_msg','Deletado com Sucesso!')
        res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg','Houve um Erro Interno!')
            res.redirect('/admin/categorias')
            })
})

//=================== Inicio do Model Postagem
router.get('/postagens',eAdmin, (req, res)=>{
    Postagem.find().populate("categoria").sort({data:"desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
        }).catch((erro)=>{
            req.flash('error_msg','Erro ao listar as postagens!')
            console.log('erro ao listar postagens: '+ erro)
            res.redirect("/admin")
        })
})
router.get('/postagens/add',eAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens",{categorias: categorias})
        }).catch((erro)=>{
            req.flash('error_msg','Erro ao carregar os dados das categorias!')
            res.redirect("/admin")
        })

})

router.post('/postagens/nova',eAdmin, (req, res)=>{
    const erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
    {
        erros.push({texto: "Digite o titulo"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug ==null)
    {
        erros.push({texto: "Slug não pode ser vazio"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição não pode ser vazio"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "conteudo não pode ser vazio"})
    }
    if(req.body.categoria == 0){
        erros.push({texto: "Cadastre uma categoria, por favor!"})
    }

    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    }else{
        const CadPosts ={
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(CadPosts).save().then(()=>{
            req.flash('success_msg','Postagem Cadastrada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((error)=>{
            req.flash('error_msg', 'Houve um erro ao cadastrar: '+error)
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id',eAdmin, (req, res)=>{
    Postagem.findOne({_id : req.params.id}).populate('categoria').lean().then((postagem)=>{

            Categoria.find().lean().then((categorias)=>{
                res.render('admin/editpostagens', {postagem: postagem, categorias: categorias})
            }).catch((err)=>{
                req.flash("error_msg", "Erro interno ao carregar Categorias.")
                res.redirect("/admin/postagens")
            })
            
        }).catch((err)=>{
            req.flash('error_msg', 'Erro ao carregar as postagens!'+ err)
            res.redirect('/admin/postagens')
        })
})

router.post('/postagens/edit',eAdmin, (req, res)=>{
    let erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo não pode ser vazio"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug não pode ser vazio"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição não pode ser vazia."})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo ==null){
        erros.push({texto: "Conteúdo da postagem é obrigatório!"})
    }
    if(req.body.categoria == 0){
        erros.push({texto: "Cadastre uma categoria, por favor!"})
    }
    if(erros.length > 0){
        res.render('admin/editpostagens', {erros: erros})
    }else{
        Postagem.findOneAndUpdate({_id: req.body.id}, {$set:{
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
            }}).then(()=>{
                req.flash("success_msg","Postagem editada com sucesso!")
                res.redirect('/admin/postagens')
            }).catch((err)=>{
                    req.flash("error_msg", "Erro interno no servidor!")
                    res.redirect('/admin/postagens')
            })
    }

})

router.get('/postagens/delete/:id',eAdmin, (req, res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Registro deletado com sucesso!")
        res.redirect('/admin/postagens')
    }).catch((erro)=>{
        req.flash("error_msg", "Erro ao deletar o registro.")
        res.redirect("/admin/postagens")
    })
})

module.exports=router