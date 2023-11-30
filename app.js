// Carregar módulos
    const express = require('express')
    const handlebars=require('express-handlebars')
    const bodyParser = require("body-parser");
    const app =express()
    const admin = require('./routes/admin')
    const path =require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    require('./models/Categoria')
    const Postagem = mongoose.model('postagens')
    const Categoria = mongoose.model('categorias')
    // Configuração de sessão
    app.use(session({
        secret:'cursodenode',
        resave:true,
        saveUninitialized:true
    }))
    app.use(flash())
    // Middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

//Configurações
    //Middleware para o Express entender os dados do formulário
    //Body Parser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main',
            runtimeOptions:{
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault:true
            },
        }))
        app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.connect("mongodb://localhost:27017/blogapp").then(()=>{
        console.log('Conectado ao MongoDB')
    }).catch((err)=>{
        console.log('Erro ao se conectar: ', err)
    })

    //public
    app.use(express.static(path.join(__dirname,'public')))
    
//Rotas
    app.use('/admin', admin)
    app.get("/", (req, res)=> {
        Postagem.find().populate('categoria').sort({data: "desc"}).lean().then((postagens)=>{
            res.render('index', {postagens: postagens})
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno!')
            res.redirect('/404')
        })
    })
    
    app.get("/postagem/:slug", (req,res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg','Essa postagem não existe')
                res.redirect('/')
            }
            }).catch((err)=>{
                req.flash('error_msg','Houve um erro interno!')
                res.redirect('/404')
        })
    })
    app.get('/categorias', (req, res)=>{
        Categoria.find().then((categorias)=>{
            res.render('categorias/index', {categorias: categorias})
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro interno!')
            res.redirect('/')
        })
    })
    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{

            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash('error_msg','Houve um erro interno!')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg','Categoria não encontrada')
                res.redirect('/')
            }

            }).catch((err)=>{
                req.flash('error_msg','Houve um erro interno!')
                res.redirect('/')
        })
    })
   
    app.get('/404', (req, res)=>{
        res.send('<h1>Página Não Encontrada</h1><p>Ops... A página que você está procurando não foi encontrada.</p>')
    })
    
//Outros
const PORT = 8081
app.listen(PORT, ()=>{
    console.log("Servidor rodado")
})