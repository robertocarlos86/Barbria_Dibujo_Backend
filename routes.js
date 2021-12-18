const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const comentarioModel = require("./schemas/ComentarioSchema");
const empleadoModel = require("./schemas/EmpleadoSchema");
const reservaModel = require("./schemas/ReservaSchema");
const servicioModel = require("./schemas/ServicioSchema");
const userModel = require("./schemas/UsuarioSchema");
var cors = require('cors');

const config = require('./config/config');
const app = express();
app.use(cors())

const cookieParser = require("cookie-parser");
const sessions = require("express-session");
var crypto = require('crypto');

app.set('secretKey', process.env.SECRET || config.seed);

app.use(sessions({
  secret: crypto.randomBytes(64).toString('hex'),
  saveUninitialized: true,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV || config.NODE_ENV == "production" ? true : false ,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(cookieParser());

var sess;

app.post("/registro", cors(), async (request, response) => {	
    const user = new userModel(request.body);	
    try {
      await user.save();
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/login", cors(), async (request, response) => {
	sess = request.session;
    const { email, passwd } = request.body;
	const payload = {
		check:  true
    };
	const token = jwt.sign(payload, app.get('secretKey'), {
		expiresIn: config.expire
	});
    userModel.findOne({email:email},(err,user)=>{
        if(user){
           if(passwd === user.passwd){			   
			   sess.role = user.rolID;
			   sess.save();		
			   response.json({msg: 'Login Sucess',token: token});			   
           } else {
			   response.json({msg: 'Wrong Credentials.'});
           }
        } else {
			response.json({msg: 'This Email Does Not Exist.'});
        }
    })
});

app.post("/logout", cors(), async (request, response) => {	
    request.session.destroy();
	sess = null;
	response.json({msg: 'Session Closed Successfully.'});
});

var middlewareMain = function (request, response, next) {
  const token = request.headers['access-token']; 
  const endpoint = request.path;
   console.log(endpoint);  
  if (token) {
      jwt.verify(token, app.get('secretKey'), (err, decoded) => {      
        if (err) {
          return response.json({ msg: 'Token Invalid.' });    
        } else {			
			if (sess != null) {  
  if (sess.role === "usuario") {
	console.log("Tiene permiso");  
	request.decoded = decoded;    
    next();
  } else {
	console.log("No Tiene permiso"); 
	return response.json({ msg: 'You do not have permission to access this page.' }); 	  
  }
  } else {
	console.log("Por favor logearse"); 
	return response.json({ msg: 'Please Login.' }); 	
  }     
        }
      });
  } else {
      response.send({ 
          msg: 'Token Invalid.' 
      });
  }
};

// middleware main
app.use(middlewareMain);

app.get("/users", cors(), async (request, response) => {	
    const users = await userModel.find({});  
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});
  
app.get("/users/:id", cors(), async (request, response) => {
    const users = await userModel.findOne({_id: request.params.id});  
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.put("/users/:id", cors(), async (request, response) => {
    await userModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const users = await userModel.findOne({_id: request.params.id});  	
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.delete("/users/:id", cors(), async (request, response) => {
    await userModel.findOneAndDelete({_id: request.params.id});  	
	const users = await userModel.find({});	
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/empleados", cors(), async (request, response) => {	
    const empleado = new empleadoModel(request.body);	
    try {
      await empleado.save();
      response.send(empleado);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.get("/empleados", cors(), async (request, response) => {
    const empleados = await empleadoModel.find({}).populate('servicios');  
    try {
      response.send(empleados);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.get("/empleados/:id", cors(), async (request, response) => {
    const empleados = await empleadoModel.findOne({_id: request.params.id}).populate('servicios');  
    try {
      response.send(empleados);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.put("/empleados/:id", cors(), async (request, response) => {
    await empleadoModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const empleados = await empleadoModel.findOne({_id: request.params.id});  	
    try {
      response.send(empleados);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.delete("/empleados/:id", cors(), async (request, response) => {
    await empleadoModel.findOneAndDelete({_id: request.params.id});  	
	const empleados = await empleadoModel.find({});	
    try {
      response.send(empleados);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/servicios", cors(), async (request, response) => {	
    const servicio = new servicioModel(request.body);	
    try {
      await servicio.save();
      response.send(servicio);
    } catch (error) {
      response.status(500).send(error);
    }
});

module.exports = app;