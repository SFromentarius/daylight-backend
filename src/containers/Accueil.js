import React from 'react';

import { db } from '../components/Firebase/firebase';

import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Modal from '@material-ui/core/Modal';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import HomeList from '../components/HomeList';
import QuizConfigModal from '../components/QuizConfigModal';
import QuestionsConfigModal from '../components/QuestionsConfigModal';

const HeadContainer = styled(Container)({
  paddingTop: 20
});

const ScrollableModal = styled(Modal)({
  overflow: 'scroll'
});

class Accueil extends React.Component {
  state = {
    selectedTab: 0,
    openModalConfig: false,
    actualQuiz: null,
    quizAll: [],
    questionsAll: [],
    quizDataSend: false,
    questionsDataSend: false,
    actualQuestionsSource: null,
    openQuestionsConfig: false,
    quizSpinner: false,
    questionsSpinner: false
  };

  handleChange = (event, newValue) => {
    if (newValue === 0) {
      this.updateQuizAll();
    } else if (newValue === 1) {
      this.updateQuestionsAll();
    }
    this.setState({ selectedTab: newValue });
  };

  handleClick = (data, isQuestionList) => {
    if (isQuestionList) {
      this.setState({ openQuestionsConfig: true, actualQuestionsSource: data });
    } else if (!isQuestionList) {
      this.setState({ openModalConfig: true, actualQuiz: data });
    }
  };

  handleCloseModal = type => {
    switch (type) {
      case 'config':
        this.setState({ openModalConfig: false });
        break;
      case 'questions':
        this.setState({ openQuestionsConfig: false });
        break;
      default:
        return;
    }
    this.updateQuizAll();
    this.updateQuestionsAll();
  };

  handleSnackbarClose = (event, type) => {
    // if (reason === 'clickaway') {
    //   return;
    // }
    this.switchDataSend(type);
  };

  switchDataSend = type => {
    switch (type) {
      case 'quiz':
        this.setState({ quizDataSend: !this.state.quizDataSend });
        break;
      case 'questions':
        this.setState({ questionsDataSend: !this.state.questionsDataSend });
        break;
      default:
        return;
    }
  };

  updateQuizAll = () => {
    this.setState(
      { quizAll: [], quizSpinner: true },

      function() {
        db.collection('quiz')
          .orderBy('config.quiz_id', 'asc')
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(quiz => {
              const quizAll = this.state.quizAll.concat(quiz.data());
              this.setState({ quizAll, quizSpinner: false });
            });
          });
      }
    );
  };

  updateQuestionsAll = () => {
    this.setState(
      { questionsAll: [], questionsSpinner: true },

      function() {
        db.collection('questions')
          .orderBy('questions_id', 'asc')
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(question => {
              const questionsAll = this.state.questionsAll.concat(
                question.data()
              );
              this.setState({ questionsAll, questionsSpinner: false });
            });
          });
      }
    );
  };

  componentDidMount() {
    if (this.state.selectedTab === 0) {
      this.updateQuizAll();
    } else if (this.state.selectedTab === 1) {
      this.updateQuestionsAll();
    }
    // this.updateQuizAll();
    // this.updateQuestionsAll();
  }

  render() {
    const { selectedTab } = this.state;
    return (
      <React.Fragment>
        <HeadContainer maxWidth='md'>
          <Typography
            component='h1'
            variant='h2'
            align='center'
            color='textPrimary'
            gutterBottom
          >
            QUIZ MAKER
          </Typography>
          <Typography
            variant='h5'
            align='center'
            color='textSecondary'
            paragraph
          >
            Cette interface vous permet d'éditer vos quiz en temps réel.
          </Typography>
        </HeadContainer>

        <Tabs
          value={selectedTab}
          onChange={this.handleChange}
          centered={true}
          textColor='primary'
        >
          <Tab label='Quiz' />
          <Tab label='Sources' />
        </Tabs>

        {/* QUIZ CONFIG MODAL */}
        <ScrollableModal
          aria-labelledby='Quiz Config modal'
          aria-describedby='Modal pour configurer le quiz'
          open={this.state.openModalConfig}
          onClose={() => this.handleCloseModal('config')}
        >
          {/* DialogContent here to prevent error of tabIndex (https://stackoverflow.com/questions/53951479/react-material-ui-modal-causing-an-error-with-the-tabindex) */}
          {/* <DialogContent> */}
          <QuizConfigModal
            quiz={this.state.actualQuiz}
            questionsAll={this.state.questionsAll}
            handleCloseModal={this.handleCloseModal}
            switchDataSend={() => this.switchDataSend('quiz')}
          />
          {/* </DialogContent> */}
        </ScrollableModal>

        {/* QUESTIONS MODAL */}
        <ScrollableModal
          aria-labelledby='Questions Config modal'
          aria-describedby='Modal pour configurer les sources de questions'
          open={this.state.openQuestionsConfig}
          onClose={() => this.handleCloseModal('questions')}
        >
          {/* <DialogContent> */}
          <QuestionsConfigModal
            actualQuestionsSource={this.state.actualQuestionsSource}
            //questionsAll={this.state.questionsAll}
            handleCloseModal={this.handleCloseModal}
            switchDataSend={() => this.switchDataSend('questions')}
          />
          {/* </DialogContent> */}
        </ScrollableModal>
        {selectedTab === 0 && (
          <Container maxWidth='md'>
            <HomeList
              handleClick={this.handleClick}
              data={this.state.quizAll}
              //questionsAll={this.state.questionsAll}
              isQuestionList={false}
              updateQuizAll={this.updateQuizAll} //todo, in child component
              quizSpinner={this.state.quizSpinner}
            />
          </Container>
        )}
        {selectedTab === 1 && (
          <Container maxWidth='md'>
            <HomeList
              handleClick={this.handleClick}
              data={this.state.questionsAll}
              //questionsAll={this.state.questionsAll}
              isQuestionList={true}
              updateQuestionsAll={this.updateQuestionsAll}
              length={this.state.questionsAll.length}
              questionsSpinner={this.state.questionsSpinner}
            />
          </Container>
        )}

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.quizDataSend}
          autoHideDuration={4000}
          onClose={e => this.handleSnackbarClose(e, 'quiz')}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={<span id='message-id'>Configuration sauvegardée !</span>}
          action={[
            <IconButton
              key='close'
              aria-label='Fermer'
              color='inherit'
              onClick={e => this.handleSnackbarClose(e, 'quiz')}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.questionsDataSend}
          autoHideDuration={4000}
          onClose={e => this.handleSnackbarClose(e, 'questions')}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <span id='message-id'>Source de questions sauvegardée !</span>
          }
          action={[
            <IconButton
              key='close'
              aria-label='Fermer'
              color='inherit'
              onClick={e => this.handleSnackbarClose(e, 'questions')}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </React.Fragment>
    );
  }
}

export default Accueil;
