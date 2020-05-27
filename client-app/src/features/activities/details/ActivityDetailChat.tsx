import React, { Fragment, useContext, useEffect } from 'react';
import { Segment, Header, Form, Button, Comment } from 'semantic-ui-react';
import { RootStoreContext } from '../../../app/stores/rootStore';
import { Form as FinalForm, Field } from 'react-final-form';
import { Link } from 'react-router-dom';
import TextAreaInput from '../../../app/common/form/TextAreaInput';
import { observer } from 'mobx-react-lite';
import { formatDistance, parseISO } from 'date-fns';

const ActivityDetailChat = () => {
  const rootStore = useContext(RootStoreContext);
  const {
    createHubConnection,
    stopHubConnection,
    addComment,
    selectedActivity,
  } = rootStore.activityStore;

  useEffect(() => {
    createHubConnection();
    return () => {
      stopHubConnection();
    };
  }, [createHubConnection, stopHubConnection]);

  return (
    <Fragment>
      <Segment textAlign='center' attached='top' inverted color='teal' style={{ border: 'none' }}>
        <Header>Chat about this event</Header>
      </Segment>
      <Segment attached>
        <Comment.Group>
          {selectedActivity &&
            selectedActivity.comments &&
            selectedActivity.comments.map((comment) => (
              <Comment key={comment.id}>
                <Comment.Avatar src={comment.image || '/assets/user.png'} />
                <Comment.Content>
                  <Comment.Author as={Link} to={`/profiles/${comment.userName}`}>
                    {comment.displayName}
                  </Comment.Author>
                  <Comment.Metadata>
                    <div>{formatDistance(parseISO(comment.createAt.toString()), new Date())}</div>
                  </Comment.Metadata>
                  <Comment.Text>{comment.body}</Comment.Text>
                  {/* <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                  </Comment.Actions> */}
                </Comment.Content>
              </Comment>
            ))}

          <FinalForm
            onSubmit={addComment}
            render={({ handleSubmit, submitting, form }) => (
              <Form onSubmit={() => handleSubmit()!.then(() => form.reset())}>
                <Field
                  name='body'
                  component={TextAreaInput}
                  row='2'
                  placeholder='Add your comment'
                />
                <Button
                  content='Add Reply'
                  labelPosition='left'
                  icon='edit'
                  primary
                  loading={submitting}
                />
              </Form>
            )}
          ></FinalForm>
        </Comment.Group>
      </Segment>
    </Fragment>
  );
};

export default observer(ActivityDetailChat);
