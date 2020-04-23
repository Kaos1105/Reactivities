import { RootStore } from './rootStore';
import { observable, action, reaction } from 'mobx';

export default class CommonStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;

    //react when property have changed
    reaction(
      () => this.token,
      (token) => {
        if (token) {
          window.localStorage.setItem('jwt', token);
        } else {
          window.localStorage.removeItem('jwt');
        }
      }
    );
  }
  @observable token: string | null = window.localStorage.getItem('jwt');
  @observable appLoaded = false;

  @action setToken = (token: string | null) => {
    this.token = token;
  };

  @action setAppLoaded = () => {
    this.appLoaded = true;
  };
}
