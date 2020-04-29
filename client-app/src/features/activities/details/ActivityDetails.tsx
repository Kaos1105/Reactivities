import React, { useContext, useEffect } from 'react';
import { Grid, GridColumn } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router-dom';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import ActivityDetailHeader from './ActivityDetailHeader';
import ActivityDetailInfo from './ActivityDetailInfo';
import ActivityDetailChat from './ActivityDetailChat';
import ActivityDetailSidebar from './ActivityDetailSidebar';
import { RootStoreContext } from '../../../app/stores/rootStore';

interface DetailParams {
  id: string;
}

const ActivityDetails: React.FC<RouteComponentProps<DetailParams>> = ({ match, history }) => {
  const rootStore = useContext(RootStoreContext);
  const { selectedActivity: activity, loadActivity, loadingInitial } = rootStore.activityStore;
  useEffect(() => {
    loadActivity(match.params.id);
  }, [loadActivity, match.params.id, history]);

  if (loadingInitial) return <LoadingComponent content='Loading activity...' />;
  if (!activity) return <h2>Activity not found</h2>;

  return (
    //#region Old Detail
    // <Card fluid>
    //   <Image src={`/assets/categoryImages/${activity!.category}.jpg`} wrapped ui={false} />
    //   <Card.Content>
    //     <Card.Header>{activity!.title}</Card.Header>
    //     <Card.Meta>
    //       <span>{activity!.date}</span>
    //     </Card.Meta>
    //     <Card.Description>{activity!.description}</Card.Description>
    //   </Card.Content>
    //   <Card.Content extra>
    //     <Button.Group widths='2'>
    //       <Button as={Link} to={`/manage/${activity.id}`} basic color='blue' content='Edit' />
    //       {/* <Button onClick={cancelSelectedActivity} basic color='grey' content='Cancel' /> */}
    //       <Button onClick={() => history.push('/activities')} basic color='grey' content='Cancel' />
    //     </Button.Group>
    //   </Card.Content>
    // </Card>
    //#endregion
    <Grid>
      <GridColumn width={10}>
        <ActivityDetailHeader activity={activity} />
        <ActivityDetailInfo activity={activity} />
        <ActivityDetailChat />
      </GridColumn>
      <GridColumn width={6}>
        <ActivityDetailSidebar attendees={activity.attendees} />
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityDetails);
