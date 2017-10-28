class PoEMail {
    constructor(sendgridKey, email) {
        this.sendgridKey = sendgridKey;
        this.sourceEmail = email;

        this.sendgrid  = require('sendgrid')(sendgridKey);
        this.baseURL = process.env.baseURL;
        if (process.env.NODE_ENV === 'dev'){
          this.baseURL = 'localhost:' + String(process.env.PORT);
        }
    }

    sendMailTo(targetEmail, sourceEmail, subject, body, callback){
        var emailObject = new this.sendgrid.Email({
            to: targetEmail,
            from: sourceEmail,
            subject: subject,
            html: body
        });

        this.sendgrid.send(emailObject, callback);
    }

    sendRegistrationEmail(targetEmail, userId, callback){
        var sourceEmail = "Poe Sales Bot <" + this.sourceEmail + ">";
        var subject = "PoESales Validation Email";
        var body = '<h3>Click the link bellow to confirm your registration:</h3><br><a href="http://' +  this.baseURL + '/emails/validateemail/' + userId + '">' + this.baseURL + '/emails/validateemail/'+ userId + "</a>";

        this.sendMailTo(targetEmail, sourceEmail, subject, body, callback);
    }

    sendUnregisterEmail(targetEmail, userId, callback){
        var sourceEmail = "Poe Sales Bot <" + this.sourceEmail + ">";
        var subject = "PoESales Removal Email";
        var body = '<h3>Click the link bellow to confirm your unregistration</h3><br><a href="http://' + this.baseURL + '/emails/deleteemail/' + userId + '">' + this.baseURL + '/emails/deleteemail/'+ userId + "</a>"

        this.sendMailTo(targetEmail, sourceEmail, subject, body, callback);
    }

    sendPromoMail(targetEmail, itemPricesDic, callback){
        var sourceEmail = "Poe Sales Bot <" + this.sourceEmail + ">";
        var subject = "PoE Discounts";
        var body = ""
        for (var item in itemPricesDic){
            body += '<p>' + item + ' for ' + itemPricesDic[item] + ' coins</p>';
        }
        body += '<p>Liked the item? Don\'t miss the opportunity and go straight to the shop! <a href="https://www.pathofexile.com/shop/category/daily-deals">https://www.pathofexile.com/shop/category/daily-deals</a></p>';
        body += '<br><p><small>Are you tired of receiving this emails? Click <a href="http://' + this.baseURL +  '/unregister">here</a> to unsubscribe</small></p>';

        this.sendMailTo(targetEmail, sourceEmail, subject, body, callback);
    }
}

module.exports = PoEMail;
