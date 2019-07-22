import React from 'react';
import { db } from './Firebase/firebase';
import XLSX from 'xlsx';
import _ from 'lodash';
import {
  List,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer
} from 'react-virtualized';

import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import SaveIcon from '@material-ui/icons/Save';
import AddCircle from '@material-ui/icons/AddCircle';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SearchIcon from '@material-ui/icons/Search';

import EditQuestion from './EditQuestion';

const ModalContainer = styled(Container)({
  backgroundColor: 'white',
  minHeight: '500px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  position: 'fixed',
  maxWidth: '90%',
  //paddingRight: '90px',
  //
  overflowY: 'scroll',
  overflowX: 'visible',
  height: '95%'
});

const SaveButton = styled(Button)({
  height: '50px',
  width: '50px',
  borderRadius: '50%'
});

const StyledTextField = styled(TextField)({
  width: '76%'
});

const StyledIconButton = styled(IconButton)({
  width: '19%',
  alignSelf: 'flex-end'
});

const FlexGrid = styled(Grid)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const FlexGrid2 = styled(Grid)({
  display: 'flex',
  alignItems: 'baseline'
});

const ButtonsGrid = styled(Grid)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

export default class QuestionsConfigModal extends React.Component {
  state = {
    answersList: [],
    questions_id: 0,
    questions_name: '',
    quizQuestionList: [],
    //
    scrollToIndex: undefined,
    searchedQuestionNb: ''
  };

  componentDidMount = () => {
    const { actualQuestionsSource } = this.props;
    this.setState({
      answersList: actualQuestionsSource.answersList,
      questions_id: actualQuestionsSource.questions_id,
      questions_name: actualQuestionsSource.questions_name,
      quizQuestionList: actualQuestionsSource.quizQuestionList
    });
  };

  saveQuestionLocalChange = (question, index) => {
    const quizQuestionListStep = [...this.state.quizQuestionList];
    quizQuestionListStep[index] = question;
    this.setState({ quizQuestionList: quizQuestionListStep });
  };

  onAddNewQuestion = () => {
    const quizQuestionListStep = [...this.state.quizQuestionList];
    const newQuestion = {
      answers: [true, false, false, false],
      feedback: '',
      possibilities: ['', '', '', ''],
      question_id:
        this.state.quizQuestionList[this.state.quizQuestionList.length - 1]
          .question_id + 1,
      question_prequel: '',
      imageURLQB: '',
      imageURLQE: '',
      imageNameQB: '',
      imageNameQE: ''
    };
    quizQuestionListStep.push(newQuestion);

    const answersListStep = Array.from(this.state.answersList);
    answersListStep.push(1);
    this.setState(
      {
        quizQuestionList: quizQuestionListStep,
        answersList: answersListStep
      },
      () => {
        this.onScrollToRowChange(this.state.answersList.length);
      }
    );
  };

  handleSaveQuestionsSource = () => {
    //first peupler answersList
    const answersListStep = [...this.state.answersList];
    answersListStep.forEach((item, index) => {
      answersListStep[index] =
        this.state.quizQuestionList[index].answers.findIndex(e => e === true) +
        1;
    });

    this.setState({ answersList: answersListStep }, () => {
      // save data to firestore
      db.collection('questions')
        .doc(this.state.questions_id.toString())
        .get()
        .then(async doc => {
          await db
            .collection('questions')
            .doc(this.state.questions_id.toString())
            .set({
              answersList: this.state.answersList,
              questions_id: this.state.questions_id,
              questions_name: this.state.questions_name,
              quizQuestionList: this.state.quizQuestionList
            })
            .then(() => console.log('Document successfully written!'))
            .catch(function(error) {
              console.error('Error writing document: ', error);
              return;
            });
          this.props.switchDataSend();
          this.props.handleCloseModal('questions');
        });
    });
  };

  handleDeleteQuestion = index => {
    const quizQuestionListStep = [...this.state.quizQuestionList];
    quizQuestionListStep.splice(index, 1);
    const answersListStep = [...this.state.answersList];
    answersListStep.splice(index, 1);

    this.setState({
      quizQuestionList: quizQuestionListStep,
      answersList: answersListStep
    });
  };

  exportXLSX = () => {
    // Lodash cloneDeep necessary because need to not have shallow copie (several level in this array)
    const dataToSend = _.cloneDeep(this.state.quizQuestionList);
    dataToSend.forEach(question => {
      //transform array to string for XLSX
      question.answers = question.answers.join();
      question.possibilities = question.possibilities.join('//');
    });
    console.log(this.state.quizQuestionList);
    console.log(dataToSend);
    /* make the worksheet */
    var ws = XLSX.utils.json_to_sheet(dataToSend);
    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'data');
    /* generate an XLSX file */
    XLSX.writeFile(wb, `${this.state.questions_name}.xlsx`);
  };

  importXLSX = (e, saveOnImportXLSX) => {
    // import xlsx to json
    var oFile = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = e.target.result;
      data = new Uint8Array(data);
      var workbook = XLSX.read(data, { type: 'array' });
      //console.log(workbook);
      var result = {};
      workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (roa.length) result[sheetName] = roa;
      });

      // see the result, caution: it works after reader event is done.
      if (reader.readyState) {
        result.data.forEach(question => {
          question.answers = question.answers.split(',');
          //convert string to boolean
          question.answers = question.answers.map(item => item === 'true');
          question.possibilities = question.possibilities.split('//');
        });
        saveOnImportXLSX(result.data);
      }
    };
    reader.readAsArrayBuffer(oFile);
  };
  saveOnImportXLSX = data => {
    this.setState({ quizQuestionList: data }, () => {
      this.handleSaveQuestionsSource();
    });
  };

  //REACT VIRTUALIZED
  rowRenderer = ({ key, index, parent, style, isScrolling, isVisible }) => {
    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <EditQuestion
          style={style}
          number={index}
          question={this.state.quizQuestionList[index]}
          questions_id={this.state.questions_id}
          handleDeleteQuestion={this.handleDeleteQuestion}
          saveQuestionLocalChange={this.saveQuestionLocalChange}
        />
      </CellMeasurer>
    );
  };
  cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 600
  });

  onScrollToRowChange = value => {
    const rowCount = this.state.quizQuestionList.length;
    const rowCountIndexBased = parseInt(rowCount, 10) - 1;
    const questionIndex = parseInt(value) - 1;

    let scrollToIndex = Math.min(rowCountIndexBased, questionIndex);

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined;
    }

    this.setState({ scrollToIndex });
  };

  render() {
    const { questions_name } = this.state;
    return (
      <React.Fragment>
        <ModalContainer>
          {/* <BackgroundContainer> */}
          <Grid container spacing={2} justify='space-between'>
            <FlexGrid2 item xs={5}>
              <StyledTextField
                id='questionsSource-title'
                label='Titre de la source de données'
                value={questions_name}
                onChange={e =>
                  this.setState({ questions_name: e.target.value })
                }
                margin='normal'
                fullWidth={true}
              />
              <Typography display='inline'>
                ({this.state.quizQuestionList.length} questions)
              </Typography>
            </FlexGrid2>

            <FlexGrid item xs={3}>
              <StyledTextField
                label='Aller à la question n°...'
                id='question-number'
                type='number'
                aria-describedby='Aller à la question n°...'
                value={this.state.searchedQuestionNb}
                onChange={e =>
                  this.setState({ searchedQuestionNb: e.target.value })
                }
                margin='normal'
                error={
                  this.state.searchedQuestionNb >
                  this.state.quizQuestionList.length
                }
              />
              <StyledIconButton
                onClick={e =>
                  this.onScrollToRowChange(this.state.searchedQuestionNb)
                }
              >
                <SearchIcon />
              </StyledIconButton>
            </FlexGrid>

            <FlexGrid item xs={1}>
              <Tooltip title={'Ajouter une question'}>
                <IconButton
                  aria-label={'Ajouter une question'}
                  //color='primary'
                  onClick={this.onAddNewQuestion}
                >
                  <AddCircle fontSize='large' />
                </IconButton>
              </Tooltip>
            </FlexGrid>

            <ButtonsGrid item xs={1}>
              <Tooltip title='Export XLSX'>
                <ArrowDownwardIcon
                  edge='start'
                  aria-label='Export XLSX'
                  onClick={() => this.exportXLSX()}
                  fontSize='large'
                />
              </Tooltip>
              <input
                type='file'
                onChange={e => this.importXLSX(e, this.saveOnImportXLSX)} //+data(actualQuestionsSources in Accueil)
                accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                style={{ display: 'none' }}
                id='raised-button-file'
              />
              <label htmlFor='raised-button-file'>
                <Tooltip title='Import XLSX'>
                  <ArrowUpwardIcon fontSize='large' />
                </Tooltip>
              </label>
            </ButtonsGrid>

            <FlexGrid item xs={1}>
              <Tooltip title={'Sauvegarder'}>
                <SaveButton
                  variant='contained'
                  color='secondary'
                  size='large'
                  onClick={this.handleSaveQuestionsSource}
                >
                  <SaveIcon />
                </SaveButton>
              </Tooltip>
            </FlexGrid>
          </Grid>

          {/* REACT VIRTUALIZED */}
          <AutoSizer>
            {({ height, width }) => {
              return (
                <List
                  rowCount={this.state.quizQuestionList.length}
                  width={width}
                  height={height}
                  deferredMeasurementCache={this.cache}
                  rowHeight={this.cache.rowHeight}
                  rowRenderer={this.rowRenderer}
                  overscanRowCount={4}
                  scrollToIndex={parseInt(this.state.scrollToIndex)}
                />
              );
            }}
          </AutoSizer>
          {/* </BackgroundContainer> */}
        </ModalContainer>
      </React.Fragment>
    );
  }
}
