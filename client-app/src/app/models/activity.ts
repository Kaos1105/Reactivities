export interface IActivitiesEnvelope {
  activities: IActivity[];
  activityCount: number;
}

export interface IActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  city: string;
  venue: string;
  isGoing: boolean;
  isHost: boolean;
  attendees: IAttendee[];
  comments: IComment[];
}

export interface IActivityFormValues extends Partial<IActivity> {
  time?: Date;
}

export interface IComment {
  id: string;
  createAt: Date;
  body: string;
  userName: string;
  displayName: string;
  image: string;
}

export class ActivityFormValues implements IActivityFormValues {
  id?: string = undefined;
  title: string = '';
  category: string = '';
  description: string = '';
  date?: Date = undefined;
  time?: Date = undefined;
  city: string = '';
  venue: string = '';

  constructor(init?: IActivityFormValues) {
    if (init && init.date) {
      // Do NOT FUCKING CHANGE OBJECT OUTSIDE MOBX
      //init.time=init.date
      this.time = init.date;
    }
    Object.assign(this, init);
  }
}

export interface IAttendee {
  userName: string;
  displayName: string;
  image: string;
  isHost: boolean;
  following?: boolean;
}
