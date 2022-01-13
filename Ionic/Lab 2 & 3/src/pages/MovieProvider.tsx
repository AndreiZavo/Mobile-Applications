import React, { useCallback, useEffect, useContext,useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MovieProps } from './MovieProps';
import { createMovie, getMovies, newWebSocket, updateMovie,syncData } from './MovieApi';
import { AuthContext } from '../auth';
import {Plugins} from '@capacitor/core';
import NetworkStatus from '../core/NetworkStatus';
const log = getLogger('MovieProvider');

export type SaveMoviesFn = (movieProps: MovieProps) => Promise<any>;
const {Storage}=Plugins
export interface MoviesState {
  movies?: MovieProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveMovie?: SaveMoviesFn,
  connectedNetwork?: boolean,
  setSavedOffline?: Function,
  savedOffline?: boolean
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: MoviesState = {
  fetching: false,
  saving: false,
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_MOVIES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_MOVIES_SUCCEEDED:
        return { ...state, movies: payload.movies, fetching: false };
      case FETCH_MOVIES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_MOVIE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_MOVIE_SUCCEEDED:
        const movies = [...(state.movies || [])];
        const movie = payload.movie;
        const index = movies.findIndex(it => it._id === movie._id);
        if (index === -1) {
          movies.splice(0, 0, movie);
        } else {
          movies[index] = movie;
        }
        return { ...state, movies: movies, saving: false };
      case SAVE_MOVIE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
  children: PropTypes.ReactNodeLike,
}
const {Network}=Plugins

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);


  const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
  Network.getStatus().then(status => setConnectedNetworkStatus(status.connected));
  const [savedOffline, setSavedOffline] = useState<boolean>(false);
  useEffect(networkEffect, [token, setConnectedNetworkStatus]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { movies, fetching, fetchingError, saving, savingError } = state;
  useEffect(getMoviesEffect, [token]);
  useEffect(ws, [token]);
  const saveMovie = useCallback<SaveMoviesFn>(saveMovieCallback, [token]);
  const value = { movies, fetching, fetchingError, saving, savingError, saveMovie, connectedNetworkStatus,
    savedOffline,
    setSavedOffline  };
  log('returns');
  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
  function networkEffect() {
    console.log("network effect");
    let canceled = false;
    Network.addListener('networkStatusChange', async (status) => {
      if (canceled) return;
      const connected = status.connected;
      if (connected) {
        console.log("networkEffect - SYNC data");

        //new code
        // await helperMethod();
        await syncData(token);
      }
      setConnectedNetworkStatus(status.connected);
    });
    return () => {
      canceled = true;
    }
  }
//new function
  async function helperMethod() {
    if ((await Network.getStatus()).connected && token?.trim()) {
      console.log("executing pending operations")
      const {Storage} = Plugins;
      const {keys} = await Storage.keys();
      for (const key of keys) {
        if (key.startsWith("sav-")) {
          const value = JSON.parse((await Storage.get({key: key})).value!!)
          await createMovie(value.token, value.movie)
          await Storage.remove({key: key})
        } else if (key.startsWith("upd-")) {
          const value = JSON.parse((await Storage.get({key: key})).value!!)
          await updateMovie(value.token, value.movie)
          await Storage.remove({key: key})
        }
      }
    }
  }

  function getMoviesEffect() {
    let canceled = false;
    fetchMovies();
    return () => {
      canceled = true;
    }

    async function fetchMovies() {
      let canceled = false;
      fetchMovies();
      return () => {
        canceled = true;
      }

      async function fetchMovies() {
        if (!token?.trim()) return;
        if (!navigator?.onLine) {
          let storageKeys = Storage.keys();
          const movies = await storageKeys.then(async function (storageKeys) {
            const saved = [];
            for (let i = 0; i < storageKeys.keys.length; i++) {
              if (storageKeys.keys[i] !== "token") {
                const movie = await Storage.get({key : storageKeys.keys[i]});
                if (movie.value != null)
                  var parsedMovie = JSON.parse(movie.value);
                saved.push(parsedMovie);
              }
            }
            return saved;
          });
          dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movies}});
        } else {
          try {
            log('fetchMovies started');
            dispatch({type: FETCH_MOVIES_STARTED});
            const movies = await getMovies(token);
            log('fetchMovies successful');
            if (!canceled) {
              dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movies}})
            }
          } catch (error) {
            let storageKeys = Storage.keys();
            const movies = await storageKeys.then(async function (storageKeys) {
              const saved = [];
              for (let i = 0; i < storageKeys.keys.length; i++) {
                if (storageKeys.keys[i] !== "token") {
                  const movies = await Storage.get({key : storageKeys.keys[i]});
                  if (movies.value != null)
                    var parsedMovie = JSON.parse(movies.value);
                  saved.push(parsedMovie);
                }
              }
              return saved;
            });
            dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movies}});
          }
        }

      }
    }
  }


  async function saveMovieCallback(movie: MovieProps) {
    try {
      if (navigator.onLine) {
        log('saveMovie started');
        dispatch({ type: SAVE_MOVIE_STARTED });
        const updatedMovie = await (movie._id ? updateMovie(token, movie) : createMovie(token, movie))
        log('saveMovie successful');
        dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {updatedMovie}});
      }

      else {
        alert('saveMovie offline');
        log('saveMovie failed');
        movie._id = (movie._id == undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : movie._id;
        await Storage.set({
          key: movie._id!,
          value: JSON.stringify({
            _id: movie._id,
            name: movie.name,
            manager: movie.director,
            rating: movie.rating,
            openedOn: movie.debut,
            isFinished:movie.isFinished
          })
        });
        dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {movie}});
        setSavedOffline(true);
      }
    }
    catch(error) {
      log('saveMovie failed');
      await Storage.set({
        key: String(movie._id),
        value: JSON.stringify(movie)
      })
      dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {movie}});
    }
  }

  function ws() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: movie } = message;
        log(`ws message, movie ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
}
