import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({ enforceActions: 'always' });

class ActivityStore {
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

  //Sort
  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  //List
  @action loadActivities = async () => {
    this.loadingInitial = true;

    try {
      const activities = await agent.Activities.list();
      //@action wrapper only affects the currently running function, not functions that are scheduled after Promise or Async
      //use runInAction to ensure mutation state outside Mobx is not allowed
      runInAction('loading activities', () => {
        activities.forEach((activity) => {
          activity.date = activity.date.split('.')[0];
          this.activityRegistry.set(activity.id, activity);
        });
      });
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
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting detail activity', () => {
          this.selectedActivity = activity;
        });
      } catch (error) {
        console.log(error);
      } finally {
        runInAction('finish getting detail activity', () => {
          this.loadingInitial = false;
        });
      }
    }
  };

  @action clearActivity = () => {
    this.selectedActivity = null;
  };

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  //Create
  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('finished creating', () => {
        this.submitting = false;
      });
    }
  };
  @action openCreateForm = () => {
    this.selectedActivity = null;
  };

  //Details
  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
  };

  //Edit
  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('finished editing', () => {
        this.submitting = false;
      });
    }
  };
  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
  };
  @action cancelSelectedActivity = () => {
    this.selectedActivity = null;
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
}
export default createContext(new ActivityStore());
