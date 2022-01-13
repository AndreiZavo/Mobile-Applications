import React, {useContext, useEffect, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel,
  IonList, IonListHeader, IonLoading,
  IonPage, IonSearchbar,
  IonTitle,
  IonToolbar,
  IonBadge, IonToast, CreateAnimation, IonChip
} from '@ionic/react';
import { createAnimation } from '@ionic/react';
import {add, filter, logOut} from 'ionicons/icons';
import Movie from "./Movie";
import { getLogger } from '../core';
import {MovieContext} from "./MovieProvider";
import {AuthContext} from "../auth";
import {MovieProps} from "./MovieProps";
import {useNetwork} from "../core/UseNetwork";

const log = getLogger('MovieList');

const offset = 15;

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
  // initialization

  const {  movies, fetching, fetchingError } = useContext(MovieContext);
  const { logout } = useContext(AuthContext);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);
  const [page, setPage] = useState(offset)
  const { networkStatus } = useNetwork();
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    setShowToast(!networkStatus.connected);
  }, [])

  // animations

  const label = document.querySelector('.label');
  if (label) {
    const labelAnimation = createAnimation()
      .addElement(label)
      .duration(2000)
      .direction('alternate')
      .iterations(Infinity)
      .keyframes([
        { offset: 0, opacity: '0.2' },
        { offset: 0.5, opacity: '1' },
        { offset: 1, opacity: '0.2' }
      ]);
    labelAnimation.play();
  }

  const nameElement = document.querySelectorAll('.name');
  const directorElement = document.querySelectorAll('.director');
  if (nameElement && directorElement) {
    const nameAnimation = createAnimation()
      .addElement(nameElement)
      .fromTo('transform', 'scale(0.5)', 'scale(1)');
    const directorAnimation = createAnimation()
      .addElement(directorElement)
      .fromTo('transform', 'scale(1.5)', 'scale(1)');
    const parentAnimation = createAnimation()
      .duration(2000)
      .addAnimation([nameAnimation, directorAnimation]);
    parentAnimation.play();
  }

  // render

  log('render');

  function fetchData(){
    setPage(page + offset);
    if (movies && page > movies?.length) {
      setDisableInfiniteScroll(true);
      setPage(movies.length);
    } else {
      setDisableInfiniteScroll(false);
    }
  }

  async function searchNext($event:CustomEvent<void>){
    fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
          <IonChip>
            <IonBadge color={networkStatus.connected ? "success" : "danger"}>{networkStatus.connected ? "Online" : "Offline"}</IonBadge>
          </IonChip>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching movies" />
        {movies && (
          <IonList>
            {movies.map(({ _id, name, director,rating,debut, isFinished,photo,position}) =>
              <Movie key={_id} _id={_id} name={name} director={director} rating={rating} debut={debut} isFinished={isFinished} photo={photo} position={position} onEdit={id => history.push(`/movie/${id}`)} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch movies'}</div>
        )}
        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
          <IonInfiniteScrollContent loadingText="Loading...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>

        {
          fetchingError && (
            <div>{fetchingError.message || 'Failed to fetch movies'}</div>
          )
        }

        <IonFab vertical="bottom" horizontal="end" slot="fixed">

          <IonFabButton onClick={() => history.push('/movie')}>

            <IonIcon icon={add} />
          </IonFabButton>
          <IonFabButton onClick={() => handleLogout()} href='/login'>
            <IonIcon icon={logOut}/>
          </IonFabButton>
        </IonFab>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message=""
          position="top"
          duration={200}/>

      </IonContent>
    </IonPage>
  );
  function handleLogout() {
    log("logout");
    logout?.();
  }
};



export default MovieList;
