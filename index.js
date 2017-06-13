var express = require('express');
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var ejs = require('ejs');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
 // parse application/json 
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var zodiacSign = {
    example: {
        'cheese': 'cheese'
    }
}

// ---------------------------------

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('pages/index.ejs');
});


// hitting this route will invoker the sendEmailTemplate function with the given payload
app.post('/sendEmail', function(req, res, next) {

    // The given information (expect this to be a api or query from database)
    var cilentInfo = {
        "member": {
                "email": req.body.email,
                "name": req.body.toWho
        },

        "user": {
            "name": req.body.name,
            "message": req.body.message,
            "email": req.body.sendEmail
        }
    }

    sendEmailTemplate(cilentInfo, function(err) {
        if(err) {
            console.log(err);
            res.redirect('/');
        } 
    });
    res.redirect('/thankyouPage')
});

app.get('/thankyouPage', function(req, res, next) {
    res.render('pages/thankYou.ejs');
})


// The sendEmailTemplate function is use for sending Email base on the given payload
function sendEmailTemplate(informationOfMember, callback) {
    
    // if payload not given function will exit
    if(!informationOfMember) {
        return;
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'prompttesting@gmail.com',
            pass: 'testing111'
        }
    });

    // given the varaible member to shorten object informationOfMember
    var member = informationOfMember.member
    // given the varaible restaurant to shorten object informationOfMember
    var user = informationOfMember.user
        // The ejs (data) to send to email 
        ejs.renderFile('./views/pages/emailTemplate.ejs',
            {
            user: member.name,
            title: 'Happy Birthday', 
            backgroundImage: 'https://onehdwallpaper.com/wp-content/uploads/2014/10/Colorful-Happy-Birthday-Hd-Wallpaper.jpg',
            toWho: user.name,
            message: user.message,
            team: member.team
            }, 
            // callback (making sure the ejs finish rendering the info and then send down as data)
            function(err, data) {
                if(err) {
                    console.log('couldnt send because of Error ' + err);
                } else {
                    // final set up of email data before sending out
                    let email = '<'+user.email+'>';
                    let name = user.name + "  👻";
                    let mailOptions = { 
                        from: "'" + name + email + "'", // sender address
                        to: member.email, // list of receivers
                        subject: 'Happy Birthday!!', // Subject line
                        html: data // html body
                    };

                    // sending out the email
                    transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });
            }
        })
    }



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


