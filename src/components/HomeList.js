import React from 'react';
import { db } from './Firebase/firebase';
// import {
//   List,
//   CellMeasurer,
//   CellMeasurerCache,
//   AutoSizer
// } from 'react-virtualized';

import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import Container from '@material-ui/core/Container';
import { styled } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import EditIcon from '@material-ui/icons/Edit';
import AddCircle from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityIcon from '@material-ui/icons/Visibility';

const CenterContainer = styled(Container)({
  textAlign: 'center'
});

export default class HomeList extends React.Component {
  state = {
    openListItemDelete: false
  };

  getLink(quiz) {
    if (quiz.config.quiz_id.toString().length === 1 || 2) {
      return (
        'https://preprod.daylight-back.themoocagency.com/daylightQuizEditor/quizChapter/pre/chap' +
        `${quiz.config.quiz_id}`
      );
    } else if (quiz.config.quiz_id.toString().length === 3) {
      return (
        'https://preprod.daylight-back.themoocagency.com/daylightQuizEditor/quizChapter/post/chap' +
        `${quiz.config.quiz_id.toString()[2]}`
      );
    }
  }

  quizId = 0;
  questionSourceId = 0;

  switchOpenDelete = (type, id) => {
    this.setState({ openListItemDelete: !this.state.openListItemDelete });
    if (id) {
      switch (type) {
        case 'questionSource':
          this.questionSourceId = id;
          break;
        case 'quiz':
          this.quizId = id;
          break;
        default:
          return;
      }
    }
  };

  handleItemListDelete = type => {
    if (type === 'questionSource') {
      db.collection('questions')
        .doc(this.questionSourceId.toString())
        .get()
        .then(async doc => {
          await db
            .collection('questions')
            .doc(this.questionSourceId.toString())
            .delete()
            .then(function() {
              //console.log('Document successfully deleted!');
            })
            .catch(function(error) {
              //console.error('Error removing document: ', error);
            });

          this.switchOpenDelete();
          this.props.updateQuestionsAll();
        });
    } else if (type === 'quiz') {
      db.collection('quiz')
        .doc(this.quizId.toString())
        .get()
        .then(async doc => {
          await db
            .collection('quiz')
            .doc(this.quizId.toString())
            .delete()
            .then(function() {
              //console.log('Document successfully deleted!');
            })
            .catch(function(error) {
              //console.error('Error removing document: ', error);
            });

          this.switchOpenDelete();
          this.props.updateQuizAll();
        });
    }
  };

  addQuestionSource = () => {
    db.collection('questions')
      .doc(
        (
          this.props.data[this.props.data.length - 1].questions_id + 1
        ).toString()
      )
      .set({
        answersList: [1], //TODO ? peupler
        questions_id:
          this.props.data[this.props.data.length - 1].questions_id + 1,
        questions_name:
          'Source de questions ' + //TODO ?
          (this.props.data[this.props.data.length - 1].questions_id + 1),
        quizQuestionList: [
          {
            answers: [true, false, false, false],
            feedback: '',
            possibilities: ['', '', '', ''],
            question_id: 1,
            question_prequel: '',
            imageURLQB: '',
            imageURLQE: '',
            imageNameQB: '',
            imageNameQE: ''
          }
        ]
      })
      .then(function() {
        console.log('Document successfully written!');
      })
      .catch(function(error) {
        console.error('Error writing document: ', error);
      });
    this.props.updateQuestionsAll(); //encore useful si open modal ?
    //todo open modal correspondant
  };

  addQuiz = () => {
    db.collection('quiz')
      .doc((this.props.data.length + 1).toString())
      .set({
        config: {
          quiz_id: this.props.data.length + 1,
          SubLines: ['', '', '', ''],
          passScore: 0,
          quiz_time: 0,
          setShuffle: false,
          quiz_title: 'Titre',
          quiz_title2: 'Sous-titre',
          pauseButton: false,
          chronoButton: false,
          questionsSetId: 1,
          shuffledAnswers: false,
          showResultConfig: false,
          quiz_n_questions: 0,
          quiz_n_questionsMax: 0,
          answers_file_name: '',
          question_file_name: ''
        }
      })
      .then(function() {
        console.log('Document successfully written!');
      })
      .catch(function(error) {
        console.error('Error writing document: ', error);
      });
    this.props.updateQuizAll(); //encore useful si open modal ?
    //todo open modal correspondant
  };

  downloadSCORMPackage = quiz => {
    if (quiz.config.quiz_id.toString().length === 1 || 2) {
      return `https://preprod.daylight-back.themoocagency.com/daylightQuizEditor/quizChapter/pre/chap${
        quiz.config.quiz_id
      }/chap${quiz.config.quiz_id}.zip`;
    } else if (quiz.config.quiz_id.toString().length === 3) {
      return `https://preprod.daylight-back.themoocagency.com/daylightQuizEditor/quizChapter/post/chap${
        quiz.config.quiz_id.toString()[2]
      }chap${quiz.config.quiz_id.toString()[2]}.zip`;
    }
  };

  //REACT VIRTUALIZED
  // rowRenderer = ({ key, index, parent, style, isScrolling, isVisible }) => {
  //   const { isQuestionList, data } = this.props;

  //   const title = isQuestionList
  //     ? data[index].questions_name
  //     : data[index].config.quiz_title + ' // ' + data[index].config.quiz_title2;
  //   return (
  //     <CellMeasurer
  //       key={key}
  //       cache={this.cache}
  //       parent={parent}
  //       columnIndex={0}
  //       rowIndex={index}
  //     >
  //       <ListItem button key={index} style={style}>
  //         <ListItemText primary={title} edge='start' aria-label={title} />
  //         <ListItemSecondaryAction>
  //           {!isQuestionList && (
  //             <React.Fragment>
  //               <Tooltip title='Configurer le quiz'>
  //                 <IconButton
  //                   onClick={() =>
  //                     this.props.handleClick(data[index], isQuestionList)
  //                   }
  //                 >
  //                   <SettingsIcon />
  //                 </IconButton>
  //               </Tooltip>
  //               <Tooltip title='Prévisualiser'>
  //                 <Link href={this.getLink(data[index])} target='_blank'>
  //                   {/* TODO PERFORMANCE, those are render every time, can be heavy! */}
  //                   <IconButton edge='start' aria-label='Prévisualiser'>
  //                     <VisibilityIcon />
  //                   </IconButton>
  //                 </Link>
  //               </Tooltip>
  //               <Tooltip title='Télécharger le paquet SCORM'>
  //                 <Link
  //                   href={this.downloadSCORMPackage(data[index])}
  //                   target='_blank'
  //                 >
  //                   <IconButton
  //                     edge='start'
  //                     aria-label='Télécharger le paquet SCORM'
  //                   >
  //                     <GetAppIcon />
  //                   </IconButton>
  //                 </Link>
  //               </Tooltip>
  //             </React.Fragment>
  //           )}

  //           {isQuestionList && (
  //             <React.Fragment>
  //               <Tooltip title='Éditer la source de questions'>
  //                 <IconButton
  //                   onClick={() =>
  //                     this.props.handleClick(data[index], isQuestionList)
  //                   }
  //                   edge='start'
  //                   aria-label='Éditer la source de questions'
  //                 >
  //                   <EditIcon />
  //                 </IconButton>
  //               </Tooltip>
  //               {/* <Tooltip title='Export XLSX'>
  //                         <IconButton
  //                           edge='start'
  //                           aria-label='Export XLSX'
  //                           onClick={() => console.log(data[index])}
  //                         >
  //                           <ArrowDownwardIcon />
  //                         </IconButton>
  //                       </Tooltip> */}
  //               {/*
  //                       <Tooltip title='Import XLSX'>
  //                         <IconButton edge='start' aria-label='Import XLSX'>
  //                           <ArrowUpwardIcon />
  //                         </IconButton>
  //                       </Tooltip>
  //                       <input
  //                         type='file'
  //                         accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //                         onChange={e => this.importXLSX(e)} //+data(actualQuestionsSources in Accueil)
  //                       /> */}
  //             </React.Fragment>
  //           )}
  //           <Tooltip
  //             title={
  //               isQuestionList
  //                 ? 'Supprimer la source de questions'
  //                 : 'Supprimer le quiz'
  //             }
  //           >
  //             <IconButton
  //               edge='start'
  //               aria-label={
  //                 isQuestionList
  //                   ? 'Supprimer la source de questions'
  //                   : 'Supprimer le quiz'
  //               }
  //               onClick={() =>
  //                 isQuestionList
  //                   ? this.switchOpenDelete(
  //                       'questionSource',
  //                       data[index].questions_id
  //                     )
  //                   : this.switchOpenDelete('quiz', data[index].config.quiz_id)
  //               }
  //             >
  //               <DeleteIcon />
  //             </IconButton>
  //           </Tooltip>
  //         </ListItemSecondaryAction>
  //       </ListItem>
  //     </CellMeasurer>
  //   );
  // };
  // cache = new CellMeasurerCache({
  //   fixedWidth: true,
  //   defaultHeight: 100
  // });

  render() {
    const { isQuestionList } = this.props;
    return (
      <React.Fragment>
        {/* REACT VIRTUALIZED */}
        {/* <AutoSizer>
          {({ height, width }) => {
            return (
              <List
                rowCount={this.props.data.length}
                width={width}
                height={height}
                deferredMeasurementCache={this.cache}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                overscanRowCount={4}
              />
            );
          }}
        </AutoSizer> */}

        <List
          component='nav'
          aria-label={
            isQuestionList ? 'Liste des sources de questions' : 'Liste des quiz'
          }
        >
          {(this.props.quizSpinner || this.props.questionsSpinner) && (
            <Grid container justify='center'>
              <CircularProgress />
            </Grid>
          )}
          {this.props.data &&
            this.props.data.map((data, index) => {
              const title = isQuestionList
                ? data.questions_name
                : data.config.quiz_title2
                ? data.config.quiz_title + ' // ' + data.config.quiz_title2
                : data.config.quiz_title;

              return (
                <ListItem button key={index}>
                  <ListItemText
                    primary={title}
                    edge='start'
                    aria-label={title}
                  />
                  <ListItemSecondaryAction>
                    {!isQuestionList && (
                      <React.Fragment>
                        <Tooltip title='Configurer le quiz'>
                          <IconButton
                            onClick={() =>
                              this.props.handleClick(data, isQuestionList)
                            }
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Prévisualiser'>
                          <Link href={this.getLink(data)} target='_blank'>
                            {/* // TODO PERFORMANCE, those are render every time, can be heavy! */}
                            <IconButton edge='start' aria-label='Prévisualiser'>
                              <VisibilityIcon />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title='Télécharger le paquet SCORM'>
                          <Link
                            href={this.downloadSCORMPackage(data)}
                            target='_blank'
                          >
                            <IconButton
                              edge='start'
                              aria-label='Télécharger le paquet SCORM'
                            >
                              <GetAppIcon />
                            </IconButton>
                          </Link>
                        </Tooltip>
                      </React.Fragment>
                    )}

                    {isQuestionList && (
                      <React.Fragment>
                        <Tooltip title='Éditer la source de questions'>
                          <IconButton
                            onClick={() =>
                              this.props.handleClick(data, isQuestionList)
                            }
                            edge='start'
                            aria-label='Éditer la source de questions'
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </React.Fragment>
                    )}
                    <Tooltip
                      title={
                        isQuestionList
                          ? 'Supprimer la source de questions'
                          : 'Supprimer le quiz'
                      }
                    >
                      <IconButton
                        edge='start'
                        aria-label={
                          isQuestionList
                            ? 'Supprimer la source de questions'
                            : 'Supprimer le quiz'
                        }
                        onClick={() =>
                          isQuestionList
                            ? this.switchOpenDelete(
                                'questionSource',
                                data.questions_id
                              )
                            : this.switchOpenDelete('quiz', data.config.quiz_id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
        </List>

        <CenterContainer maxWidth='md'>
          <Tooltip
            title={
              isQuestionList
                ? 'Ajouter une source de questions'
                : 'Ajouter un quiz'
            }
          >
            <IconButton
              aria-label={
                isQuestionList
                  ? 'Ajouter une source de questions'
                  : 'Ajouter un quiz'
              }
              color='primary'
              onClick={() =>
                isQuestionList ? this.addQuestionSource() : this.addQuiz()
              }
            >
              <AddCircle />
            </IconButton>
          </Tooltip>
        </CenterContainer>

        {/*  DELETE QUESTION SOURCE DIALOG */}
        <Dialog
          open={this.state.openListItemDelete}
          onClose={() =>
            this.switchOpenDelete(isQuestionList ? 'questionSource' : 'quiz')
          }
          aria-labelledby='alert-dialog-title'
        >
          <DialogTitle id='alert-dialog-title'>
            {isQuestionList
              ? 'Supprimer la source de données ?'
              : 'Supprimer le quiz ?'}
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() =>
                this.switchOpenDelete(
                  isQuestionList ? 'questionSource' : 'quiz'
                )
              }
              color='primary'
            >
              Annuler
            </Button>
            <Button
              onClick={() =>
                isQuestionList
                  ? this.handleItemListDelete('questionSource')
                  : this.handleItemListDelete('quiz')
              }
              color='secondary'
              autoFocus
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}
