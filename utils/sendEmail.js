
const { google } = require("googleapis");
const nodeMailer = require("nodemailer");


const sendEmail = async(options)=>{

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET,process.env.REDIRECT_URI)
    oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})

    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodeMailer.createTransport({
        service:"gmail",
        auth:{
            type: 'OAuth2',
            user:process.env.SMPT_MAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from:"bantybabli04@gmail.com",
        to:options.email,
        subject:options.subject,
        text:options.message 
    }
    console.log("trying");
    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;