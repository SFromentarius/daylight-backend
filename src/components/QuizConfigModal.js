import React from 'react';

import { db } from '../components/Firebase/firebase';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import SaveIcon from '@material-ui/icons/Save';

const ModalContainer = styled(Container)({
  backgroundColor: 'white',
  minHeight: '500px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  position: 'fixed',
  maxWidth: '90%',
  paddingRight: '90px',
  //
  overflowY: 'scroll',
  overflowX: 'visible',
  height: '88%'
});

const MarginTopGrid = styled(Grid)({
  marginTop: 16
});

const WithMarginTypography = styled(Typography)({
  marginTop: 16
});

const FixedHeightGrid = styled(Grid)({
  height: 70,
  position: 'relative'
});

const FixedGrid = styled(Grid)({
  marginTop: 12,
  height: 70,
  position: 'relative'
});

const BackgroundContainer = styled(Container)({
  margin: '20px 0',
  paddingTop: '20px',
  paddingBottom: '30px',
  backgroundColor: 'rgba(243, 144, 0, 0.1)',
  maxWidth: 'none'
});

const StyledWidthFormControl = styled(FormControl)({
  width: '830px'
});

const StyledFormControlLabel = styled(FormControlLabel)({
  bottom: 0, //12px
  position: 'absolute'
});

const SaveButton = styled(Button)({
  position: 'sticky',
  bottom: '47%',
  left: '100%',
  //transform: 'translate(886px, 0px)',
  transform: 'translate(85px, 0px)',

  height: '80px',
  width: '80px',
  borderRadius: '50%'
});

export default class QuizConfigModal extends React.Component {
  state = {
    SubLines: [],
    quiz_id: 0,
    passScore: 0,
    quiz_time: 0,
    setShuffle: false,
    quiz_title: '',
    quiz_title2: '',
    pauseButton: false,
    chronoButton: false,
    questionsSetId: 0,
    shuffledAnswers: false,
    showResultConfig: false,
    quiz_n_questions: 0,
    // quiz_n_questionsMax: 0,
    answers_file_name: '',
    question_file_name: '',
    selectedQuestionSet: {}
  };

  setQuestionSet = () => {
    db.collection('questions')
      .where('questions_id', '==', this.state.questionsSetId)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(question => {
          this.setState({ selectedQuestionSet: question.data() });
        });
      });
  };

  componentDidMount = () => {
    const quiz = this.props.quiz.config;
    this.setState(
      {
        quiz_id: quiz.quiz_id,
        SubLines: quiz.SubLines,
        passScore: quiz.passScore,
        quiz_time: quiz.quiz_time,
        setShuffle: quiz.setShuffle,
        quiz_title: quiz.quiz_title,
        quiz_title2: quiz.quiz_title2,
        pauseButton: quiz.pauseButton,
        chronoButton: quiz.chronoButton,
        questionsSetId: quiz.questionsSetId,
        shuffledAnswers: quiz.shuffledAnswers,
        quiz_n_questions: quiz.quiz_n_questions,
        showResultConfig: quiz.showResultConfig,
        answers_file_name: quiz.answers_file_name,
        question_file_name: quiz.question_file_name
        //quiz_n_questionsMax: quiz.quiz_n_questionsMax
      },
      this.setQuestionSet
    );
  };

  onTextChange(value, index) {
    const SubLinesStep = [...this.state.SubLines];
    SubLinesStep[index] = value;
    this.setState({ SubLines: SubLinesStep });
  }

  onCheckBoxChange(type) {
    switch (type) {
      case 'setShuffle':
        this.setState({ setShuffle: !this.state.setShuffle });
        break;
      case 'chronoButton':
        this.setState({ chronoButton: !this.state.chronoButton });
        break;
      case 'pauseButton':
        this.setState({ pauseButton: !this.state.pauseButton });
        break;
      case 'showResultConfig':
        this.setState({ showResultConfig: !this.state.showResultConfig });
        break;
      case 'shuffledAnswers':
        this.setState({ shuffledAnswers: !this.state.shuffledAnswers });
        break;
      default:
        return;
    }
  }

  onValueChange(value, type) {
    switch (type) {
      case 'quiz_time':
        this.setState({ quiz_time: value });
        break;
      // case 'quiz_n_questionsMax':
      //   this.setState({ quiz_n_questionsMax: value });
      //   break;
      case 'quiz_n_questions':
        this.setState({ quiz_n_questions: value });
        break;
      case 'passScore':
        this.setState({ passScore: value });
        break;
      default:
        return;
    }
  }

  handleSaveConfig = () => {
    const quiz = this.props.quiz.config;

    db.collection('quiz')
      .doc(quiz.quiz_id.toString())
      .get()
      .then(async () => {
        // peupler configPre et configPost !!-> change selon quiz_id (attention méthode à revoir à terme)
        //if pre quiz
        if (quiz.quiz_id.toString().length === 1 || 2) {
          await db
            .collection('quiz')
            .doc(quiz.quiz_id.toString())
            .set({
              configPre: {
                quiz_id: this.state.quiz_id,
                SubLines: this.state.SubLines,
                passScore: this.state.passScore,
                quiz_time: this.state.quiz_time,
                setShuffle: this.state.setShuffle,
                quiz_title: this.state.quiz_title,
                quiz_title2: this.state.quiz_title2,
                pauseButton: this.state.pauseButton,
                chronoButton: this.state.chronoButton,
                showResultConfig: this.state.showResultConfig,
                quiz_n_questions: this.state.quiz_n_questions,
                answers_file_name: this.state.answers_file_name,
                question_file_name: this.state.question_file_name
                //quiz_n_questionsMax: this.state.quiz_n_questionsMax
              },
              config: {
                quiz_id: this.state.quiz_id,
                SubLines: this.state.SubLines,
                passScore: this.state.passScore,
                quiz_time: this.state.quiz_time,
                setShuffle: this.state.setShuffle,
                quiz_title: this.state.quiz_title,
                quiz_title2: this.state.quiz_title2,
                pauseButton: this.state.pauseButton,
                chronoButton: this.state.chronoButton,
                showResultConfig: this.state.showResultConfig,
                quiz_n_questions: this.state.quiz_n_questions,
                answers_file_name: this.state.answers_file_name,
                question_file_name: this.state.question_file_name,
                //quiz_n_questionsMax: this.state.quiz_n_questionsMax,

                shuffledAnswers: this.state.shuffledAnswers,
                questionsSetId: this.state.questionsSetId
              },
              configPost: this.props.quiz.configPost || this.props.quiz.config
            })
            .then(function() {
              //console.log('Document successfully written!');
            })
            .catch(function(error) {
              //console.error('Error writing document: ', error);
              return;
            });
        } //if post quiz
        else if (quiz.quiz_id.toString().length === 3) {
          await db
            .collection('quiz')
            .doc(quiz.quiz_id.toString())
            .set({
              configPost: {
                quiz_id: this.state.quiz_id,
                SubLines: this.state.SubLines,
                passScore: this.state.passScore,
                quiz_time: this.state.quiz_time,
                setShuffle: this.state.setShuffle,
                quiz_title: this.state.quiz_title,
                quiz_title2: this.state.quiz_title2,
                pauseButton: this.state.pauseButton,
                chronoButton: this.state.chronoButton,
                showResultConfig: this.state.showResultConfig,
                quiz_n_questions: this.state.quiz_n_questions,
                answers_file_name: this.state.answers_file_name,
                question_file_name: this.state.question_file_name
                //quiz_n_questionsMax: this.state.quiz_n_questionsMax
              },
              config: {
                quiz_id: this.state.quiz_id,
                SubLines: this.state.SubLines,
                passScore: this.state.passScore,
                quiz_time: this.state.quiz_time,
                setShuffle: this.state.setShuffle,
                quiz_title: this.state.quiz_title,
                quiz_title2: this.state.quiz_title2,
                pauseButton: this.state.pauseButton,
                chronoButton: this.state.chronoButton,
                showResultConfig: this.state.showResultConfig,
                quiz_n_questions: this.state.quiz_n_questions,
                answers_file_name: this.state.answers_file_name,
                question_file_name: this.state.question_file_name,
                //quiz_n_questionsMax: this.state.quiz_n_questionsMax,

                shuffledAnswers: this.state.shuffledAnswers,
                questionsSetId: this.state.questionsSetId
              },
              configPre: this.props.quiz.configPre || this.props.quiz.config
            })
            .then(function() {
              //console.log('Document successfully written!');
            })
            .catch(function(error) {
              //console.error('Error writing document: ', error);
              return;
            });
        }
        this.props.switchDataSend();
        this.props.handleCloseModal('config');
      });
  };

  render() {
    const {
      SubLines,
      quiz_time,
      passScore,
      setShuffle,
      quiz_title,
      quiz_title2,
      pauseButton,
      chronoButton,
      questionsSetId,
      shuffledAnswers,
      showResultConfig,
      quiz_n_questions,
      //quiz_n_questionsMax,
      selectedQuestionSet
    } = this.state;

    return (
      <React.Fragment>
        <ModalContainer>
          <BackgroundContainer>
            <TextField
              id='quiz-title'
              label='Titre du Quiz'
              value={quiz_title}
              onChange={e => this.setState({ quiz_title: e.target.value })}
              margin='normal'
              fullWidth={true}
            />
            <TextField
              id='quiz-title2'
              label='Sous-titre du Quiz'
              value={quiz_title2}
              onChange={e => this.setState({ quiz_title2: e.target.value })}
              margin='normal'
              fullWidth={true}
            />
            {SubLines && (
              <WithMarginTypography
                variant='caption'
                color='textSecondary'
                display='block'
              >
                Texte d'introduction
              </WithMarginTypography>
            )}
            {SubLines &&
              SubLines.map((line, index) => {
                return (
                  <TextField
                    key={index}
                    id='SubLines'
                    multiline
                    value={line}
                    onChange={e => this.onTextChange(e.target.value, index)}
                    margin='none'
                    fullWidth={true}
                  />
                );
              })}

            <MarginTopGrid container spacing={3}>
              <FixedHeightGrid item xs={4}>
                <StyledFormControlLabel
                  control={<Checkbox color='primary' />}
                  label='Affichage aléatoire des questions'
                  labelPlacement='start'
                  checked={setShuffle}
                  onChange={() => this.onCheckBoxChange('setShuffle')}
                />
              </FixedHeightGrid>
            </MarginTopGrid>
            <Grid container spacing={3}>
              <FixedHeightGrid item xs={4}>
                <StyledFormControlLabel
                  control={<Checkbox color='primary' />}
                  label='Minuteur'
                  labelPlacement='start'
                  checked={chronoButton}
                  onChange={() => this.onCheckBoxChange('chronoButton')}
                />
              </FixedHeightGrid>
              {chronoButton && (
                <React.Fragment>
                  <FixedHeightGrid item xs={4}>
                    <TextField
                      fullWidth={true}
                      id='quiz_time'
                      label='Durée du quiz (min)'
                      value={quiz_time}
                      onChange={e =>
                        this.onValueChange(
                          parseInt(e.target.value),
                          'quiz_time'
                        )
                      }
                      type='number'
                      margin='none'
                    />
                  </FixedHeightGrid>
                  <FixedHeightGrid item xs={4}>
                    <StyledFormControlLabel
                      control={<Checkbox color='primary' />}
                      label='Pause'
                      labelPlacement='start'
                      checked={pauseButton}
                      onChange={() => this.onCheckBoxChange('pauseButton')}
                    />
                  </FixedHeightGrid>
                </React.Fragment>
              )}
            </Grid>
            <Grid container spacing={3}>
              <FixedHeightGrid item xs={4}>
                <StyledFormControlLabel
                  control={<Checkbox color='primary' />}
                  label='Masquer les réponses'
                  labelPlacement='start'
                  checked={showResultConfig}
                  onChange={() => this.onCheckBoxChange('showResultConfig')}
                />
              </FixedHeightGrid>
              <FixedHeightGrid item xs={4}>
                <StyledFormControlLabel
                  control={<Checkbox color='primary' />}
                  label='Ordre aléatoire des réponses'
                  labelPlacement='start'
                  checked={shuffledAnswers}
                  onChange={() => this.onCheckBoxChange('shuffledAnswers')}
                />
              </FixedHeightGrid>
            </Grid>
          </BackgroundContainer>

          <BackgroundContainer>
            <StyledWidthFormControl>
              <InputLabel>Sources de données</InputLabel>
              <Select
                value={questionsSetId}
                onChange={e =>
                  this.setState(
                    { questionsSetId: e.target.value },
                    this.setQuestionSet
                  )
                }
                // inputProps={{
                //   name: 'age',
                //   id: 'age-simple',
                // }}
              >
                {this.props.questionsAll &&
                  this.props.questionsAll.map((questions, index) => {
                    return (
                      <MenuItem key={index} value={questions.questions_id}>
                        {questions.questions_name}
                      </MenuItem>
                    );
                  })}
              </Select>
            </StyledWidthFormControl>
            <Grid container spacing={3}>
              <FixedGrid item xs={4}>
                <Typography variant='caption' color='textSecondary'>
                  Nombre de questions total
                </Typography>
                <Typography>
                  {selectedQuestionSet.quizQuestionList &&
                    selectedQuestionSet.quizQuestionList.length}
                </Typography>
              </FixedGrid>
              <FixedHeightGrid item xs={4}>
                <TextField
                  fullWidth={true}
                  id='quiz-questions'
                  label='Nombre de questions à afficher'
                  // error={
                  //   quiz_n_questions >
                  //   selectedQuestionSet.quizQuestionList.length
                  // }
                  value={quiz_n_questions}
                  onChange={e =>
                    this.onValueChange(
                      parseInt(e.target.value),
                      'quiz_n_questions'
                    )
                  }
                  type='number'
                  margin='normal'
                />
              </FixedHeightGrid>
              <FixedHeightGrid item xs={4}>
                <TextField
                  fullWidth={true}
                  id='quiz-questions'
                  label='Seuil de succès'
                  // error={passScore > quiz_n_questions}
                  value={passScore}
                  onChange={e =>
                    this.onValueChange(parseInt(e.target.value), 'passScore')
                  }
                  type='number'
                  margin='normal'
                />
              </FixedHeightGrid>
            </Grid>
          </BackgroundContainer>

          <SaveButton
            variant='contained'
            color='secondary'
            size='large'
            onClick={this.handleSaveConfig}
          >
            <SaveIcon />
            Save
          </SaveButton>
        </ModalContainer>
      </React.Fragment>
    );
  }
}
