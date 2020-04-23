import { observable, computed, action, runInAction } from 'mobx';
import { IUser, IUserFormValues } from '../models/user';
import agent from '../api/agent';
import { RootStore } from './rootStore';
import { history } from '../..';

export default class UserStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
  }

  @observable user: IUser | null = null;

  @computed get isLoggedIn() {
    return !!this.user;
  }

  @action login = async (values: IUserFormValues) => {
    try {
      const user = await agent.Users.login(values);
      runInAction(() => {
        this.user = user;
      });
      //console.log(user);
      this._rootStore.commonStore.setToken(user.token);
      this._rootStore.modalStore.closeModal();
      history.push('/activities');
    } catch (error) {
      throw error;
    }
  };

  @action register = async (values: IUserFormValues) => {
    try {
      const user = await agent.Users.register(values);
      this._rootStore.commonStore.setToken(user.token);
      this._rootStore.modalStore.closeModal();
      history.push('/activities');
    } catch (error) {
      throw error;
    }
  };

  @action getUser = async () => {
    try {
      const user = await agent.Users.current();
      runInAction(() => (this.user = user));
    } catch (error) {
      console.log(error);
    }
  };

  @action logout = () => {
    this._rootStore.commonStore.setToken(null);
    this.user = null;
    history.push('/');
  };
}
