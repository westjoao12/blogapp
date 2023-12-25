module.exports ={
    eAdmin: function(req, res, next){
        if (req.isAuthenticated() && req.user.eAdmin == 1)return next();
        //console.log('Requisitante não é administrador');
        req.flash("error_msg", "Acesso negado!");
        res.redirect("/");
        },
    loggedIn: function(req,res,next){
        if(req.isAuthenticated()) return next();
        req.flash("error_msg","Por favor faça o login para acessar esta página.");
        res.redirect('/users/login')
        } ,
    checkNotLoggedIn: function(req,res,next){
        if(!req.isAuthenticated()) return next();
        req.flash("error_msg", "Você já está logado!")
        res.redirect('/');
        }
}