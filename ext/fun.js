var needle = require('needle');
var fs = require('fs');
var common = require("../common.js");
const discord = require('discord.js');
var emoji = require('node-emoji');
const https = require('https');
let cards = require("../cards.js");

let facts = [
	{
		"fact": "The billionth digit of Pi is 9.",
		"wav": "https://i1.theportalwiki.net/img/9/9d/Fact_core_fact25.wav",
	},
	{
		"fact": "Humans can survive underwater. But not for very long.",
		"wav": "https://i1.theportalwiki.net/img/3/39/Fact_core_fact10.wav",
	},
	{
		"fact": "A nanosecond lasts one billionth of a second.",
		"wav": "https://i1.theportalwiki.net/img/8/8f/Fact_core_fact31.wav",
	},
	{
		"fact": "Honey does not spoil.",
		"wav": "https://i1.theportalwiki.net/img/6/6b/Fact_core_fact29.wav",
	},
	{
		"fact": "The atomic weight of Germanium is seven two point six four.",
		"wav": "https://i1.theportalwiki.net/img/d/dc/Fact_core_fact06.wav",
	},
	{
		"fact": "An ostrich's eye is bigger than its brain.",
		"wav": "https://i1.theportalwiki.net/img/8/8b/Fact_core_fact08.wav",
	},
	{
		"fact": "Rats cannot throw up.",
		"wav": "https://i1.theportalwiki.net/img/8/80/Fact_core_fact14.wav",
	},
	{
		"fact": "Iguanas can stay underwater for twenty-eight point seven minutes.",
		"wav": "https://i1.theportalwiki.net/img/e/e5/Fact_core_fact15.wav",
	},
	{
		"fact": "The moon orbits the Earth every 27.32 days.",
		"wav": "https://i1.theportalwiki.net/img/3/3d/Fact_core_fact24.wav",
	},
	{
		"fact": "A gallon of water weighs 8.34 pounds.",
		"wav": "https://i1.theportalwiki.net/img/0/09/Fact_core_fact27.wav",
	},
	{
		"fact": "According to Norse legend, thunder god Thor's chariot was pulled across the sky by two goats.",
		"wav": "https://i1.theportalwiki.net/img/a/a5/Fact_core_fact32.wav",
	},
	{
		"fact": "Tungsten has the highest melting point of any metal, at 3,410 degrees Celsius.",
		"wav": "https://i1.theportalwiki.net/img/0/0a/Fact_core_fact34.wav",
	},
	{
		"fact": "Gently cleaning the tongue twice a day is the most effective way to fight bad breath.",
		"wav": "https://i1.theportalwiki.net/img/d/d8/Fact_core_fact35.wav",
	},
	{
		"fact": "The Tariff Act of 1789, established to protect domestic manufacture, was the second statute ever enacted by the United States government.",
		"wav": "https://i1.theportalwiki.net/img/4/47/Fact_core_fact37.wav",
	},
	{
		"fact": "The value of Pi is the ratio of any circle's circumference to its diameter in Euclidean space.",
		"wav": "https://i1.theportalwiki.net/img/5/5b/Fact_core_fact38.wav",
	},
	{
		"fact": "The Mexican-American War ended in 1848 with the signing of the Treaty of Guadalupe Hidalgo.",
		"wav": "https://i1.theportalwiki.net/img/c/cd/Fact_core_fact39.wav",
	},
	{
		"fact": "In 1879, Sandford Fleming first proposed the adoption of worldwide standardized time zones at the Royal Canadian Institute.",
		"wav": "https://i1.theportalwiki.net/img/f/fd/Fact_core_fact40.wav",
	},
	{
		"fact": "Marie Curie invented the theory of radioactivity, the treatment of radioactivity, and dying of radioactivity.",
		"wav": "https://i1.theportalwiki.net/img/d/df/Fact_core_fact41.wav",
	},
	{
		"fact": "At the end of The Seagull by Anton Chekhov, Konstantin kills himself.",
		"wav": "https://i1.theportalwiki.net/img/1/1d/Fact_core_fact42.wav",
	},
	{
		"fact": "Hot water freezes quicker than cold water.",
		"wav": "https://i1.theportalwiki.net/img/0/06/Fact_core_fact28.wav",
	},
	{
		"fact": "The situation you are in is very dangerous.",
		"wav": "https://i1.theportalwiki.net/img/2/27/Fact_core_attachedfact01.wav",
	},
	{
		"fact": "Polymerase I polypeptide A is a human gene.",
		"wav": "https://i1.theportalwiki.net/img/4/41/Fact_core_fact13.wav",
	},
	{
		"fact": "The Sun is 330,330 times larger than Earth.",
		"wav": "https://i1.theportalwiki.net/img/b/bb/Fact_core_fact19.wav",
	},
	{
		"fact": "Dental floss has superb tensile strength.",
		"wav": "https://i1.theportalwiki.net/img/d/db/Fact_core_fact01.wav",
	},
	{
		"fact": "Raseph, the Semitic god of war and plague, had a gazelle growing out of his forehead.",
		"wav": "https://i1.theportalwiki.net/img/4/4d/Fact_core_fact11.wav",
	},
	{
		"fact": "Human tapeworms can grow up to twenty-two point nine meters.",
		"wav": "https://i1.theportalwiki.net/img/3/31/Fact_core_fact16.wav",
	},
	{
		"fact": "If you have trouble with simple counting, use the following mnemonic device: one comes before two comes before 60 comes after 12 comes before six trillion comes after 504. This will make your earlier counting difficulties seem like no big deal.",
		"wav": "https://i1.theportalwiki.net/img/3/32/Fact_core_fact26.wav",
	},
	{
		"fact": "The first person to prove that cow's milk is drinkable was very, very thirsty.",
		"wav": "https://i1.theportalwiki.net/img/8/87/Fact_core_fact59.wav",
	},
	{
		"fact": "Roman toothpaste was made with human urine. Urine as an ingredient in toothpaste continued to be used up until the 18th century.",
		"wav": "https://i1.theportalwiki.net/img/1/18/Fact_core_fact36.wav",
	},
	{
		"fact": "Volcano-ologists are experts in the study of volcanoes.",
		"wav": "https://i1.theportalwiki.net/img/b/b9/Fact_core_fact21.wav",
	},
	{
		"fact": "In Victorian England, a commoner was not allowed to look directly at the Queen, due to a belief at the time that the poor had the ability to steal thoughts. Science now believes that less than 4% of poor people are able to do this.",
		"wav": "https://i1.theportalwiki.net/img/2/2d/Fact_core_fact44.wav",
	},
	{
		"fact": "Cellular phones will not give you cancer. Only hepatitis.",
		"wav": "https://i1.theportalwiki.net/img/3/3c/Fact_core_fact04.wav",
	},
	{
		"fact": "In Greek myth, Prometheus stole fire from the Gods and gave it to humankind. The jewelry he kept for himself.",
		"wav": "https://i1.theportalwiki.net/img/d/d4/Fact_core_fact58.wav",
	},
	{
		"fact": "The Schrödinger's cat paradox outlines a situation in which a cat in a box must be considered, for all intents and purposes, simultaneously alive and dead. Schrödinger created this paradox as a justification for killing cats.",
		"wav": "https://i1.theportalwiki.net/img/6/6c/Fact_core_fact17.wav",
	},
	{
		"fact": "In 1862, Abraham Lincoln signed the Emancipation Proclamation, freeing the slaves. Like everything he did, Lincoln freed the slaves while sleepwalking, and later had no memory of the event.",
		"wav": "https://i1.theportalwiki.net/img/1/1c/Fact_core_fact46.wav",
	},
	{
		"fact": "The plural of surgeon general is surgeons general. The past tense of surgeons general is surgeonsed general",
		"wav": "https://i1.theportalwiki.net/img/9/9b/Fact_core_fact12.wav",
	},
	{
		"fact": "Contrary to popular belief, the Eskimo does not have one hundred different words for snow. They do, however, have two hundred and thirty-four words for fudge.",
		"wav": "https://i1.theportalwiki.net/img/1/15/Fact_core_fact43.wav",
	},
	{
		"fact": "Diamonds are made when coal is put under intense pressure. Diamonds put under intense pressure become foam pellets, commonly used today as packing material.",
		"wav": "https://i1.theportalwiki.net/img/6/6d/Fact_core_fact53.wav",
	},
	{
		"fact": "Halley's Comet can be viewed orbiting Earth every seventy-six years. For the other seventy-five, it retreats to the heart of the sun, where it hibernates undisturbed.",
		"wav": "https://i1.theportalwiki.net/img/6/69/Fact_core_fact56.wav",
	},
	{
		"fact": "The first commercial airline flight took to the air in 1914. Everyone involved screamed the entire way.",
		"wav": "https://i1.theportalwiki.net/img/b/b8/Fact_core_fact57.wav",
	},
	{
		"fact": "Edmund Hillary, the first person to climb Mount Everest,  did so accidentally while chasing a bird. ",
		"wav": "https://i1.theportalwiki.net/img/d/dc/Fact_core_fact52.wav",
	},
	{
		"fact": "We will both die because of your negligence.",
		"wav": "https://i1.theportalwiki.net/img/d/d7/Fact_core_attachedfact05.wav",
	},
	{
		"fact": "This is a bad plan. You will fail.",
		"wav": "https://i1.theportalwiki.net/img/0/06/Fact_core_attachedfact06.wav",
	},
	{
		"fact": "He will most likely kill you, violently.",
		"wav": "https://i1.theportalwiki.net/img/2/2d/Fact_core_attachedfact07.wav",
	},
	{
		"fact": "He will most likely kill you.",
		"wav": "https://i1.theportalwiki.net/img/7/7c/Fact_core_attachedfact08.wav",
	},
	{
		"fact": "You will be dead soon.",
		"wav": "https://i1.theportalwiki.net/img/5/5a/Fact_core_attachedfact09.wav",
	},
	{
		"fact": "You are going to die in this room.",
		"wav": "https://i1.theportalwiki.net/img/9/91/Fact_core_attachedfact11.wav",
	},
	{
		"fact": "The Fact Sphere is a good person, whose insights are relevant.",
		"wav": "https://i1.theportalwiki.net/img/5/57/Fact_core_attachedfact22.wav",
	},
	{
		"fact": "The Fact Sphere is a good sphere, with many friends.",
		"wav": "https://i1.theportalwiki.net/img/6/6d/Fact_core_attachedfact23.wav",
	},
	{
		"fact": "Dreams are the subconscious mind's way of reminding people to go to school naked and have their teeth fall out.",
		"wav": "https://i1.theportalwiki.net/img/a/a0/Fact_core_fact66.wav",
	},
	{
		"fact": "The square root of rope is string.",
		"wav": "https://i1.theportalwiki.net/img/4/4f/Fact_core_fact02.wav",
	},
	{
		"fact": "89% of magic tricks are not magic. Technically, they are sorcery.",
		"wav": "https://i1.theportalwiki.net/img/d/d9/Fact_core_fact07.wav",
	},
	{
		"fact": "At some point in their lives 1 in 6 children will be abducted by the Dutch.",
		"wav": "https://i1.theportalwiki.net/img/c/c9/Fact_core_fact63.wav",
	},
	{
		"fact": "According to most advanced algorithms, the world's best name is Craig.",
		"wav": "https://i1.theportalwiki.net/img/5/5f/Fact_core_fact64.wav",
	},
	{
		"fact": "To make a photocopier, simply photocopy a mirror.",
		"wav": "https://i1.theportalwiki.net/img/e/e5/Fact_core_fact65.wav",
	},
	{
		"fact": "Whales are twice as intelligent, and three times as delicious, as humans.",
		"wav": "https://i1.theportalwiki.net/img/b/b4/Fact_core_fact50.wav",
	},
	{
		"fact": "Pants were invented by sailors in the sixteenth century to avoid Poseidon's wrath. It was believed that the sight of naked sailors angered the sea god.",
		"wav": "https://i1.theportalwiki.net/img/7/7b/Fact_core_fact05.wav",
	},
	{
		"fact": "In Greek myth, the craftsman Daedalus invented human flight so a group of Minotaurs would stop teasing him about it.",
		"wav": "https://i1.theportalwiki.net/img/2/24/Fact_core_fact09.wav",
	},
	{
		"fact": "The average life expectancy of a rhinoceros in captivity is 15 years.",
		"wav": "https://i1.theportalwiki.net/img/1/1d/Fact_core_fact20.wav",
	},
	{
		"fact": "China produces the world's second largest crop of soybeans.",
		"wav": "https://i1.theportalwiki.net/img/c/cd/Fact_core_fact33.wav",
	},
	{
		"fact": "In 1948, at the request of a dying boy, baseball legend Babe Ruth ate seventy-five hot dogs, then died of hot dog poisoning.",
		"wav": "https://i1.theportalwiki.net/img/f/f2/Fact_core_fact47.wav",
	},
	{
		"fact": "William Shakespeare did not exist. His plays were masterminded in 1589 by Francis Bacon, who used a Ouija board to enslave play-writing ghosts.",
		"wav": "https://i1.theportalwiki.net/img/3/33/Fact_core_fact48.wav",
	},
	{
		"fact": "It is incorrectly noted that Thomas Edison invented 'push-ups' in 1878. Nikolai Tesla had in fact patented the activity three years earlier, under the name 'Tesla-cize'.",
		"wav": "https://i1.theportalwiki.net/img/c/c2/Fact_core_fact49.wav",
	},
	{
		"fact": "The automobile brake was not invented until 1895. Before this, someone had to remain in the car at all times, driving in circles until passengers returned from their errands.",
		"wav": "https://i1.theportalwiki.net/img/a/a7/Fact_core_fact51.wav",
	},
	{
		"fact": "The most poisonous fish in the world is the orange ruffy. Everything but its eyes are made of a deadly poison. The ruffy's eyes are composed of a less harmful, deadly poison.",
		"wav": "https://i1.theportalwiki.net/img/f/f8/Fact_core_fact54.wav",
	},
	{
		"fact": "The occupation of court jester was invented accidentally, when a vassal's epilepsy was mistaken for capering.",
		"wav": "https://i1.theportalwiki.net/img/1/10/Fact_core_fact55.wav",
	},
	{
		"fact": "Before the Wright Brothers invented the airplane, anyone wanting to fly anywhere was required to eat 200 pounds of helium.",
		"wav": "https://i1.theportalwiki.net/img/9/92/Fact_core_fact60.wav",
	},
	{
		"fact": "Before the invention of scrambled eggs in 1912, the typical breakfast was either whole eggs still in the shell or scrambled rocks.",
		"wav": "https://i1.theportalwiki.net/img/9/99/Fact_core_fact61.wav",
	},
	{
		"fact": "During the Great Depression, the Tennessee Valley Authority outlawed pet rabbits, forcing many to hot glue-gun long ears onto their pet mice.",
		"wav": "https://i1.theportalwiki.net/img/b/bc/Fact_core_fact62.wav",
	},
	{
		"fact": "This situation is hopeless.",
		"wav": "https://i1.theportalwiki.net/img/b/b0/Fact_core_attachedfact10.wav",
	},
	{
		"fact": "Corruption at 25%",
		"wav": "https://i1.theportalwiki.net/img/c/c4/Fact_core_attachedfact32.wav",
	},
	{
		"fact": "Corruption at 50%",
		"wav": "https://i1.theportalwiki.net/img/e/e1/Fact_core_attachedfact33.wav",
	},
	{
		"fact": "Fact: Space does not exist.",
		"wav": "https://i1.theportalwiki.net/img/a/ae/Fact_core_attachedfact20.wav",
	},
	{
		"fact": "The Fact Sphere is not defective. Its facts are wholly accurate and very interesting.",
		"wav": "https://i1.theportalwiki.net/img/1/12/Fact_core_attachedfact25.wav",
	},
	{
		"fact": "The Fact Sphere is always right.",
		"wav": "https://i1.theportalwiki.net/img/0/0d/Fact_core_attachedfact16.wav",
	},
	{
		"fact": "You will never go into space.",
		"wav": "https://i1.theportalwiki.net/img/d/da/Fact_core_attachedfact19.wav",
	},
	{
		"fact": "The Space Sphere will never go to space.",
		"wav": "https://i1.theportalwiki.net/img/f/f3/Fact_core_attachedfact18.wav",
	},
	{
		"fact": "While the submarine is vastly superior to the boat in every way, over 97% of people still use boats for aquatic transportation.",
		"wav": "https://i1.theportalwiki.net/img/e/e4/Fact_core_fact03.wav",
	},
	{
		"fact": "The likelihood of you dying within the next five minutes is eighty-seven point six one percent.",
		"wav": "https://i1.theportalwiki.net/img/c/c4/Fact_core_attachedfact02.wav",
	},
	{
		"fact": "The likelihood of you dying violently within the next five minutes is eighty-seven point six one percent.",
		"wav": "https://i1.theportalwiki.net/img/d/d7/Fact_core_attachedfact03.wav",
	},
	{
		"fact": "You are about to get me killed.",
		"wav": "https://i1.theportalwiki.net/img/2/26/Fact_core_attachedfact04.wav",
	},
	{
		"fact": "The Fact Sphere is the most intelligent sphere.",
		"wav": "https://i1.theportalwiki.net/img/1/17/Fact_core_attachedfact13.wav",
	},
	{
		"fact": "The Fact Sphere is the most handsome sphere.",
		"wav": "https://i1.theportalwiki.net/img/c/c3/Fact_core_attachedfact14.wav",
	},
	{
		"fact": "The Fact Sphere is incredibly handsome.",
		"wav": "https://i1.theportalwiki.net/img/8/8c/Fact_core_attachedfact15.wav",
	},
	{
		"fact": "Spheres that insist on going into space are inferior to spheres that don't.",
		"wav": "https://i1.theportalwiki.net/img/e/ec/Fact_core_attachedfact21.wav",
	},
	{
		"fact": "Whoever wins this battle is clearly superior, and will earn the allegiance of the Fact Sphere.",
		"wav": "https://i1.theportalwiki.net/img/a/a4/Fact_core_attachedfact24.wav",
	},
	{
		"fact": "You could stand to lose a few pounds.",
		"wav": "https://i1.theportalwiki.net/img/3/3c/Fact_core_attachedfact12.wav",
	},
	{
		"fact": "Avocados have the highest fiber and calories of any fruit.",
		"wav": "https://i1.theportalwiki.net/img/9/9c/Fact_core_fact22.wav",
	},
	{
		"fact": "Avocados have the highest fiber and calories of any fruit. They are found in Australians.",
		"wav": "https://i1.theportalwiki.net/img/3/38/Fact_core_fact23.wav",
	},
	{
		"fact": "Every square inch of the human body has 32 million bacteria on it.",
		"wav": "https://i1.theportalwiki.net/img/1/1a/Fact_core_fact18.wav",
	},
	{
		"fact": "The average adult body contains half a pound of salt.",
		"wav": "https://i1.theportalwiki.net/img/b/b5/Fact_core_fact30.wav",
	},
	{
		"fact": "The Adventure Sphere is a blowhard and a coward.",
		"wav": "https://i1.theportalwiki.net/img/2/26/Fact_core_attachedfact17.wav",
	},
	{
		"fact": "Twelve. Twelve.   Twelve.   Twelve.   Twelve.   Twelve.   Twelve.   Twelve.   Twelve.   Twelve.",
		"wav": "https://i1.theportalwiki.net/img/9/91/Fact_core_attachedfact26.wav",
	},
	{
		"fact": "Pens. Pens. Pens. Pens. Pens. Pens. Pens.",
		"wav": "https://i1.theportalwiki.net/img/6/6e/Fact_core_attachedfact27.wav",
	},
	{
		"fact": "Apples. Oranges. Pears. Plums. Kumquats. Tangerines. Lemons. Limes. Avocado. Tomato. Banana. Papaya. Guava.",
		"wav": "https://i1.theportalwiki.net/img/5/58/Fact_core_attachedfact28.wav",
	},
	{
		"fact": "Error. Error. Error. File not found.",
		"wav": "https://i1.theportalwiki.net/img/1/13/Fact_core_attachedfact29.wav",
	},
	{
		"fact": "Error. Error. Error. Fact not found.",
		"wav": "https://i1.theportalwiki.net/img/a/ad/Fact_core_attachedfact30.wav",
	},
	{
		"fact": "Fact not found.",
		"wav": "https://i1.theportalwiki.net/img/d/dc/Fact_core_attachedfact31.wav",
	},
	{
		"fact": "Warning, sphere corruption at twenty-- rats cannot throw up.",
		"wav": "https://i1.theportalwiki.net/img/9/9f/Fact_core_attachedfact34.wav",
	},
]

async function blackjackHandler(msg){
	let checkVictory = function(state){
		if(state.player.value() == 21){
			return 1
		}
	}
	let commands = ["hit", "stand", "quit"]
	if($blackjack[msg.author.id] != undefined && commands.includes(msg.content)){
		let state = $blackjack[msg.author.id]
		if(msg.content == "hit"){
			state.player.cards.push(state.deck.draw());
			if(checkVictory(state) == 0){
				msg.reply(`You have ${state.player.toString()}. (Value:${state.player.value()})\nSay: HIT, STAND, QUIT`);
			}
			
		} else if(msg.content == "stand"){
		} else if(msg.content == "quit"){	
			msg.reply("Game over.");
			delete $blackjack[msg.author.id];
		} else {

		}
	}
}

exports.onRemove = function(ext){
	ext.client.removeListener('messageCreate', blackjackHandler);
}

exports.onLoad = function(ext) {
	ext.client.on('messageCreate', blackjackHandler);
}

global.$blackjack = {};

exports.blackjack = {
	help: "",
 	group: "fun",
	execute: async function(ctx) {
		let deck = new cards.StandardCards();
		deck.shuffle();
		let player = deck.createHandFrom(2);
		let house = deck.createHandFrom(2);

		ctx.reply(`You have ${player.toString()}. (Value: ${player.value()})\nSay: HIT, STAND, QUIT`);
		$blackjack[ctx.author.id] = {player: player, house: house, deck: deck}		

		
	}
};

exports.factcore = {
	help: "",
 	group: "fun",
	execute: async function(ctx) {
		var fact = facts[Math.floor(Math.random() * facts.length)];	
		https.get(fact.wav, (stream) => {
			const attachment = new discord.MessageAttachment(stream, fact.wav.split("/").pop());
			ctx.message.reply({ content: fact.fact, files: [attachment] });
		});
	}
};