import { MovieProps } from "./MovieProps";
import {getMoviesByDirector, getDirectors, getMoviesByFinished} from "./MovieApi";
import { AuthContext } from "../auth";
import NetworkStatus from "../core/NetworkStatus";
import { logOut } from "ionicons/icons";
import { Network, Plugins } from "@capacitor/core";
import { RouteComponentProps } from "react-router";
import { useContext, useEffect, useState } from "react";
import { IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from "@ionic/react";
import Movie from "./Movie";
import React from "react";
const MovieFilter: React.FC<RouteComponentProps> = ({history}) => {
  const { logout } = useContext(AuthContext)
  const { token } = useContext(AuthContext);

  const [filteredMovies, setFilteredMovies] = useState<MovieProps[]>([]);
  const [filter, setFilter] = useState<string>("");

  const [status, setStatus] = useState<boolean>(true);

  Network.getStatus().then(status => setStatus(status.connected));

  Network.addListener('networkStatusChange', (status) => {
    setStatus(status.connected);
  });
  const [types, setTypes] = useState<string[]>([]);
  const [directors,setDirectors]=useState<string[]>([]);

  async function fetchTypes(reset?: boolean) {
    if(!token?.trim()){
      return;
    }

    try {
      setTypes(["Not Finished", "Finished"]);
    } catch(error) {
      console.log(error);
    }

  }

  async function fetchMovies(reset?: boolean) {
    if (!token?.trim()) {
      return;
    }

    try {
      if(reset) {
        const movies = await getMoviesByFinished(token, filter);
        setFilteredMovies(movies);
      } else {
        setFilteredMovies(filteredMovies);
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchTypes(true);

    fetchMovies(true);
  }, [filter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle> Filter Movies </IonTitle>
          <IonChip>
            <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
          </IonChip>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonSelect value={filter} placeholder="Select type of movie" onIonChange={e => setFilter(e.detail.value)}>
          {types.map(
            type => <IonSelectOption key={type} value={type}> {type} </IonSelectOption>
          )}
        </IonSelect>

        {filteredMovies && (
          <IonList>
            {filteredMovies.map(({ _id, name, director,rating, debut, isFinished, photo, position }) =>
              <Movie key={_id}
                     _id={_id} name={name} director={director} rating={rating} debut={debut} isFinished={isFinished} photo={photo} position={position}
                     onEdit={(id: any) => history.push(`/movie/${id}`)} />
            )}
          </IonList>
        )}

        {!filteredMovies && (
          <p> No Movies written by this director </p>
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

    logout?.();
  }
}

export default MovieFilter;
