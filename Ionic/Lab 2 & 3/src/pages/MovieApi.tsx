import { Plugins } from '@capacitor/core';
import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { MovieProps } from './MovieProps';
import { Network } from '@capacitor/core';
import NetworkStatus from '../core/NetworkStatus';
const movieUrl = `http://${baseUrl}/api/movie`;
const url='localhost:3000';
const { Storage } = Plugins;
interface ResponseProps<T> {
  data: T;
}



const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};


export const different = (movie1: any, movie2: any) => {
  if (movie1.name === movie2.name && movie1.director === movie2.director && movie1.rating=== movie2.rating && movie1.debut === movie2.debut && movie1.isFinished===movie2.isFinished)
    return false;
  return true;
}


export const syncData: (token: string) => Promise<MovieProps[]> = async token => {
  try {
    const { keys } = await Storage.keys();
    var result:any = axios.get(`${movieUrl}/`, authConfig(token));
    result.then(async (result: { data: any[]; }) => {
      keys.forEach(async i => {
        if (i !== 'token') {

          const movieOnServer:unknown= result.data.find((each: { _id: string; }) => each._id === i) ;
          const movieLocal = await Storage.get({key: i});


          if (movieOnServer !== undefined && different(movieOnServer, JSON.parse(movieLocal.value!))) {  // actualizare
            console.log('UPDATE ' + movieLocal.value);
            axios.put(`${movieUrl}/${i}`, JSON.parse(movieLocal.value!), authConfig(token));
          } else if (movieOnServer === undefined){  // creare
            console.log('CREATE' + movieLocal.value!);
            axios.post(`${movieUrl}/`, JSON.parse(movieLocal.value!), authConfig(token));
          }
        }
      })
    }).catch((err: { response: any; request: any; }) => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
    })
    return withLogs(result, 'syncMovies');
  } catch (error) {
    throw error;
  }
}

export const getMovies: (token: string) => Promise<MovieProps[]> = token => {
  try {
    var result:any = axios.get(`${movieUrl}/`, authConfig(token));
    result.then(async (result: { data: any; }) => {
      for (const each of result.data) {
        await Storage.set({
          key: each._id!,
          value: JSON.stringify({
            _id: each._id,
            name: each.name,
            director: each.director,
            rating: each.rating,
            debut: each.debut,
            isFinished:each.isFinished
          })
        });
      }
    }).catch((err: { response: any; request: any; }) => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
    })
    return withLogs(result, 'getMovies');
  } catch (error) {
    throw error;
  }
}

export const createMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = async (token, movie) => {
  var result:any = axios.post(`${movieUrl}/`, movie, authConfig(token));
  result.then(async (result: { data: any; }) => {
    var one = result.data;

    await Storage.set({
      key: one._id!,
      value: JSON.stringify({
        _id: one._id,
        name: one.name,
        director: one.director,
        rating: one.rating,
        debut: one.debut,
        isFinished:one.isFinished

      })
    })
  }).catch((err: { response: any; request: any; }) => {
    if (err.response) {
      console.log('client received an error response (5xx, 4xx)');
    } else if (err.request) {
      alert('client never received a response, or request never left');
    } else {
      console.log('anything else');
    }
  });
  return withLogs(result, 'createMovie');
}


export const updateMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token, movie) => {
  var result:any = axios.put(`${movieUrl}/${movie._id}`, movie, authConfig(token));
  result.then(async (result: { data: any; }) => {
    var one = result.data;
    await Storage.set({
      key: one._id!,
      value: JSON.stringify({
        _id: one._id,
        name: one.name,
        director: one.director,
        rating: one.rating,
        debut: one.debut,
        isFinished:one.isFinished
      })
    })
      .catch(err => {
        if (err.response) {
          alert('client received an error response (5xx, 4xx)');
        } else if (err.request) {
          alert('client never received a response, or request never left');
        } else {
          alert('anything else');
        }
      })
  });
  return withLogs(result, 'updateMovie');

}

export const getDirectors: (token: string) => Promise<string[]> =
  (token) => {
    try {
      // TODO FIx ROUTES
      return withLogs(axios.get(`${movieUrl}/directors`, authConfig(token)), 'getDirectors');
    } catch (error) {
      throw error;
    }

  }

export const getMoviesByName: (token: string, name:string) => Promise<MovieProps[]> =
  ((token, name) => {
    if (name != "")
      return withLogs(axios.get((`${movieUrl}/getMoviesByName/${name}`), authConfig(token)), 'getMoviesByName');
    else
      return withLogs(axios.get((`${movieUrl}`), authConfig(token)), 'getMoviesByDirector');
  })

export const getMoviesByFinished: (token: string, isVegan: string) => Promise<MovieProps[]> =
  (token, isFinished) => {
    return withLogs(axios.get((`${movieUrl}/getMoviesByFinished/${isFinished}`), authConfig(token)), 'getMoviesByFinished');
  }

export const getMoviesByDirector: (token: string, director: string) => Promise<MovieProps[]> =
  (token, director) => {
    if(director != "") {
      return withLogs(axios.get((`${movieUrl}/getMoviesByDirector/${director}`), authConfig(token)), 'getMoviesByDirector');
    } else
      return withLogs(axios.get((`${movieUrl}`), authConfig(token)), 'getMoviesByDirector');
  }



interface MessageData {
  type: string;
  payload: {
    movie: MovieProps;
  };
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${url}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'managerization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
