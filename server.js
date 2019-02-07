const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');


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
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
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

let viewParams = {
    title: "",
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


app.route('/login')
    .get((req, res) => {
        let title = "Log in";



        res.render('login', params({title: title}));
    })
    .post((req, res) => {
       
        req.session.user = {email: "test@test.com", token: "12345678"};

        //res.render('login', {action: "post"});
        res.redirect('/userpage');
    });

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


app.route('/userpage')
    .get(auth, (req, res) => {

        res.render('userpage', {action: req.session.user.email});
    })
    .post((req, res) => {
        res.render('userpage', {action: "post"});
    });


app.get('/follow', (req, res) => {
    res.render('follow', {});
    });
    


app.listen(3000, function () {
    console.log('Server listening on port 3000')
    })
