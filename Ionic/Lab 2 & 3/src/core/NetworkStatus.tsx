import React from "react";
import { useNetwork } from "./UseNetwork";
import { IonItem } from "@ionic/react";

const NetworkStatus: React.FC = () => {
    const {networkStatus} = useNetwork();

    return (
        <IonItem> Network Status: connected = {JSON.stringify(networkStatus.connected)} </IonItem>
    )
};

export default NetworkStatus;
