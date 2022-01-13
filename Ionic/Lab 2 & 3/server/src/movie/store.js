import dataStore from 'nedb-promise';

export class movieStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({filename, autoload});
    }

    async find(properties) {
        return this.store.find(properties);
    }

    async findOne(movieProperties) {
        return this.store.findOne(movieProperties);
    }

    async insert(movie) {
        if(!movie.name) {
            throw new Error('The name of the movie is missing');
        }
        if(!movie.director) {
            throw new Error('The director of the movie is missing');
        }

        return this.store.insert(movie);
    }

    async update(properties, movie) {
        return this.store.update(properties, movie);
    }

}

export default new movieStore({ filename: './database/movies.json',
    autoload: true });
