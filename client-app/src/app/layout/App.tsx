import React, { useEffect, Fragment, useContext } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import { observer } from 'mobx-react-lite';

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
  const activityStore = useContext(ActivityStore);
  //#region React Hook Props
  //useState returns a pair: the current state value and a function that lets you update it. Current value is default initial value
  //can not mutate state directly, instead using getter
  // const [activities, setActivities] = useState<IActivity[]>([]);
  // const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null);
  // const [editMode, setEditMode] = useState(false);
  // const [loading, setLoading] = useState(true);
  // const [submitting, setSubmitting] = useState(false);
  // const [target, setTarget] = useState('');
  //#endregion

  // Similar to componentDidMount and componentDidUpdate:
  // first parameter is componentDidMount, second is componentDidUpdate
  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);

  if (activityStore.loadingInitial) return <LoadingComponent content={'Loading component...'} />;

  return (
    <Fragment>
      <NavBar />
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
};
export default observer(App);
