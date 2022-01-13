import React from 'react';
import {
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonImg, createAnimation
} from '@ionic/react';
import {dateToString, MovieProps} from "./MovieProps";
import {heart, remove} from "ionicons/icons";

interface RestaurantPropsExt extends MovieProps {
  onEdit: (id?: string | undefined) => void;
}

const Movie: React.FC<RestaurantPropsExt> = ({ _id, name, director, rating, debut, isFinished, photo, onEdit }) => {


  return (
    <IonCard onClick={() => onEdit(_id)}>
      <IonCardHeader>
        <div className={'name'}>
          <IonLabel> Name: </IonLabel>
          <IonCardTitle>
            {name}
          </IonCardTitle>
        </div>
        <p/>
        <div className={'manager'}>
          <IonLabel> Director: </IonLabel>
          <IonCardSubtitle>
            {director}
          </IonCardSubtitle>
        </div>
        <p/>
        <div className={'rating'}>
          <IonLabel> Rating: </IonLabel>
          <IonCardSubtitle>
            {rating}
          </IonCardSubtitle>
        </div>
        <p/>
        <div className={'openedOn'}>
          <IonLabel> Opened on: </IonLabel>
          <IonCardSubtitle>
            {dateToString(debut)}
          </IonCardSubtitle>
        </div>
        <p/>
      </IonCardHeader>
      <IonCardContent>
        <IonImg src={photo?.webviewPath}/>
        <p/>
        <IonLabel> {isFinished? "Finished" : "Not finished" }</IonLabel>
      </IonCardContent>
    </IonCard>
  );
}

export default Movie;
