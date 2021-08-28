exports.thread = {
	help: "Thread manager",
	aliases: ['thr'],
	group: "utility",
	usage: "",
	flags: ["$hidden"],
	execute: async function(ctx){
		ctx.code(Object.keys(ctx.ext.threads).join("\n"));
	}
};

exports.reloadthread = {
	help: "Thread manager",
	aliases: ['rthr'],
	group: "utility",
	usage: "",
		flags: ["$hidden"],
	execute: async function(ctx){
		if (ctx.args.length == 0){
			ctx.ext.reload_threads();
		}else{
			ctx.ext.reload_threads(ctx.args[0]);
		}
	}
};

exports.stopthread = {
	help: "Thread manager",
	aliases: ['sthr'],
	group: "utility",
	usage: "",
		flags: ["$hidden"],
	execute: async function(ctx){
		ctx.ext.stopThread(ctx.args[0]);
	}
};

exports.haltthread = {
	help: "Thread manager",
	aliases: ['hthr'],
	group: "utility",
	usage: "",
		flags: ["$hidden"],
	execute: async function(ctx){
		let t = ctx.cfg.get('halted_threads');
		if (t == undefined) t = [];

		if(t.includes(ctx.args[0]))
			t.cut(ctx.args[0]);
		else
			t.push(ctx.args[0]);
		ctx.cfg.set('halted_threads', t);
		ctx.code(t.join(", "), '');
	}
};
