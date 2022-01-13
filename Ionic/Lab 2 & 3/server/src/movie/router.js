import Router from 'koa-router';

import { broadcast} from "../utils/wss";
import movieStore from "./store";

export  const router = new Router();

router.get('/', async (context) => {
    const userId = context.state.user._id;
    const response = context.response;
    response.body = await movieStore.find({ userId });
    response.status = 200; // ok
});

router.get('/directors', async (context) => {
    const userId = context.state.user._id;
    const response = context.response;
    const movies = await movieStore.find({ userId });

    const directors = [];
    movies.map(movie => {
        if (directors.indexOf(movie.director) === -1)
            directors.push(movie.director);
    });
    response.body = directors;
    response.status = 200; // ok
});

router.get('/:id', async (context) => {
    const userId = context.state.user._id;
    const movie = await movieStore.findOne({ _id: context.params.id });
    const response = context.response;

    if(movie) {
        if(movie.userId === userId) {
            response.body = movie;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});

router.get('/getMovieByFinished/:finished', async (context) => {
    const userId = context.state.user._id;
    const finished = (context.params.finished === "Finished");
    const response = context.response;
    const movies = await movieStore.find({ userId });

    const returnedMovies = [];
    movies.map(movie => {
        if(movie.isFinished === finished) {
            returnedMovies.push(movie);
        }
    });
    response.body = returnedMovies;
    response.status = 200; // ok
});

router.get('/getMoviesByName/:name', async (context) => {
    const userId = context.state.user._id;
    const name = context.params.name;
    const response = context.response;
    const movies = await movieStore.find({ userId });

    const returnedMovies = [];
    movies.map(movie => {
        if(movie.name.includes(name)) {
            returnedMovies.push(movie);
        }
    });
    response.body = returnedMovies;
    response.status = 200; // ok
});

router.get('/getMoviesByDirector/:director', async (context) => {
    const userId = context.state.user._id;
    const director = context.params.director;
    const response = context.response;
    const movies = await movieStore.find({ userId });

    const returnedMovies = [];
    movies.map(movie => {
        if(movie.director.includes(director)) {
            returnedMovies.push(movie);
        }
    });
    response.body = returnedMovies;
    response.status = 200; // ok
});


const createMovie = async (context, movie, response) => {
    console.log(movie.name)
    try {
        const userId = context.state.user._id;
        movie.userId = userId;

        if ((await movieStore.find(userId)).length === 0)
            response.body = await movieStore.insert(movie);
        else
            response.body = await movieStore.update(movie);
        response.status = 201; // created
        broadcast(userId, { type: 'created', payload: response.body });
    } catch(error) {
        console.log(error.message)
        response.body = { issue: [{ error: error.message }] };
        response.status = 400; // bad request
    }
}

router.post('/', async context => await createMovie(context, context.request.body, context.response));

router.put('/:id', async (ctx) => {
    const movie = ctx.request.body;
    const id = ctx.params.id;
    const movieId = movie._id;
    const response = ctx.response;
    if (movieId && movieId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    const userId = ctx.state.user._id;
    movie.userId = userId;
    const updatedCount = await movieStore.update({ _id: id }, movie);
    if (updatedCount === 1) {
        response.body = movie;
        response.status = 200; // ok
        broadcast(userId, { type: 'updated', payload: movie });
    } else {
        response.body = { message: 'Resource no longer exists' };
        response.status = 405; // method not allowed
    }
});

