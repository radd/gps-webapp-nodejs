const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
var request = require('request');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(cookieParser());

var day = 1000*60*60*24;
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + day),
        maxAge: day
    }
}));

app.use((req, res, next) => {
    // remove session cookie if session do not exist
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }

    // intercept any request and save session data to get it in views
    let _render = res.render;
    res.render = function( view, options, fn ) {

        options = Object.assign(options, {
            user: {
                isLoggedIn: !!req.session.user,
                email: req.session.user ? req.session.user.email : "",
                token: req.session.user ? req.session.user.token : ""
            }
        });
        _render.call( this, view, options, fn );
    }

    next();
});

let auth = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/login');
    }
};

let nonAuth = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
    } else {
        next();
    }
};

let viewParams = {
    title: ""
};

let params = (p) => {
    return Object.assign(viewParams, p);
}


app.route('/')
    .get((req, res) => {
        let title = "Real time GPS tracking";
        //console.log(req.session);
        //console.log(req.cookies);
        

        res.render('index', params({title: title}));
    })
    .post((req, res) => {
        res.render('index', {action: "post"});
    });


app.route('/signup')
    .get(nonAuth, (req, res) => {
        let title = "Rejestracja";
        let form = {add:false, errorMsg: "", email:"", username:""}

        res.render('signup', params({title: title, form: form}));
    })
    .post(nonAuth, (req, res) => {
        let title = "Rejestracja";
        let form = {add:false, errorMsg: "", email: req.body.email, username: req.body.username}

        var options = {
            uri: 'http://localhost:8080/api/auth/sign-up',
            method: 'POST',
            json: {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                password2: req.body.password2,
            }
          };

        request(options, function (error, response, body) {
            console.log(body);
            
            if (!error && response.statusCode == 201) {
                form.add = true;
                res.render('signup', params({title: title, form: form}));
            }
            else {
                form.errorMsg = body.message;
                res.render('signup', params({title: title, form: form}));
            }
        });

        
    });

app.route('/login')
    .get(nonAuth, (req, res) => {
        let title = "Logowanie";
        let form = {errorMsg: "", email:""}

        res.render('login', params({title: title, form: form}));
    })
    .post(nonAuth, (req, res) => {
        let title = "Logowanie";
        let form = {errorMsg: "", email: req.body.email}

        var options = {
            uri: 'http://localhost:8080/api/auth/sign-in',
            method: 'POST',
            json: {
                email: req.body.email,
                password: req.body.password
            }
          };

        request(options, function (error, response, body) {
            console.log(body);
            
            if (!error && response.statusCode == 200) {
                console.log("redir");
                req.session.user = {email: form.email, token: body.data.accessToken};
                req.session.save(() => {
                    res.redirect('/userpage');
                });
                
            }
            else {
                form.errorMsg = "Niepoprawny email lub hasło";
                res.render('login', params({title: title, form: form}));
            }
        });
    });

app.route('/logout')
    .get(auth, (req, res) => {
        res.clearCookie('user_sid');
        res.redirect('/');
});


app.route('/userpage')
    .get(auth, (req, res) => {
        let title = "Userpage";
        res.render('userpage', {title: title});
    });


app.get('/follow', (req, res) => {
    res.render('follow', {});
    });
    


app.listen(3000, function () {
    console.log('Server listening on port 3000')
    })
