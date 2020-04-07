import React from 'react';
import { Grid } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
import ActivityList from './ActivityList';
import ActivityDetails from '../details/ActivityDetails';
import ActivityForm from '../form/ActivityForm';

//pass down props from parent
interface IProps {
  activities: IActivity[];
  selectedActivity: IActivity | null;
  setSelectedActivity: (activity: IActivity | null) => void;
  selectActivity: (id: string) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  createActivity: (activity: IActivity) => void;
  editActivity: (activity: IActivity) => void;
  deleteActivity: (id: string) => void;
}

const ActivityDashboard: React.FC<IProps> = ({
  activities,
  selectActivity,
  selectedActivity,
  editMode,
  setEditMode,
  setSelectedActivity,
  createActivity,
  editActivity,
  deleteActivity,
}) => {
  return (
    <Grid>
      <Grid.Column width='10'>
        {
          // <List>
          //   {activities.map((activity) => (
          //     <List.Item key={activity.id}>{activity.title}</List.Item>
          //   ))}
          // </List>
          <ActivityList
            activities={activities}
            selectActivity={selectActivity}
            deleteActivity={deleteActivity}
          ></ActivityList>
        }
      </Grid.Column>
      <Grid.Column width='6'>
        {/* only render if selectedActivity is not null */}
        {selectedActivity && !editMode && (
          <ActivityDetails
            activity={selectedActivity}
            setEditMode={setEditMode}
            setSelectedActivity={setSelectedActivity}
          ></ActivityDetails>
        )}
        {editMode && (
          <ActivityForm
            //Keys help React identify which items have changed so that will re-render
            key={(selectedActivity && selectedActivity.id) || 0}
            setEditMode={setEditMode}
            activity={selectedActivity}
            createActivity={createActivity}
            editActivity={editActivity}
          ></ActivityForm>
        )}
      </Grid.Column>
    </Grid>
  );
};

export default ActivityDashboard;
