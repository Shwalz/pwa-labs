import { useState } from 'react';
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/react';

const Kalkulator: React.FC = () => {
  // to, co widać na wyświetlaczu
  const [wyswietlacz, setWyswietlacz] = useState<string>('0');
  // liczba zapamiętana przed wybraniem działania
  const [poprzednia, setPoprzednia] = useState<number | null>(null);
  // wybrane działanie: ÷ × − +
  const [dzialanie, setDzialanie] = useState<string | null>(null);
  // czy następna cyfra ma zacząć nową liczbę
  const [nowaLiczba, setNowaLiczba] = useState<boolean>(true);
  // czy alert o dzieleniu przez zero jest widoczny
  const [pokazAlert, setPokazAlert] = useState(false);

  const wyczysc = () => {
    setWyswietlacz('0');
    setPoprzednia(null);
    setDzialanie(null);
    setNowaLiczba(true);
  };

  const wpiszCyfre = (cyfra: string) => {
    if (nowaLiczba || wyswietlacz === '0') {
      setWyswietlacz(cyfra);
    } else {
      setWyswietlacz(wyswietlacz + cyfra);
    }
    setNowaLiczba(false);
  };

  const wpiszKropke = () => {
    if (nowaLiczba) {
      setWyswietlacz('0.');
      setNowaLiczba(false);
      return;
    }
    // druga kropka w jednej liczbie jest ignorowana
    if (!wyswietlacz.includes('.')) {
      setWyswietlacz(wyswietlacz + '.');
    }
  };

  const wybierzDzialanie = (znak: string) => {
    setPoprzednia(parseFloat(wyswietlacz));
    setDzialanie(znak);
    setNowaLiczba(true);
  };

  const policz = () => {
    if (poprzednia === null || dzialanie === null) {
      return;
    }

    const druga = parseFloat(wyswietlacz);

    if (dzialanie === '÷' && druga === 0) {
      // czyścimy kalkulator (tak jak przycisk C) i pokazujemy alert
      wyczysc();
      setPokazAlert(true);
      return;
    }

    let wynik = 0;
    switch (dzialanie) {
      case '+':
        wynik = poprzednia + druga;
        break;
      case '−':
        wynik = poprzednia - druga;
        break;
      case '×':
        wynik = poprzednia * druga;
        break;
      case '÷':
        wynik = poprzednia / druga;
        break;
    }

    // 0.1 + 0.2 = 0.30000000000000004 → zaokrąglamy
    setWyswietlacz(String(parseFloat(wynik.toFixed(10))));
    setPoprzednia(null);
    setDzialanie(null);
    setNowaLiczba(true);
  };

  const przyciskCyfra = (cyfra: string) => (
    <IonCol>
      <IonButton expand="block" fill="outline" onClick={() => wpiszCyfre(cyfra)}>
        {cyfra}
      </IonButton>
    </IonCol>
  );

  const przyciskDzialanie = (znak: string) => (
    <IonCol>
      <IonButton expand="block" onClick={() => wybierzDzialanie(znak)}>
        {znak}
      </IonButton>
    </IonCol>
  );

  return (
    <IonCard>
      <IonCardContent>
        <h1 className="ion-text-right">{wyswietlacz}</h1>

        <IonGrid>
          <IonRow>
            {przyciskCyfra('7')}
            {przyciskCyfra('8')}
            {przyciskCyfra('9')}
            {przyciskDzialanie('÷')}
          </IonRow>
          <IonRow>
            {przyciskCyfra('4')}
            {przyciskCyfra('5')}
            {przyciskCyfra('6')}
            {przyciskDzialanie('×')}
          </IonRow>
          <IonRow>
            {przyciskCyfra('1')}
            {przyciskCyfra('2')}
            {przyciskCyfra('3')}
            {przyciskDzialanie('−')}
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton expand="block" color="medium" onClick={wyczysc}>
                C
              </IonButton>
            </IonCol>
            {przyciskCyfra('0')}
            <IonCol>
              <IonButton expand="block" fill="outline" onClick={wpiszKropke}>
                .
              </IonButton>
            </IonCol>
            {przyciskDzialanie('+')}
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton expand="block" color="success" onClick={policz}>
                =
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={pokazAlert}
          header="Błąd"
          message="Nie można dzielić przez zero"
          buttons={['OK']}
          onDidDismiss={() => setPokazAlert(false)}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default Kalkulator;
