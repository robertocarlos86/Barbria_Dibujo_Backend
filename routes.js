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
    secure: process.env.NODE_ENV || config.NODE_ENV == "production" ? true : false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(cookieParser());

var sess;

// create
app.post("/registro", cors(), async (request, response) => {	
    const user = new userModel(request.body);	
    try {
      await user.save();
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
});

// auth
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

// logout
app.post("/logout", cors(), async (request, response) => {	
    request.session.destroy();
	sess = null;
	response.json({msg: 'Session Closed Successfully.'});
});

const ACLpages = (rolID, request) => {
	const endpoint = request.path;
    const methodHTTP = request.method.toUpperCase();
	if (rolID === "usuario") {
    if (endpoint.includes("servicios") && methodHTTP == "GET") {  
		return true;
	}
	if (endpoint.includes("reservas") && methodHTTP == "POST" || methodHTTP == "GET" || methodHTTP == "PUT" || methodHTTP == "DELETE") {  
		return true;
	}
	if (endpoint.includes("comentarios") && methodHTTP == "POST" || methodHTTP == "GET" || methodHTTP == "PUT" || methodHTTP == "DELETE") {  
		return true;
	}
	}
	if (rolID === "interno") {
	if (endpoint.includes("empleados") && methodHTTP == "POST" || methodHTTP == "GET" || methodHTTP == "PUT" || methodHTTP == "DELETE") {  
		return true;
	}
	if (endpoint.includes("servicios") && methodHTTP == "POST" || methodHTTP == "GET" || methodHTTP == "PUT" || methodHTTP == "DELETE") {  
		return true;
	}
	if (endpoint.includes("reservas") && methodHTTP == "POST" || methodHTTP == "GET" || methodHTTP == "PUT" || methodHTTP == "DELETE") {  
		return true;
	}
	}
	if (rolID === "admin") {
		return true;
	}
	return false;
};

var middlewareMain = function (request, response, next) {
  const token = request.headers['access-token'];  
  if (token) {
      jwt.verify(token, app.get('secretKey'), (err, decoded) => {      
        if (err) {
          return response.json({ msg: 'Token Invalid.' });    
        } else {			
  if (sess != null) {  
	  if (ACLpages(sess.role, request)) {   
		request.decoded = decoded;    
		next();
	  } else { 
		return response.json({ msg: 'You do not have permission to access this page.' }); 	  
	  }
  } else { 
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

// ----------------------------------------------------------------------------
// Collection: Comentarios

// create
app.post("/comentarios", cors(), async (request, response) => {	
    const comentario = new comentarioModel(request.body);	
    try {
      await comentario.save();
      response.send(comentario);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read all
app.get("/comentarios", cors(), async (request, response) => {
    const comentarios = await comentarioModel.find({}).populate('usuario').populate('empleado');  
    try {
      response.send(comentarios);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read one
app.get("/comentarios/:id", cors(), async (request, response) => {
    const comentario = await comentarioModel.findOne({_id: request.params.id}).populate('usuario').populate('empleado');  
    try {
      response.send(comentario);
    } catch (error) {
      response.status(500).send(error);
    }
});

// update
app.put("/comentarios/:id", cors(), async (request, response) => {
    await comentarioModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const comentario = await comentarioModel.findOne({_id: request.params.id});  	
    try {
      response.send(comentario);
    } catch (error) {
      response.status(500).send(error);
    }
});

// delete
app.delete("/comentarios/:id", cors(), async (request, response) => {
    await comentarioModel.findOneAndDelete({_id: request.params.id});  	
	const comentario = await comentarioModel.find({});	
    try {
      response.send(comentario);
    } catch (error) {
      response.status(500).send(error);
    }
});

// ----------------------------------------------------------------------------
// Collection: Empleados

// create
app.post("/empleados", cors(), async (request, response) => {	
    const empleado = new empleadoModel(request.body);	
    try {
      await empleado.save();
      response.send(empleado);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read all
app.get("/empleados", cors(), async (request, response) => {
    const empleados = await empleadoModel.find({}).populate('servicios');  
    try {
      response.send(empleados);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read one
app.get("/empleados/:id", cors(), async (request, response) => {
    const empleado = await empleadoModel.findOne({_id: request.params.id}).populate('servicios');  
    try {
      response.send(empleado);
    } catch (error) {
      response.status(500).send(error);
    }
});

// update
app.put("/empleados/:id", cors(), async (request, response) => {
    await empleadoModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const empleado = await empleadoModel.findOne({_id: request.params.id});  	
    try {
      response.send(empleado);
    } catch (error) {
      response.status(500).send(error);
    }
});

// delete
app.delete("/empleados/:id", cors(), async (request, response) => {
    await empleadoModel.findOneAndDelete({_id: request.params.id});  	
	const empleado = await empleadoModel.find({});	
    try {
      response.send(empleado);
    } catch (error) {
      response.status(500).send(error);
    }
});

// ----------------------------------------------------------------------------
// Collection: Reservas

// create
app.post("/reservas", cors(), async (request, response) => {	
    const reserva = new reservaModel(request.body);	
    try {
      await reserva.save();
      response.send(reserva);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read all
app.get("/reservas", cors(), async (request, response) => {
    const reservas = await reservaModel.find({}).populate('usuario').populate('empleado');  
    try {
      response.send(reservas);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read one
app.get("/reservas/:id", cors(), async (request, response) => {
    const reserva = await reservaModel.findOne({_id: request.params.id}).populate('usuario').populate('empleado');  
    try {
      response.send(reserva);
    } catch (error) {
      response.status(500).send(error);
    }
});

// update
app.put("/reservas/:id", cors(), async (request, response) => {
    await reservaModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const reserva = await reservaModel.findOne({_id: request.params.id});  	
    try {
      response.send(reserva);
    } catch (error) {
      response.status(500).send(error);
    }
});

// delete
app.delete("/reservas/:id", cors(), async (request, response) => {
    await reservaModel.findOneAndDelete({_id: request.params.id});  	
	const reserva = await reservaModel.find({});	
    try {
      response.send(reserva);
    } catch (error) {
      response.status(500).send(error);
    }
});

// ----------------------------------------------------------------------------
// Collection: Servicios

app.post("/servicios", cors(), async (request, response) => {	
    const servicio = new servicioModel(request.body);	
    try {
      await servicio.save();
      response.send(servicio);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read all
app.get("/servicios", cors(), async (request, response) => {
    const servicios = await servicioModel.find({});  
    try {
      response.send(servicios);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read one
app.get("/servicios/:id", cors(), async (request, response) => {
    const servicio = await servicioModel.findOne({_id: request.params.id});  
    try {
      response.send(servicio);
    } catch (error) {
      response.status(500).send(error);
    }
});

// update
app.put("/servicios/:id", cors(), async (request, response) => {
    await servicioModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const servicio = await servicioModel.findOne({_id: request.params.id});  	
    try {
      response.send(servicio);
    } catch (error) {
      response.status(500).send(error);
    }
});

// delete
app.delete("/servicios/:id", cors(), async (request, response) => {
    await servicioModel.findOneAndDelete({_id: request.params.id});  	
	const servicio = await servicioModel.find({});	
    try {
      response.send(servicio);
    } catch (error) {
      response.status(500).send(error);
    }
});

// ----------------------------------------------------------------------------
// Collection: Usuarios

// read all
app.get("/users", cors(), async (request, response) => {	
    const users = await userModel.find({});  
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

// read one
app.get("/users/:id", cors(), async (request, response) => {
    const user = await userModel.findOne({_id: request.params.id});  
    try {
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
});

// update
app.put("/users/:id", cors(), async (request, response) => {
    await userModel.findOneAndUpdate({_id: request.params.id}, request.body);  	
	const user = await userModel.findOne({_id: request.params.id});  	
    try {
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
});

// delete
app.delete("/users/:id", cors(), async (request, response) => {
    await userModel.findOneAndDelete({_id: request.params.id});  	
	const user = await userModel.find({});	
    try {
      response.send(user);
    } catch (error) {
      response.status(500).send(error);
    }
});

module.exports = app;