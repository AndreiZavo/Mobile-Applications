import dataSource from 'nedb-promise';

export class UserStore {
    constructor( {filename, autoload} ) {
        this.store = dataSource( {filename, autoload} );
    }

    async findOne(userProperties) {
        return this.store.findOne(userProperties);
    }

    async insert(user) {
        return this.store.insert(user);
    }
}

export default new UserStore({ filename: './database/users.json',
                                               autoload: true });
