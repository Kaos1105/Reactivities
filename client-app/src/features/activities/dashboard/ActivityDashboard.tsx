import React, { useContext, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import ActivityStore from '../../../app/stores/activityStore';

//pass down props from parent

const ActivityDashboard: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  // Similar to componentDidMount and componentDidUpdate:
  // first parameter is componentDidMount, second is componentDidUpdate with return similar to componentUnMount
  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);

  if (activityStore.loadingInitial) return <LoadingComponent content={'Loading component...'} />;

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
        {/* {selectedActivity && !editMode && <ActivityDetails />}
        {editMode && (
          <ActivityForm
            //Keys help React identify which items have changed so that will re-render
            key={(selectedActivity && selectedActivity.id) || 0}
          />
        )} */}
        <h2>Activity</h2>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);
