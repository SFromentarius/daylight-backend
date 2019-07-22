import React from 'react';
// import styled from 'styled-components';
import Img from 'react-image';
import firebase from 'firebase';
import FileUploader from 'react-firebase-file-uploader';
import { storage } from './Firebase/firebase';

import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { Typography } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import FormLabel from '@material-ui/core/FormLabel';
//import { styled } from '@material-ui/core/styles';
import * as styledMU from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Popover from '@material-ui/core/Popover';

import DeleteIcon from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const MaxImage = styledMU.styled(Img)`
  width: 100%;
  height: 100%;
`;

const BackgroundContainer = styledMU.styled(Container)({
  //margin: '20px 0',
  paddingTop: '20px',
  paddingBottom: '30px',
  backgroundColor: 'rgba(243, 144, 0, 0.1)',
  maxWidth: 'none'
});

const CenterContentGrid = styledMU.styled(Grid)({
  width: 168,
  height: 177,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column'
});

const PaddingTypography = styledMU.styled(Typography)({
  paddingRight: 10
});

export default class EditQuestion extends React.Component {
  state = {
    answers: [],
    feedback: '',
    possibilities: [],
    question_id: 0,
    question_prequel: '',
    //
    progressQB: 0, //Question Begin
    progressQE: 0, //Question End
    isUploadingQB: false,
    isUploadingQE: false,
    openQuestionDelete: false,
    openReponseDelete: false,
    //
    imageURLQB: '',
    imageURLQE: '',
    imageNameQB: '',
    imageNameQE: '',
    //
    openPopoverEnonce: false,
    openPopoverExplication: false
  };

  componentDidMount = () => {
    this.setQuestion();
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (nextProps.question.question_id === prevState.question_id) {
      return null;
    }
    const { question } = nextProps;
    return {
      answers: question.answers,
      feedback: question.feedback,
      possibilities: question.possibilities,
      question_id: question.question_id,
      question_prequel: question.question_prequel,
      imageURLQB: question.imageURLQB,
      imageURLQE: question.imageURLQE,
      imageNameQB: question.imageNameQB,
      imageNameQE: question.imageNameQE
    };
  };
  // ANOTHER METHOD TO UPDATE STATE DEPENDING ON PROPS, BUT getDerivedStateFromProps SEEMS BETTER AT PERFORMANCE
  // see here https://twitter.com/dan_abramov/status/977181473424932864?lang=fr
  //   componentDidUpdate = prevProps => {
  //     //necessary for delete question to work
  //     if (prevProps.question.question_id !== this.props.question.question_id) {
  //       this.setQuestion();
  //     }
  //   };

  setQuestion = () => {
    const { question } = this.props;
    this.setState({
      answers: question.answers,
      feedback: question.feedback,
      possibilities: question.possibilities,
      question_id: question.question_id,
      question_prequel: question.question_prequel,
      imageURLQB: question.imageURLQB,
      imageURLQE: question.imageURLQE,
      imageNameQB: question.imageNameQB,
      imageNameQE: question.imageNameQE
    });
  };

  getQuestionObject = () => {
    return {
      answers: this.state.answers,
      feedback: this.state.feedback,
      possibilities: this.state.possibilities,
      question_id: this.state.question_id,
      question_prequel: this.state.question_prequel,
      imageURLQB: this.state.imageURLQB,
      imageURLQE: this.state.imageURLQE,
      imageNameQB: this.state.imageNameQB,
      imageNameQE: this.state.imageNameQE
    };
  };

  //QB
  handleUploadStartQB = () =>
    this.setState({ isUploadingQB: true, progressQB: 0 });
  handleProgressQB = progressQB => this.setState({ progressQB });
  handleUploadErrorQB = error => {
    this.setState({ isUploadingQB: false });
    console.error(error);
  };
  handleUploadSuccessQB = filename => {
    this.setState({
      imageNameQB: filename,
      progressQB: 100,
      isUploadingQB: false
    });
    firebase
      .storage()
      .ref(this.props.questions_id.toString())
      .child(filename)
      .getDownloadURL()
      .then(url =>
        this.setState({ imageURLQB: url, progressQB: 0 }, () =>
          this.props.saveQuestionLocalChange(
            this.getQuestionObject(),
            this.props.number
          )
        )
      );
  };

  //QE
  handleUploadStartQE = () =>
    this.setState({ isUploadingQE: true, progressQE: 0 });
  handleProgressQE = progressQE => this.setState({ progressQE });
  handleUploadErrorQE = error => {
    this.setState({ isUploadingQE: false });
    console.error(error);
  };
  handleUploadSuccessQE = filename => {
    this.setState({
      imageNameQE: filename,
      progressQE: 100,
      isUploadingQE: false
    });
    firebase
      .storage()
      .ref(this.props.questions_id.toString())
      .child(filename)
      .getDownloadURL()
      .then(url =>
        this.setState({ imageURLQE: url, progressQE: 0 }, () =>
          this.props.saveQuestionLocalChange(
            this.getQuestionObject(),
            this.props.number
          )
        )
      );
  };

  onTextChange = (value, index) => {
    const possibilitiesStep = [...this.state.possibilities];
    possibilitiesStep[index] = value;
    this.setState({ possibilities: possibilitiesStep }, () =>
      this.props.saveQuestionLocalChange(
        this.getQuestionObject(),
        this.props.number
      )
    );
  };

  handleChangeCheckbox = (answerIndex, questionIndex) => {
    const answersStep = [...this.state.answers];
    answersStep[answerIndex] = !answersStep[answerIndex];
    this.setState({ answers: answersStep }, () =>
      this.props.saveQuestionLocalChange(
        this.getQuestionObject(),
        this.props.number
      )
    );
  };

  repIndex = 0;

  switchOpenDelete = (type, repIndex) => {
    if (type === 'question') {
      this.setState({ openQuestionDelete: !this.state.openQuestionDelete });
    } else if (type === 'reponse') {
      this.setState({ openReponseDelete: !this.state.openReponseDelete });
      this.repIndex = repIndex;
    }
  };

  handleQuestionDelete = () => {
    this.props.handleDeleteQuestion(this.props.number);
    this.switchOpenDelete('question');
  };

  handleReponseDelete = () => {
    const possStep = [...this.state.possibilities];
    possStep.splice(this.repIndex, 1);
    this.setState(
      {
        possibilities: possStep
      },
      this.switchOpenDelete('reponse')
    );
  };

  handleClickPopoverEnonce(e) {
    e.preventDefault();
    this.setState({
      openPopoverEnonce: !this.state.openPopoverEnonce,
      anchorElEnonce: e.currentTarget
    });
  }
  handleClosePopoverEnonce() {
    this.setState({
      openPopoverEnonce: false
    });
  }

  handleClickPopoverExplication(e) {
    e.preventDefault();
    this.setState({
      openPopoverExplication: !this.state.openPopoverExplication,
      anchorElExplication: e.currentTarget
    });
  }
  handleClosePopoverExplication() {
    this.setState({
      openPopoverExplication: false
    });
  }

  render() {
    return (
      <BackgroundContainer style={this.props.style}>
        <Grid container spacing={3}>
          {/* NUMÉRO QUESTION */}
          <CenterContentGrid item align='center' xs={2}>
            <Typography variant='h3'>Q{this.props.number + 1}</Typography>
            <Tooltip title={'Supprimer la question'}>
              <IconButton
                aria-label={'Supprimer la question'}
                //color='primary'
                onClick={() => this.switchOpenDelete('question')}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </CenterContentGrid>
          {/* ÉNONCÉ */}
          <Grid item xs={8}>
            <TextField
              id='outlined-multiline-flexible'
              label='Énoncé'
              multiline
              //rowsMax='10'
              value={this.state.question_prequel}
              onChange={e =>
                this.setState({ question_prequel: e.target.value }, () =>
                  this.props.saveQuestionLocalChange(
                    this.getQuestionObject(),
                    this.props.number
                  )
                )
              }
              margin='normal'
              variant='outlined'
              fullWidth={true}
            />
          </Grid>
          {/* IMAGE ÉNONCÉ */}
          <CenterContentGrid item xs={2}>
            {this.state.imageURLQB && (
              <React.Fragment>
                <Button
                  aria-describedby={
                    this.state.openPopoverEnonce
                      ? 'mouse-over-popover-enonce'
                      : undefined
                  }
                  size='small'
                  variant='contained'
                  onClick={e => this.handleClickPopoverEnonce(e)}
                >
                  Voir l'image importée
                </Button>
                <Popover
                  id='mouse-over-popover-enonce'
                  open={this.state.openPopoverEnonce}
                  anchorEl={this.state.anchorElEnonce}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  onClose={() => this.handleClosePopoverEnonce()}
                  disableRestoreFocus
                >
                  <MaxImage
                    src={this.state.imageURLQB}
                    alt='Source uploadée'
                    loader={<CircularProgress />}
                  />
                </Popover>

                <Tooltip title={"Supprimer l'image"}>
                  <IconButton
                    aria-label={"Supprimer l'image"}
                    //color='primary'
                    onClick={
                      () => this.setState({ imageURLQB: '', imageNameQB: '' }) //TODO delete in firebase storage too
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </React.Fragment>
            )}
            <Tooltip title="Choisir un fichier image pour l'énoncé">
              <FormLabel>
                <CloudUploadIcon fontSize='large' />
                <FileUploader
                  accept='image/*'
                  name='quiz-begin'
                  filename={file =>
                    'sourceID-' +
                    this.props.questions_id +
                    '-questionNb-' +
                    (this.props.number + 1) +
                    '-QB'
                  }
                  storageRef={storage.ref(this.props.questions_id.toString())}
                  onUploadStart={this.handleUploadStartQB}
                  onUploadError={this.handleUploadErrorQB}
                  onUploadSuccess={this.handleUploadSuccessQB}
                  onProgress={this.handleProgressQB}
                  hidden
                />
              </FormLabel>
            </Tooltip>
          </CenterContentGrid>
        </Grid>
        {/* LISTE DES RÉPONSES */}
        {this.state.possibilities.map((rep, index) => {
          return (
            <Grid container key={index}>
              <Grid item xs={1}>
                <PaddingTypography variant='h6' align='right'>
                  {index + 1}
                </PaddingTypography>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  multiline
                  value={rep}
                  onChange={e => this.onTextChange(e.target.value, index)}
                  margin='none'
                  fullWidth={true}
                />
              </Grid>
              <Grid item xs={2}>
                <Checkbox
                  checked={this.state.answers[index]}
                  onChange={e =>
                    this.handleChangeCheckbox(index, this.props.number)
                  }
                />

                <Tooltip title={'Supprimer la réponse'}>
                  <IconButton
                    aria-label={'Supprimer la réponse'}
                    //color='primary'
                    onClick={() => this.switchOpenDelete('reponse', index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          );
        })}
        {/* AJOUTER QUESTION */}
        <Grid container justify='center'>
          <Tooltip title={'Ajouter une réponse'}>
            <IconButton
              aria-label={'Ajouter une réponse'}
              //color='primary'
              onClick={() =>
                this.setState({
                  possibilities: this.state.possibilities.concat('')
                })
              }
            >
              <AddCircle />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={1} />
          {/* EXPLICATION */}
          <Grid item xs={9}>
            <TextField
              id='outlined-multiline-flexible'
              label='Explication'
              multiline
              //rowsMax='10'
              value={this.state.feedback}
              onChange={e =>
                this.setState({ feedback: e.target.value }, () =>
                  this.props.saveQuestionLocalChange(
                    this.getQuestionObject(),
                    this.props.number
                  )
                )
              }
              margin='normal'
              variant='outlined'
              fullWidth={true}
            />
          </Grid>
          {/* IMAGE EXPLICATION */}
          <CenterContentGrid item xs={2}>
            {this.state.imageURLQE && (
              <React.Fragment>
                <Button
                  aria-describedby={
                    this.state.openPopoverExplication
                      ? 'mouse-over-popover-explication'
                      : undefined
                  }
                  size='small'
                  variant='contained'
                  onClick={e => this.handleClickPopoverExplication(e)}
                >
                  Voir l'image importée
                </Button>
                <Popover
                  id='mouse-over-popover-explication'
                  open={this.state.openPopoverExplication}
                  anchorEl={this.state.anchorElExplication}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  onClose={() => this.handleClosePopoverExplication()}
                  disableRestoreFocus
                >
                  <MaxImage
                    src={this.state.imageURLQE}
                    alt='Source uploadée'
                    loader={<CircularProgress />}
                  />
                </Popover>

                <Tooltip title={"Supprimer l'image"}>
                  <IconButton
                    aria-label={"Supprimer l'image"}
                    onClick={
                      () => this.setState({ imageURLQE: '', imageNameQE: '' }) //TODO delete in firebase storage too
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </React.Fragment>
            )}

            <Tooltip title="Choisir un fichier image pour l'explication">
              <FormLabel>
                <CloudUploadIcon fontSize='large' />

                <FileUploader
                  accept='image/*'
                  name='quiz-begin'
                  filename={file =>
                    'sourceID-' +
                    this.props.questions_id +
                    '-questionNb-' +
                    (this.props.number + 1) +
                    '-QE'
                  }
                  storageRef={storage.ref(this.props.questions_id.toString())}
                  onUploadStart={this.handleUploadStartQE}
                  onUploadError={this.handleUploadErrorQE}
                  onUploadSuccess={this.handleUploadSuccessQE}
                  onProgress={this.handleProgressQE}
                  hidden
                />
              </FormLabel>
            </Tooltip>
          </CenterContentGrid>
        </Grid>

        {/*  DELETE QUESTION DIALOG */}
        <Dialog
          open={this.state.openQuestionDelete}
          onClose={() => this.switchOpenDelete('question')}
          aria-labelledby='alert-dialog-title'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Supprimer la question ' + (this.props.number + 1) + ' ?'}
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() => this.switchOpenDelete('question')}
              color='primary'
            >
              Annuler
            </Button>
            <Button
              onClick={this.handleQuestionDelete}
              color='secondary'
              autoFocus
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/*  DELETE REPONSE DIALOG */}
        <Dialog
          open={this.state.openReponseDelete}
          onClose={() => this.switchOpenDelete('reponse')}
          aria-labelledby='alert-dialog-title'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Supprimer la réponse ?'}
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() => this.switchOpenDelete('reponse')}
              color='primary'
            >
              Annuler
            </Button>
            <Button
              onClick={this.handleReponseDelete}
              color='secondary'
              autoFocus
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
        <hr />
      </BackgroundContainer>
    );
  }
}
