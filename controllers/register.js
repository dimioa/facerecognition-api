const handleRegister = (req,res,db,bcrypt) => {
	const {email,name,password} = req.body;
	if(!email || !name || !password) {
		return res.status(400).json('Incorrect form submission');
	}
	const hash = bcrypt.hashSync(password);
		/*We create a transaction and put both tables insert operations inside it*/
		/*This way, if insert to one of the tables fail, then both will fail*/
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')	/*Insert into login table first*/
			.returning('email')
			.then(loginEmail => {
				return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
			})
			.then(trx.commit)	/*If all goes well submit the transaction*/
			.catch(trx.rollback)/*Else, don't do the changes in the DB*/
		})	
		.catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
	handleRegister: handleRegister
};