export class Movie {
    constructor({id, name, director, rating, debut, isFinished, userId}) {
        this.id = id;
        this.name = name;
        this.director = director;
        this.rating = rating;
        this.debut = debut;
        this.isFinished = isFinished;
        this.userId = userId;
    }
}
