import dataStore from 'nedb-promise';
export class FoodStore {
    constructor({filename, autoload}) {
        this.store = dataStore({filename, autoload});
    }

    async find(props){
        return this.store.find(props);

    }

    async findOne(props){
        return this.store.findOne(props);
    }

    async update(props, item) {
        return this.store.update(props, item);
    }


    async insert(item){
        // if (!item.foodName || !item.dateBought || !item.price) { // validation
        //     throw new Error('Missing properties');
        // }
        return this.store.insert(item);
    }
}

export default new FoodStore({filename: "./db/foods.json", autoload:true});