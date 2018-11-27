let nodemailer = require('nodemailer');

module.exports = function(credentials){

	let mailTransport = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, //true for 456, false for other ports
		auth: {
			user: credentials.gmail.user,
			pass: credentials.gmail.password,
		}
	});

	let from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
	let errorRecipient = 'youremail@gmail.com';

	return {
		send: function(to, subj, body){
		    mailTransport.sendMail({
		        from: from,
		        to: to,
		        subject: subj,
		        html: body,
		        generateTextFromHtml: true
		    }, function(err){
		        if(err) console.error('Unable to send email: ' + err);
		    });
		},

		emailError: function(message, filename, exception){
			let body = '<h1>Meadowlark Travel Site Error</h1>' +
				'message:<br><pre>' + message + '</pre><br>';
			if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
			if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
		    mailTransport.sendMail({
		        from: from,
		        to: errorRecipient,
		        subject: 'Meadowlark Travel Site Error',
		        html: body,
		        generateTextFromHtml: true
		    }, function(err){
		        if(err) console.error('Unable to send email: ' + err);
		    });
		},
	};
};