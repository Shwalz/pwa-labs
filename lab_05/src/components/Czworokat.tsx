import { useRef, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
} from '@ionic/react';
import { calculatorOutline, refreshOutline } from 'ionicons/icons';

// pole dowolnego czworokąta wypukłego — wzór Bretschneidera
const Czworokat: React.FC = () => {
  const aRef = useRef<HTMLIonInputElement>(null);
  const bRef = useRef<HTMLIonInputElement>(null);
  const cRef = useRef<HTMLIonInputElement>(null);
  const dRef = useRef<HTMLIonInputElement>(null);
  const alfaRef = useRef<HTMLIonInputElement>(null);
  const gammaRef = useRef<HTMLIonInputElement>(null);

  const [pole, setPole] = useState<number>();
  const [komunikat, setKomunikat] = useState<string>();

  const oblicz = () => {
    const boki = [aRef, bRef, cRef, dRef].map((r) => Number(r.current?.value));
    const katy = [alfaRef, gammaRef].map((r) => Number(r.current?.value));

    const puste =
      [aRef, bRef, cRef, dRef, alfaRef, gammaRef].some(
        (r) => r.current?.value === '' || r.current?.value == null,
      ) || [...boki, ...katy].some((x) => Number.isNaN(x));

    if (puste) {
      setPole(undefined);
      setKomunikat('Uzupełnij wszystkie pola');
      return;
    }

    if (boki.some((x) => x <= 0)) {
      setPole(undefined);
      setKomunikat('Boki muszą być dodatnie');
      return;
    }

    if (katy.some((x) => x <= 0 || x >= 360)) {
      setPole(undefined);
      setKomunikat('Kąty muszą być z przedziału (0°, 360°)');
      return;
    }

    const [a, b, c, d] = boki;
    const [alfa, gamma] = katy;

    const s = (a + b + c + d) / 2;
    // stopnie zamieniamy na radiany — Math.cos przyjmuje radiany
    const kat = (((alfa + gamma) / 2) * Math.PI) / 180;
    const podPierwiastkiem =
      (s - a) * (s - b) * (s - c) * (s - d) -
      a * b * c * d * Math.cos(kat) ** 2;

    if (podPierwiastkiem <= 0) {
      setPole(undefined);
      setKomunikat('Taki czworokąt nie istnieje');
      return;
    }

    setKomunikat(undefined);
    setPole(Math.sqrt(podPierwiastkiem));
  };

  const resetuj = () => {
    for (const r of [aRef, bRef, cRef, dRef, alfaRef, gammaRef]) {
      r.current!.value = '';
    }
    setPole(undefined);
    setKomunikat(undefined);
  };

  const poleLiczby = (
    label: string,
    ref: React.RefObject<HTMLIonInputElement | null>,
  ) => (
    <IonCol>
      <IonItem>
        <IonInput
          label={label}
          labelPlacement="floating"
          type="number"
          ref={ref}
        />
      </IonItem>
    </IonCol>
  );

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Pole czworokąta</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          <IonRow>
            {poleLiczby('Bok a', aRef)}
            {poleLiczby('Bok b', bRef)}
          </IonRow>
          <IonRow>
            {poleLiczby('Bok c', cRef)}
            {poleLiczby('Bok d', dRef)}
          </IonRow>
          <IonRow>
            {poleLiczby('Kąt α (°)', alfaRef)}
            {poleLiczby('Kąt γ (°)', gammaRef)}
          </IonRow>

          <IonRow>
            <IonCol className="ion-text-left">
              <IonButton onClick={oblicz}>
                <IonIcon slot="start" icon={calculatorOutline} />
                Oblicz
              </IonButton>
            </IonCol>
            <IonCol className="ion-text-right">
              <IonButton onClick={resetuj}>
                <IonIcon slot="start" icon={refreshOutline} />
                Resetuj
              </IonButton>
            </IonCol>
          </IonRow>

          {pole !== undefined && (
            <IonRow>
              <IonCol>
                <h2>Pole: {pole.toFixed(2)}</h2>
              </IonCol>
            </IonRow>
          )}

          {komunikat && (
            <IonRow>
              <IonCol>
                <p color="danger">{komunikat}</p>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default Czworokat;
