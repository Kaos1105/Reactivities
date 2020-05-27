import { RootStore } from './rootStore';
import { observable, runInAction, action, computed } from 'mobx';
import { IProfile, IPhoto } from '../models/profile';
import agent from '../api/agent';
import { toast } from 'react-toastify';

export default class ProfileStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
  }

  @observable profile: IProfile | null = null;
  @observable loadingProfile = true;
  @observable uploadingPhoto = false;
  @observable setMainLoading = false;

  @computed get isCurrentUser() {
    if (this._rootStore.userStore.user && this.profile) {
      return this._rootStore.userStore.user.userName === this.profile.userName;
    } else {
      return false;
    }
  }

  @action loadProfile = async (userName: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(userName);
      runInAction(() => {
        this.profile = profile;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  @action uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;
    try {
      const photo = await agent.Profiles.uploadPhoto(file);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos.push(photo);
          if (photo.isMain && this._rootStore.userStore.user) {
            this._rootStore.userStore.user.image = photo.url;
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem uploading photo');
    } finally {
      runInAction(() => {
        this.uploadingPhoto = false;
      });
    }
  };

  @action setMainPhoto = async (photo: IPhoto) => {
    this.setMainLoading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction(() => {
        this._rootStore.userStore.user!.image = photo.url;
        this.profile!.photos.find((a) => a.isMain)!.isMain = false;
        this.profile!.photos.find((a) => (a.id = photo.id))!.isMain = true;
        this.profile!.image = photo.url;
      });
    } catch (error) {
      toast.error('Problem setting photo as main');
    } finally {
      runInAction(() => {
        this.setMainLoading = false;
      });
    }
  };

  @action deletePhoto = async (photo: IPhoto) => {
    this.setMainLoading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
        this.profile!.photos = this.profile!.photos.filter((a) => a.id !== photo.id);
      });
    } catch (error) {
      toast.error('Problem deleting the photo');
    } finally {
      runInAction(() => {
        this.setMainLoading = false;
      });
    }
  };

  @action updateProfile = async (inputProfile: Partial<IProfile>) => {
    try {
      await agent.Profiles.updateProfile(inputProfile);
      runInAction(() => {
        if (inputProfile.displayName !== this._rootStore.userStore.user!.displayName) {
          this._rootStore.userStore.user!.displayName = inputProfile?.displayName!;
        }
        this.profile = { ...this.profile!, ...inputProfile };
      });
    } catch (error) {
      toast.error('Problem updating profile');
    }
  };
}
