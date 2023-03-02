class DiceArrayController {
    constructor() {
        this.diceList = [];
        this.nextIndex = 1;
        this.totals = {};
    }

    add(sides) {
        const die = new DiceController(sides);
        die.index = this.nextIndex++;
        die.addDie();
        if (this.totals[sides]) {
            this.totals[sides] += die.value;
        } else {
            this.totals[sides] = die.value;
        }
        this.diceList.push(die);
        die.DOMC = new DOMController(die);
        die.DOMC.addDieToContainer();
        die.DOMC.addDieToDieList();
        die.DOMC.addDieToAlphList();
        die.DOMC.updateDataSets(die);
    }


    remove(index) {
        const undieIndex = this.diceList.findIndex(die => die.index === index);
        if (undieIndex === -1) {
            return;
        }
        const undie = this.diceList[undieIndex];
        undie.removeDieFromLists();
        undie.DOMC.removeDieFromContainer();
        this.diceList.splice(undieIndex, 1);
        for (let i = undieIndex; i < this.diceList.length; i++) {
            this.diceList[i].index = i + 1;
        }
        if (this.totals[undie.sides]) {
            this.totals[undie.sides] -= undie.value;
        }
    }


    rollAll() {
        const rollbutton = document.getElementById('rollall');
        if (!this.diceList.length)
            return;
        rollbutton.classList.add("active");
        this.diceList.forEach((die, key, arr) => {
            if (!die.hold)
                die.animateRoll();
            if (Object.is(arr.length - 1, key))
                setTimeout(() => {
                    rollbutton.classList.remove("active");
                }, 3000);
        });
    }


    getTotal(sides) {
        return this.totals[sides] || 0;
    }
}

class DiceController {
    constructor(sides, index) {
        this.sides = sides;
        this.value = 1;
        this.index = index;
        this.hold = false;
        this.total = 0;
        this.name = '';
        this.DOMC = null;
        this.buttonConfigs = [
            {
                className: 'diceroll icon',
                title: 'roll',
                clickHandler: () => {
                    this.animateRoll();
                }
            },
            {
                className: 'hold icon',
                title: 'hold',
                clickHandler: () => {
                    this.holdDie();
                }
            },
            {
                className: 'remove icon',
                title: 'remove',
                clickHandler: () => {
                    diceArray.remove(this.index);
                }
            }
        ];
    }
    nameDie() {
        let abc = '';
        if (this.index <= 26) {
            abc = String.fromCharCode(64 + this.index);
        } else if (this.index <= 26 * 27) {
            let prefix = String.fromCharCode(64 + Math.floor((this.index - 1) / 26));
            let suffix = String.fromCharCode(64 + (this.index - 1) % 26 + 1);
            abc = prefix + suffix;
        } else {
            abc = num.toString();
        }
        this.name = abc + ' (d' + this.sides + ')';
    }
    animateRoll() {
        const dieElement = this.DOMC.dieTop.querySelector('.die');
        const rollButton = this.DOMC.dieTop.querySelector('.icon.diceroll');
        dieElement.classList.add("rolling");
        rollButton.classList.add("active");
        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"]`);
        dicelist.forEach((li) => {

            let liButton = li.querySelector('.icon.diceroll');
            liButton.classList.add("active");
        });
        setTimeout(() => {
            this.value = Math.floor(Math.random() * this.sides) + 1;
            dieElement.classList.remove("rolling");
            rollButton.classList.remove("active");
            dicelist.forEach((li) => {
                let liButton = li.querySelector('.icon.diceroll');
                liButton.classList.remove("active");
            });
            this.DOMC.updateDataSets(this);
        }, 3000);
        return this.value;
    }
    createButtons() {
        const buttonDiv = document.createElement('div');
        for (const config of this.buttonConfigs) {
            const button = document.createElement('button');
            button.classList = config.className;
            button.title = config.title;
            const span = document.createElement('span');
            button.appendChild(span);
            button.addEventListener('click', config.clickHandler);
            buttonDiv.appendChild(button);
        }
        buttonDiv.classList.add('controlbuttons');
        return buttonDiv;
    }
    holdDie() {
        const hold1 = this.DOMC.dieTop.querySelector('.hold.icon');
        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"] .hold.icon`);

        this.hold = !this.hold;
        if (this.hold) {
            hold1.classList.add('active');
            hold1.title = 'Held';
            dicelist.forEach((li) => {
                li.classList.add('active');
                li.title = 'Held';
            });
        } else {
            hold1.classList.remove('active');
            hold1.title = 'Hold';
            dicelist.forEach((li) => {
                li.classList.remove('active');
                li.title = 'Hold';
            });
        }
    }
    addDie() {
        this.nameDie();
        return this;
    }
    addDieTopHeader() {
        const dieHeader = document.createElement('div');
        const dieH4 = document.createElement('h4');
        dieH4.textContent = `${this.name}: ${this.total}`;
        dieHeader.classList.add("dieheader");
        dieHeader.appendChild(dieH4);
        const buttonDiv = this.createButtons();
        dieHeader.appendChild(buttonDiv);
        return dieHeader;
    }
    addDieToDieList() {
        const listId = `type${this.sides}d`;
        const list = document.querySelector(`#${listId} .list`);
        let listItem = document.createElement('li');

        const dieValueSpan = document.createElement('span');
        dieValueSpan.textContent = `${this.value}`;
        dieValueSpan.classList.add('name');
        listItem.dataset.name = this.name;
        listItem.appendChild(dieValueSpan);

        const buttonDiv = this.createButtons();
        listItem.appendChild(buttonDiv);
        list.appendChild(listItem);
    }
    addDieToAlphList() {
        const listId = `alphabetical`;
        const list = document.querySelector(`#${listId}`);
        let listItem = document.createElement('li');

        const dieValueSpan = document.createElement('span');
        dieValueSpan.textContent = `${this.value}`;
        dieValueSpan.classList.add('name');
        listItem.appendChild(dieValueSpan);
        listItem.dataset.name = this.name;

        const buttonDiv = this.createButtons();
        listItem.appendChild(buttonDiv);

        list.appendChild(listItem);
    }
    removeDieFromLists() {

        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"]`);
        dicelist.forEach((li) => {
            li.parentNode.removeChild(li);
        });
    }

}
class DOMController {
    constructor(die) {
        this.dieTop = null;
        this.sides = die.sides;
        this.index = die.index;
        this.value = die.value;
        this.name = die.name;
        this.dieTopTemp = ``;
        this.listItemTemp = `
                    <span class="name">${this.name}: ${this.value}</span>
            `;
        this.buttonConfigs = [
            {
                className: 'diceroll icon',
                title: 'roll',
                clickHandler: () => {
                    die.animateRoll();
                }
            },
            {
                className: 'hold icon',
                title: 'hold',
                clickHandler: () => {
                    die.holdDie();
                }
            },
            {
                className: 'remove icon',
                title: 'remove',
                clickHandler: () => {
                    diceArray.remove(this.index);
                }
            }
        ];
    }
    createButtons() {
        const buttonDiv = document.createElement('div');
        for (const config of this.buttonConfigs) {
            const button = document.createElement('button');
            button.classList = config.className;
            button.title = config.title;
            const span = document.createElement('span');
            button.appendChild(span);
            button.addEventListener('click', config.clickHandler);
            buttonDiv.appendChild(button);
        }
        buttonDiv.classList.add('controlbuttons');
        return buttonDiv;
    }
    createListItem() {
        const listItem = document.createElement('li');
        listItem.innerHTML = this.listItemTemp;
        listItem.dataset.name = this.name;
        listItem.dataset.index = this.index;
        const buttonDiv = this.createButtons();
        listItem.append(buttonDiv);
        return listItem;
    }
    updateListItems() {
        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"]`);
        dicelist.forEach((li) => {
            li.dataset.index = this.index;
            li.querySelector('span.name').textContent = `${this.name} : ${this.value}`;
        });
    }
    addDieToDieList() {
        const listId = `type${this.sides}d`;
        const list = document.querySelector(`#${listId} .list`);
        this.dieListItem = this.createListItem();
        list.appendChild(this.dieListItem);

    }
    addDieToAlphList() {
        const listId = `alphabetical`;
        const list = document.querySelector(`#${listId}`);
        this.dieListItem = this.createListItem();
        list.appendChild(this.dieListItem);

    }
    addDieToContainer() {
        const diceContainer = document.querySelector('.dice-container');
        const sideDivs = [];
        for (let i = 0; i < this.sides; i++) {
            sideDivs.push(`<div class="side"></div>`);
        }
        this.dieTopTemp = `
              <div class="dietop" data-face="${this.value}" data-index="${this.index}">
                <div class="dieheader">
                  <h4>${this.name}: ${this.value}</h4>
                </div>
                <div class="die" data-sides="${this.sides}" data-face="${this.value}">${sideDivs.join('')}</div>
              </div>
            `;
        this.dieTop = document.createElement('div');
        this.dieTop.innerHTML = this.dieTopTemp;
        const buttonDiv = this.createButtons();
        const dieHeader = this.dieTop.querySelector('.dieheader');
        dieHeader.appendChild(buttonDiv);

        diceContainer.appendChild(this.dieTop);

    }
    updateContainerItem() {
        const dicecontainer = document.querySelector('.dice-container');
        const dieTop = dicecontainer.querySelector(`.dietop[data-index="${this.index}"]`);
        dieTop.dataset.face = this.value;
        dieTop.dataset.index = this.index;
        dieTop.querySelector('h4').textContent = `${this.name} : ${this.value}`;
        dieTop.querySelector('.die').dataset.face = this.value;
    }
    removeDieFromContainer() {
        const diceContainer = document.getElementById("dice");
        diceContainer.removeChild(this.dieTop);
    }
    updateDataSets(die) {
        this.value = die.value;
        this.index = die.index;
        this.updateListItems();
        this.updateContainerItem();
        const diceList = diceArray.diceList.filter(die => die.sides === this.sides);
        this.total = diceList.reduce((acc, cur) => acc + cur.value, 0);
        const totalElement = document.querySelector(`div#type${this.sides}d h4`);
        if (this.total)
            totalElement.textContent = `D${this.sides}: ${this.total}`;
    }
}
const diceArray = new DiceArrayController;
const addButtonElements = document.querySelectorAll('.add');
addButtonElements.forEach(button => {
    button.addEventListener('click', () => {
        const sides = button.dataset.sides;
        diceArray.add(sides);
    });
});
const rollButton = document.getElementById('rollall');
rollButton.addEventListener('click', () => {
    diceArray.rollAll();
});
const toggleAlphaBtn = document.getElementById('toggle-all');
const alphabeticalList = document.getElementById('alphabetical');
toggleAlphaBtn.addEventListener('click', () => {
    if (alphabeticalList.style.display === 'none') {
        alphabeticalList.style.display = 'block';
    } else {
        alphabeticalList.style.display = 'none';
    }
});

const toggleTypeBtn = document.getElementById('toggle-type');
const typeDivs = document.querySelectorAll('div.type');
toggleTypeBtn.addEventListener('click', () => {
    if (typeDivs[0].style.display === 'block') {
        typeDivs.forEach(div => {
            div.style.display = 'none';
        });
    } else {
        typeDivs.forEach(div => {
            div.style.display = 'block';
        });
    }
});