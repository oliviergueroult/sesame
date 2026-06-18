import { CarPlay, GridTemplate, GridButton } from 'react-native-carplay';
import { openDoor } from '../api';

const DOORS = [
  { id: 'portail', label: 'Portail', symbol: 'car.fill' },
  { id: 'garage',  label: 'Garage',  symbol: 'house.fill' },
];

class CarPlayService {
  start() {
    CarPlay.registerOnConnect(this._onConnect);
    CarPlay.registerOnDisconnect(this._onDisconnect);
  }

  stop() {
    CarPlay.unregisterOnConnect(this._onConnect);
    CarPlay.unregisterOnDisconnect(this._onDisconnect);
  }

  _onConnect = () => {
    const buttons = DOORS.map(door =>
      new GridButton({
        titleVariants: [door.label],
        sfSymbol: door.symbol,
        onPress: () => openDoor(door.id).catch(console.warn),
      })
    );

    CarPlay.setRootTemplate(new GridTemplate({
      title: 'Sésame',
      buttons,
    }));
  };

  _onDisconnect = () => {};
}

export default new CarPlayService();
