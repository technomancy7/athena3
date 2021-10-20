class Deck {
    constructor(){
        this.cards = [];
    }

    shuffle(){
        let counter = this.cards.length;
        let tmp = this.cards
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);
    
            // Decrease counter by 1
            counter--;
    
            // And swap the last element with it
            let temp = tmp[counter];
            tmp[counter] = tmp[index];
            tmp[index] = temp;
        }
        this.cards = tmp;
        return this.cards;
    }

    draw(){
        return this.cards.shift();
    }

    pull(index){
        return this.cards.splice(index, 1);
    }

    drawMultiple(count = 1){
        let result = [];
        for(let i = 0;i<count;i++){
            result.push(this.draw());
        }
        return result;
    }

    createHandFrom(count = 7){
        let h = new Hand(this.drawMultiple(count));
        return h;
    }

    scan(str){
        for(let card of this.cards){
            if(card.str == str) return true;
        }
        return false;
    }

    toString(){
        let str = [];
        for (let card of this.cards){
            str.push(card.str);
        }
        return str.join(", ")
    }
}

class Hand extends Deck {
    constructor(ls = false){
        super();
        this.cards = ls;
    }

    value(){
        let aces = 0,
            value = 0;
        for(let card of this.cards){
            if(card.value == 1) aces ++; 
            value += card.value;
        }
        return value;
    }
}

class StandardCards extends Deck {
    constructor(jokers = false){
        super();
        for(let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]){
            for(let suit of ["hearts", "clubs", "spades", "diamonds"]){
                let name = i;
                if(name == 1) name = "ace";
                if(name == 11) name = "jack";
                if(name == 12) name = "queen";
                if(name == 13) name = "king";
                this.cards.push({value: i, str: `${name} of ${suit}`}); 
            }
        }

        if(jokers){
            this.cards.push({value: 14, str: `JOKER`});
        }
    }
}

exports.Deck = Deck;
exports.StandardCards = StandardCards;
exports.Hand = Hand;