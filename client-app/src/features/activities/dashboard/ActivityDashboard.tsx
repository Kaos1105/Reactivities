import React, { useContext } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import ActivityDetails from '../details/ActivityDetails';
import ActivityForm from '../form/ActivityForm';
import { observer } from 'mobx-react-lite';
import ActivityStore from '../../../app/stores/activityStore';

//pass down props from parent

const ActivityDashboard: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  const { editMode, selectedActivity } = activityStore;
  return (
    <Grid>
      <Grid.Column width='10'>
        {
          // <List>
          //   {activities.map((activity) => (
          //     <List.Item key={activity.id}>{activity.title}</List.Item>
          //   ))}
          // </List>
          <ActivityList />
        }
      </Grid.Column>
      <Grid.Column width='6'>
        {/* only render if selectedActivity is not null */}
        {selectedActivity && !editMode && <ActivityDetails />}
        {editMode && (
          <ActivityForm
            //Keys help React identify which items have changed so that will re-render
            key={(selectedActivity && selectedActivity.id) || 0}
          />
        )}
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);
