import React, { useState, useEffect, Fragment } from 'react';
import { Container } from 'semantic-ui-react';
import axios from 'axios';
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';

//------------React Normal class component---------
//#region Class component
// interface IState {
//   activities: IActivity[];
// }

// class App extends Component<{}, IState> {
//   readonly state: IState = {
//     activities: [],
//   };

//   componentDidMount() {
//     axios
//       .get<IActivity[]>("https://localhost:5001/api/Activities")
//       .then((response) => {
//         this.setState({
//           activities: response.data,
//         });
//       });
//   }

//   render() {
//     return (
//       <div>
//         <Header as="h2">
//           <Icon name="users" />
//           <Header.Content>Reactivities</Header.Content>
//         </Header>
//         <List>
//           {this.state.activities.map((activity) => (
//             <List.Item key={activity.id}>{activity.title}</List.Item>
//           ))}
//         </List>
//       </div>
//     );
//   }
// }
//#endregion

//------------React Hook--------------------------
const App = () => {
  //useState returns a pair: the current state value and a function that lets you update it. Current value is default initial value
  //can not mutate state directly, instead using getter
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleSelectedActivity = (id: string) => {
    setSelectedActivity(activities.filter((a) => a.id === id)[0]);
    setEditMode(false);
  };

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  };

  const handleCreateActivity = (activity: IActivity) => {
    //spread operator: [activities[1]....activities[n], activity]
    setActivities([...activities, activity]);
    //setActivities(activities => activities.concat(activity))

    //use callback function to setState if there are async code
    //setActivities((activities) => [...activities, activity]);

    setSelectedActivity(activity);
    setEditMode(false);
  };

  const handleEditActivity = (activity: IActivity) => {
    //remove old activity and add new edited activity
    setActivities([...activities.filter((a) => a.id !== activity.id), activity]);
    setSelectedActivity(activity);
    setEditMode(false);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities([...activities.filter((a) => a.id !== id)]);
  };

  // Similar to componentDidMount and componentDidUpdate:
  // first parameter is componentDidMount, second is componentDidUpdate
  useEffect(() => {
    axios.get<IActivity[]>('https://localhost:5001/api/Activities').then((response) => {
      let activities: IActivity[] = [];
      response.data.forEach((activity) => {
        activity.date = activity.date.split('.')[0];
        activities.push(activity);
      });
      setActivities(activities);
    });
  }, []);

  return (
    <Fragment>
      <NavBar openCreateForm={handleOpenCreateForm} />
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard
          activities={activities}
          selectActivity={handleSelectedActivity}
          selectedActivity={selectedActivity}
          editMode={editMode}
          setEditMode={setEditMode}
          setSelectedActivity={setSelectedActivity}
          createActivity={handleCreateActivity}
          editActivity={handleEditActivity}
          deleteActivity={handleDeleteActivity}
        />
      </Container>
    </Fragment>
  );
};
export default App;
