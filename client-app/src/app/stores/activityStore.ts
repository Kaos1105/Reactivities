import { observable, action, computed, runInAction, reaction } from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@aspnet/signalr';

const LIMIT = 3;

export default class ActivityStore {
  _rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;
    reaction(
      () => this.predicate.keys(),
      () => {
        this.page = 0;
        this.activityRegistry.clear();
        this.loadActivities();
      }
    );
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

  //Activity Count
  @observable activityCount = 0;

  //Activity page
  @observable page = 0;

  //Get number of page
  @computed get totalPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }

  @action setPage = (page: number) => {
    this.page = page;
  };

  //Param URL
  @observable predicate = new Map();

  @action setPredicate = (predicate: string, value: string | Date) => {
    this.predicate.clear();
    if (predicate !== 'all') {
      this.predicate.set(predicate, value);
    }
  };

  @computed get axiosParams() {
    const params = new URLSearchParams();
    params.append('limit', String(LIMIT));
    params.append('offset', `${this.page ? this.page * LIMIT : 0}`);
    this.predicate.forEach((value, key) => {
      if (key === 'startDate') {
        params.append(key, value.toISOString());
      } else {
        params.append(key, value);
      }
    });
    return params;
  }

  //Attend
  @observable attendLoading = false;

  //Hub Connection
  //reference Only observe NOT modified
  @observable.ref hubConnection: HubConnection | null = null;

  //Create Hub connection
  @action createHubConnection = () => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub', {
        accessTokenFactory: () => this._rootStore.commonStore.token!,
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(this.hubConnection!.state))
      .catch((error) => console.log('Error establishing connection: ', error));

    this.hubConnection.on('ReceiveComment', (comment) => {
      runInAction(() => {
        this.selectedActivity!.comments.push(comment);
      });
    });
  };

  //Stop Hub Connection
  @action stopHubConnection = () => {
    this.hubConnection!.stop();
  };

  //Add Comment
  @action addComment = async (values: any) => {
    values.activityId = this.selectedActivity!.id;
    try {
      await this.hubConnection!.invoke('SendComment', values);
    } catch (error) {
      console.log(error);
    }
  };

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
      const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
      const { activities, activityCount } = activitiesEnvelope;
      //@action wrapper only affects the currently running function, not functions that are scheduled after Promise or Async
      //use runInAction to ensure mutation state outside Mobx is not allowed
      runInAction('loading activities', () => {
        activities.forEach((activity) => {
          setActivityProps(activity, user);
          this.activityRegistry.set(activity.id, activity);
        });
        this.activityCount = activityCount;
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
      activity.comments = [];
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
