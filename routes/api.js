"use strict";
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const User = require("../models/User");

mongoose.connect(
	process.env.DB,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => console.log("connected to DB...")
);

const extAPI = (symbol) =>
	`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;

async function addLikes(user, stock) {
	let likes = user.likes;
	if (!likes.includes(stock)) {
		likes.push(stock);
		await User.findOneAndUpdate(
			{ ip: user.ip },
			{ likes },
			{ useFindAndModify: false }
		);
	}
}

module.exports = function (app) {
	app.route("/api/stock-prices").get(async (req, res) => {
		if (typeof req.query.stock === "string") {
			let stock = req.query.stock.toUpperCase();
			let like = req.query.like;
			try {
				let data = await (await fetch(extAPI(stock))).json();
				if (typeof data === "string") return res.send(data);
				if (like) {
					let user = await User.findOne({ ip: req.ip });
					if (!user) {
						let newUser = new User({
							ip: req.ip,
						});
						await User.create(newUser);
					}
					await addLikes(user, stock);
				}
				let fans = (await User.find({ likes: stock })).length;
				let response = {
					stockdata: {
						stock: data.symbol,
						price: data.latestPrice,
						likes: fans,
					},
				};
				res.status(200).json(response);
			} catch (error) {
				res.status(500);
				res.send(error.message);
			}
		} else {
			let stocks = req.query.stock.map((stock) => stock.toUpperCase());
			let like = req.query.like;
			try {
				let data = {};
				for (let i = 0; i <= 1; i++) {
					data[stocks[i]] = await (await fetch(extAPI(stocks[i]))).json();
				}
				if (like) {
					let user = await User.findOne({ ip: req.ip });
					if (!user) {
						let newUser = new User({
							ip: req.ip,
						});
						await User.create(newUser);
					}
					for (let i = 0; i <= 1; i++) {
						if (typeof stocks[i] !== "string") {
							await addLikes(user, stocks[i]);
						}
					}
				}
				let fans = {};
				for (let i = 0; i <= 1; i++) {
					fans[stocks[i]] = (await User.find({ likes: stocks[i] })).length;
				}
				let response = {
					stockdata: [
						{
							stock: data[stocks[0]].symbol,
							price: data[stocks[0]].latestPrice,
							rel_likes: fans[stocks[0]] - fans[stocks[1]],
						},
						{
							stock: data[stocks[1]].symbol,
							price: data[stocks[1]].latestPrice,
							rel_likes: fans[stocks[1]] - fans[stocks[0]],
						},
					],
				};
				res.status(200).json(response);
			} catch (error) {
				res.status(500);
				res.send(error.message);
			}
		}
	});
};
