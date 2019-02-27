const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const path = require ('path');

const IP = "40.115.21.196"; // local
//const IP = "192.168.1.41";
//const IP = "localhost"; // on server

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(cookieParser());

let day = 1000*60*60*24;
let isAutoLogin = true;

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
    if ((!req.cookies.user_sid || !req.session.user) && isAutoLogin) {
        //res.clearCookie('user_sid'); 
        autoLogin(req, afterLogin);
    }
    else {
        afterLogin();
    }

    function afterLogin() {
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
    }

});

let autoLogin = (req, callback) => {
    var options = {
        uri: 'http://'+IP+':8080/api/auth/sign-in',
        method: 'POST',
        json: {
            email: "test1@test.com",
            password: "test"
        }
      };
      
    request(options, function (error, response, body) {
        //console.log(body);
        
        if (!error && response.statusCode == 200) {
            req.session.user = {email: options.json.email, token: body.data.accessToken};
            req.session.save(() => {
                callback();
            });
            console.log("AutoLogin successed");
        }
        else {
            console.log("AutoLogin failed");
            callback();
        }
    });
}

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
        

        res.render('./index', params({title: title}));
    })
    .post((req, res) => {
        res.render('./index', {action: "post"});
    });


app.route('/signup')
    .get(nonAuth, (req, res) => {
        let title = "Rejestracja";
        let form = {add:false, errorMsg: "", email:"", username:""}

        res.render('./signup', params({title: title, form: form}));
    })
    .post(nonAuth, (req, res) => {
        let title = "Rejestracja";
        let form = {add:false, errorMsg: "", email: req.body.email, username: req.body.username}

        var options = {
            uri: 'http://'+IP+':8080/api/auth/sign-up',
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
            }
            else if(!error) {
                form.errorMsg = body.message ? body.message : "Błąd";
            }
            else {
                form.errorMsg = "Błąd: " + error;
            }
            res.render('./signup', params({title: title, form: form}));
        });

        
    });

app.route('/login')
    .get(nonAuth, (req, res) => {
        let title = "Logowanie";
        let form = {errorMsg: "", email:""}

        res.render('./login', params({title: title, form: form}));
    })
    .post(nonAuth, (req, res) => {
        let title = "Logowanie";
        let form = {errorMsg: "", email: req.body.email}

        var options = {
            uri: 'http://'+IP+':8080/api/auth/sign-in',
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
            else if (!error) {
                form.errorMsg = "Niepoprawny email lub hasło";
                res.render('./login', params({title: title, form: form}));
            }
            else {
                form.errorMsg = "Błąd: " + error;
                res.render('./login', params({title: title, form: form}));
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
        res.render('./userpage', {title: title});
    });

    
app.route('/map')
    .get(auth, (req, res) => {
        let title = "GPS tracking";
        res.render('./map', {title: title});
    });

app.route('/map/user/:userID')
    .get(auth, (req, res) => {
        let title = "GPS tracking";
        res.render('./userMap', {title: title, userID: req.params.userID});
    });

app.route('/map/user/:userID/tracks')
    .get(auth, (req, res) => {
        let title = "GPS tracking";
        res.render('./userTracksMap', {title: title, userID: req.params.userID});
    });

app.route('/map/track/:trackID')
    .get(auth, (req, res) => {
        let title = "GPS tracking";
        res.render('./trackMap', {title: title, trackID: req.params.trackID});
    });
app.listen(3000, function () {
    console.log('Server listening on port 3000')
    })
