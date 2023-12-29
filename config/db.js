if(process.env.NODE_ENV == "production"){
    module.exports= {mongoURI: "mongodb://testwest:123456@ds247587.mlab.com:47587/blogapp-prod"}
}
else{
    module.exports ={mongoURI: "mongodb://localhost:27017/blogapp"}
}