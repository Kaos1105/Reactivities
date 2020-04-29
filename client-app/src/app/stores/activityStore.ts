import { observable, action, computed, runInAction } from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';

export default class ActivityStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
  }

  //Observable map
  @observable activityRegistry = new Map();
  //List
  @observable loadingInitial = false;

  //Details
  @observable selectedActivity: IActivity | null = null;

  //Create
  @observable submitting = false;

  //Delete
  @observable targetDelete = '';

  //Attend
  @observable attendLoading = false;

  //Sort
  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort((a, b) => a.date.getTime() - b.date.getTime());
    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split('T')[0];
        activities[date] = activities[date] ? [...activities[date], activity] : [activity];
        return activities;
      }, {} as { [key: string]: IActivity[] })
    );
  }

  //List
  @action loadActivities = async () => {
    this.loadingInitial = true;

    const user = this._rootStore.userStore.user!;

    try {
      const activities = await agent.Activities.list();
      //@action wrapper only affects the currently running function, not functions that are scheduled after Promise or Async
      //use runInAction to ensure mutation state outside Mobx is not allowed
      runInAction('loading activities', () => {
        activities.forEach((activity) => {
          setActivityProps(activity, user);
          this.activityRegistry.set(activity.id, activity);
        });
      });
      //console.log(this.groupActivitiesByDate(activities));
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('finished loading', () => {
        this.loadingInitial = false;
      });
    }
    // agent.Activities.list()
    //   .then((activities) => {
    //     activities.forEach((activity) => {
    //       activity.date = activity.date.split('.')[0];
    //       this.activities.push(activity);
    //     });
    //   })
    //   .catch((error) => console.log(error))
    //   .finally(() => (this.loadingInitial = false));
  };

  //Detail
  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting detail activity', () => {
          setActivityProps(activity, this._rootStore.userStore.user!);
          this.selectedActivity = activity;
          this.activityRegistry.set(activity.id, activity);
        });
        return activity;
      } catch (error) {
        console.log(error);
      } finally {
        runInAction('finish getting detail activity', () => {
          this.loadingInitial = false;
        });
      }
    }
  };

  // @action clearActivity = () => {
  //   this.selectedActivity = null;
  // };

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  //Create
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      const attendee = createAttendee(this._rootStore.userStore.user!);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      activity.attendees = attendees;
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      toast.error('Problem submitting data');
      console.log(error);
    } finally {
      runInAction('finished creating', () => {
        this.submitting = false;
      });
    }
  };

  //Edit
  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.selectedActivity = activity;
        this.activityRegistry.set(activity.id, activity);
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('finished editing', () => {
        this.submitting = false;
      });
    }
  };

  //Delete
  @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    this.submitting = true;
    this.targetDelete = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('finished deleting', () => {
        this.submitting = false;
        this.targetDelete = '';
      });
    }
  };

  //Attend Activity
  @action attendActivity = async () => {
    const attendee = createAttendee(this._rootStore.userStore.user!);
    this.attendLoading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity) {
          this.selectedActivity.attendees.push(attendee);
          this.selectedActivity.isGoing = true;
          this.activityRegistry.set(this.selectedActivity.id, this.selectedActivity);
        }
      });
    } catch (error) {
      toast.error('Problem signing up to activity');
    } finally {
      runInAction(() => {
        this.attendLoading = false;
      });
    }
  };

  //Cancel Activity
  @action cancelAttendance = () => {
    this.attendLoading = true;
    try {
      agent.Activities.unattend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity) {
          this.selectedActivity.attendees = this.selectedActivity.attendees.filter(
            (a) => a.userName !== this._rootStore.userStore.user!.userName
          );
          this.selectedActivity.isGoing = false;
          this.activityRegistry.set(this.selectedActivity.id, this.selectedActivity);
        }
      });
    } catch (error) {
      toast.error('Problem cancelling attendance');
    } finally {
      runInAction(() => {
        this.attendLoading = false;
      });
    }
  };
}
//export default createContext(new ActivityStore());
