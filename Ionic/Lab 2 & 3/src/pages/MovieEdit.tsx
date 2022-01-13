import React, { useContext, useEffect, useState } from 'react';
import {
  IonCheckbox,
  IonLabel,
  IonImg,
  IonFab,
  IonIcon,
  IonFabButton,
  CreateAnimation,
  createAnimation, IonDatetime
} from '@ionic/react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import { RouteComponentProps } from 'react-router';
import {MovieProps, Photo, IonDateTimeDateFormat, dateToString, stringToDate} from './MovieProps';
import {useNetwork} from "../core/UseNetwork";
import {camera, cameraOutline, locate, logOut} from "ionicons/icons";
import {usePhotoGallery} from "../core/usePhotoGallery";
import { LocationMap } from '../core/LocationMap';
import {Geolocation, GeolocationPosition} from "@capacitor/core";
import {AuthContext,AuthState} from "../auth/authProvider";

const log = getLogger('MovieEdit');

interface RestaurantEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const MovieEdit: React.FC<RestaurantEditProps> = ({ history, match }) => {
  // initializations
  const { logout } = useContext(AuthContext);
  const { movies, saving, savingError, saveMovie} = useContext(MovieContext);
  const [name, setName] = useState<string>("");
  const [director, setDirector] = useState<string>("");
  const [rating, setViews] = useState(0);
  const [debut,setRelease]=useState<Date>(new Date())
  const [isFinished, setIsFinished] = useState(false);
  const [photo, setPhoto] = useState<Photo>();
  const [movie, setMovie] = useState<MovieProps>();
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition>()
  const { networkStatus } = useNetwork();
  const { takePhoto } = usePhotoGallery();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const movie = movies?.find(it => it._id === routeId);
    log(routeId);
    setMovie(movie);
    if (movie) {
      setName(movie.name);
      setDirector(movie.director );
      setViews(movie.rating?movie.rating:0);
      setIsFinished(movie.isFinished ? movie.isFinished : false);
      setRelease(movie.debut);
      setPhoto(movie.photo)
      setPosition(movie.position)
    }
  }, [match.params.id, movies]);
  const handleSave = () => {
    const editedItem = movie ? { ...movie, name, manager: director, rating: rating, openedOn:debut, isFinished:isFinished, photo, position } : { name, director: director, rating: rating, debut:debut,isFinished: isFinished, photo, position};
      saveMovie && saveMovie(editedItem).then(() => history.goBack());
  };

  // animations

  const cameraElement = document.querySelector('.cameraFab');
  const positionElement = document.querySelector('.positionFab');
  if (cameraElement && positionElement) {
    const cameraFabAnimation = createAnimation()
      .addElement(cameraElement)
      .duration(2000)
      .fromTo('transform', 'translateX(300px)', 'translateX(0px)');
    const positionFabAnimation = createAnimation()
      .addElement(positionElement)
      .duration(2000)
      .fromTo('transform', 'translateX(-300px)', 'translateX(0px)');
    (async () => {
      await cameraFabAnimation.play();
      await positionFabAnimation.play();
    })();
  }


  // rendering

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <CreateAnimation
              duration={2000}
              iterations={Infinity}
              keyframes={
                [
                  { offset: 0, transform: 'scale(1)' },
                  { offset: 0.5, transform: 'scale(1.5)' },
                  { offset: 1, transform: 'scale(1)' }
                ]
              }
            >
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </CreateAnimation>
            <IonButton onClick={() => setShowModal(true)}>
              Delete
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} placeholder={'Name'} />
        <IonInput value={director} onIonChange={e => setDirector(e.detail.value || '')} placeholder={'Director'} />
        <IonLabel> Rating:
          <IonInput value={rating} onIonChange={e => setViews(parseInt(e.detail.value ? e.detail.value
            : "5") || 5)} placeholder={'Rating'}/>
        </IonLabel>

        <IonLabel> Debuted on:
        <IonDatetime displayFormat={IonDateTimeDateFormat} value={dateToString(debut)}
                     onIonChange={e => setRelease(stringToDate(e.detail.value))}/>
        </IonLabel>
        <IonLabel> Finished: </IonLabel>
        <IonCheckbox color = "light" checked = {isFinished} onIonChange={e => setIsFinished(e.detail.checked)} />
        <IonImg  src={photo?.webviewPath}  />
        <LocationMap
          lat={position ? (position.coords ? position.coords.latitude : 0.0) : 0.0}
          lng={position ?  (position.coords ? position.coords.longitude : 0.0)  : 0.0}
          onMapClick={(e: any) => {
            console.log(e.latLng.lat(), e.latLng.lng())
            setPosition({
              coords: {
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
                accuracy: e.latLng.accuracy,
              },
              timestamp: Date.now()
            })
          }}
          onMarkerClick={log('onMarker')}
        />
        <div className={'cameraFab'}>
          <IonFab vertical="bottom" horizontal="start" slot="fixed">
            <IonFabButton onClick={async () => {
              const savedPhoto = await takePhoto();
              setPhoto(savedPhoto);
            }}>
              <IonIcon icon={camera}/>
            </IonFabButton>
          </IonFab>
        </div>
        <div className={'positionFab'}>
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={async () => {
              Geolocation.getCurrentPosition()
                .then(position => {
                  console.log(position)
                  setPosition({
                    coords: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      accuracy: position.coords.accuracy,
                    },
                    timestamp: Date.now()
                  });
                })
                .catch(error => {
                  console.log(error);
                })
            }}>
              <IonIcon icon={locate}/>
            </IonFabButton>
          </IonFab>
        </div>
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => handleLogout()} href='/login'>
            <IonIcon icon={logOut}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
  function handleLogout() {
    log("logout");
    logout?.();
  }
};

export default MovieEdit;

