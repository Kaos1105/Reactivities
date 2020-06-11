import { RootStore } from './rootStore';
import { observable, runInAction, action, computed, reaction } from 'mobx';
import { IProfile, IPhoto, IUserActivity } from '../models/profile';
import agent from '../api/agent';
import { toast } from 'react-toastify';

export default class ProfileStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? 'followers' : 'followings';
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  @observable profile: IProfile | null = null;
  @observable loadingProfile = true;
  @observable uploadingPhoto = false;
  @observable setMainLoading = false;
  @observable followings: IProfile[] = [];
  @observable activeTab: number = 0;
  @observable userActivities: IUserActivity[] = [];
  @observable loadingActivities = false;

  @action loadUserActivities = async (username: string, predicate?: string) => {
    this.loadingActivities = true;
    try {
      const activities = await agent.Profiles.listActivities(username, predicate!);
      runInAction(() => {
        this.userActivities = activities;
      });
    } catch (error) {
      toast.error('Problem loading activity');
    } finally {
      runInAction(() => {
        this.loadingActivities = false;
      });
    }
  };

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
    //final testing
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

  @action follow = async (username: string) => {
    this.setMainLoading = true;
    try {
      await agent.Profiles.follow(username);
      runInAction(() => {
        this.profile!.following = true;
        this.profile!.followersCount++;
        this.loadingProfile = false;
      });
    } catch (error) {
      toast.error('Problem following user');
    } finally {
      runInAction(() => {
        this.setMainLoading = false;
      });
    }
  };

  @action unfollow = async (username: string) => {
    this.setMainLoading = true;
    try {
      await agent.Profiles.unfollow(username);
      runInAction(() => {
        this.profile!.following = false;
        this.profile!.followersCount--;
        this.loadingProfile = false;
      });
    } catch (error) {
      toast.error('Problem unfollowing user');
    } finally {
      runInAction(() => {
        this.setMainLoading = false;
      });
    }
  };

  @action loadFollowings = async (predicate: string) => {
    this.setMainLoading = true;
    try {
      const profiles = await agent.Profiles.listFollowings(this.profile!.userName, predicate);
      runInAction(() => {
        this.followings = profiles;
      });
    } catch (error) {
      toast.error('Problem loading followings');
    } finally {
      runInAction(() => {
        this.setMainLoading = false;
      });
    }
  };

  @action setActiveTab = (activeIndex: number) => {
    this.activeTab = activeIndex;
  };
}
