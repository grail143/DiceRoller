class DiceArrayController {
    constructor() {
        this.diceList = [];
        this.nextIndex = 1;
        this.totals = {
            'all': 0,
            '4d': 0,
            '6d': 0,
            '8d': 0,
            '10d': 0,
            '12d': 0,
            '20d': 0
        };
    }
    updateTotals() {
        for (const key in this.totals) {
            this.totals[key] = 0;
        }
        this.diceList.forEach((die) => {
            this.totals.all += die.value;
            this.totals[`${die.sides}d`] += die.value;
        });
        const dicetypeheaders = document.querySelectorAll(`.type`);
        dicetypeheaders.forEach((header) => {
            const type = header.id.slice(4);
            const h = header.querySelector('h4');
            h.textContent = `${type}: ${this.totals[type]}`;
        });
        const totalanswer = document.getElementById('answer');
        totalanswer.textContent = this.totals['all'];
    }

    add(sides) {
        const die = new DiceController(sides);
        die.index = this.nextIndex++;
        die.addDie();
        this.diceList.push(die);
        die.DOMC = new DOMController(die);
        die.DOMC.addDieToContainer();
        die.DOMC.addDieToDieList();
        die.DOMC.addDieToAlphList();
        die.DOMC.updateDataSets(die);
    }


    remove(name) {
        const undieIndex = this.diceList.findIndex(die => die.name === name);
        if (undieIndex === -1) {
            return;
        }
        const undie = this.diceList[undieIndex];
        undie.DOMC.removeDieFromLists();
        undie.DOMC.removeDieFromContainer();
        this.diceList.splice(undieIndex, 1);
        this.updateTotals();
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
}

class DiceController {
    constructor(sides, index) {
        this.sides = sides;
        this.value = 1;
        this.index = index;
        this.hold = false;
        this.name = '';
        this.DOMC = null;
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
        this.DOMC.waitForValues();
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
                    diceArray.remove(this.name);
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
    removeDieFromLists() {

        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"]`);
        dicelist.forEach((li) => {
            li.parentNode.removeChild(li);
        });
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
    waitForValues() {
        const type = `${this.sides}d`;
        const header = document.querySelector(`#type${type}`);
        const h = header.querySelector('h4');
        h.textContent = `${type}: --`;
        const totalanswer = document.getElementById('answer');
        totalanswer.textContent = '--';
        const dicecontainer = document.querySelector('.dice-container');
        const dieTop = dicecontainer.querySelector(`.dietop[data-index="${this.index}"]`);
        dieTop.querySelector('h4').textContent = `${this.name} : --`;
        const dicelistcontainer = document.querySelector('.dicelist');
        const dicelist = dicelistcontainer.querySelectorAll(`[data-name="${this.name}"]`);
        dicelist.forEach((li) => {
            li.dataset.index = this.index;
            li.querySelector('span.name').textContent = `${this.name} : --`;
        });
    }
    updateDataSets(die) {
        this.value = die.value;
        this.index = die.index;
        this.updateListItems();
        this.updateContainerItem();
        diceArray.updateTotals();
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