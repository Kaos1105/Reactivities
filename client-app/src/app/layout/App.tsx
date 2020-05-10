import React, { Fragment, useContext, useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Route, withRouter, RouteComponentProps, Switch } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import NotFound from './NotFound';
import { ToastContainer } from 'react-toastify';
import { RootStoreContext } from '../stores/rootStore';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../../features/profiles/ProfilePage';

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
const App: React.FC<RouteComponentProps> = ({ location }) => {
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
  const rootStore = useContext(RootStoreContext);
  const { setAppLoaded, token, appLoaded } = rootStore.commonStore;
  const { getUser } = rootStore.userStore;

  //get user from token when refresh App.tsx or re-render App.tsx
  useEffect(() => {
    if (token) {
      getUser().finally(() => setAppLoaded());
    } else {
      setAppLoaded();
    }
  }, [getUser, setAppLoaded, token]);

  if (!appLoaded) return <LoadingComponent content='Loading app...' />;

  return (
    <Fragment>
      <ModalContainer />
      <Route exact path='/' component={HomePage} />
      <Route
        path={'/(.+)'}
        render={() => (
          <Fragment>
            <ToastContainer position='top-center' />
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <Route exact path='/activities' component={ActivityDashboard} />
                <Route path='/activities/:id' component={ActivityDetails} />
                <Route
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
                <Route path='/profiles/:username' component={ProfilePage} />
                <Route component={NotFound} />
              </Switch>
            </Container>
          </Fragment>
        )}
      />
    </Fragment>
  );
};
export default withRouter(observer(App));
