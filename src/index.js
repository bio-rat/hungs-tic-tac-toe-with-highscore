import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import FacebookLogin from "react-facebook-login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ListGroup, ListGroupItem } from "reactstrap";

function Square({ onClick, value }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => !this.props.winner && this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>

        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      xIsNext: true,
      stepNumber: 0,
      name: "",
      userImg: "",
      highScoreBoard: []
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    squares[i] = this.state.xIsNext ? "X" : "O";
    const currentTime = !this.state.stepNumber ? Date.now() : 0;

    this.setState(
      {
        history: history.concat([
          {
            squares: squares
          }
        ]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
        timeStart: !this.state.stepNumber ? currentTime : this.state.timeStart
      },
      () => this.getHighScore()
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  getHighScore() {
    const timeStart = this.state.timeStart;
    const endTime = Date.now();
    const timeLapse = Math.floor((endTime - timeStart) / 1000);

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);
    this.setState({
      score: winner ? timeLapse : 0
    });
  }

  calculateWinner = squares => {
    if (squares[0] && squares[0] === squares[1] && squares[1] === squares[2]) {
      return squares[0];
    } else if (
      squares[3] &&
      squares[3] === squares[4] &&
      squares[4] === squares[5]
    ) {
      return squares[3];
    } else if (
      squares[6] &&
      squares[6] === squares[7] &&
      squares[7] === squares[8]
    ) {
      return squares[6];
    } else if (
      squares[0] &&
      squares[0] === squares[3] &&
      squares[3] === squares[6]
    ) {
      return squares[0];
    } else if (
      squares[1] &&
      squares[1] === squares[4] &&
      squares[4] === squares[7]
    ) {
      return squares[1];
    } else if (
      squares[2] &&
      squares[2] === squares[5] &&
      squares[5] === squares[8]
    ) {
      return squares[2];
    } else if (
      squares[0] &&
      squares[0] === squares[4] &&
      squares[4] === squares[8]
    ) {
      return squares[0];
    } else if (
      squares[2] &&
      squares[2] === squares[4] &&
      squares[4] === squares[6]
    ) {
      return squares[2];
    } else return null;
  };

  async responseFacebook(resp) {
    const name = resp.name;
    const imgUrl = resp.picture.data.url;
    this.setState({
      name: name,
      userImg: imgUrl
    });
  }

  async handlePostHighScore() {
    let data = new URLSearchParams();
    const name = this.state.name;
    const highScore = this.state.score;
    data.append("player", name);
    data.append("score", highScore);
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString(),
      json: true
    });
    console.log("results: ", response);
  }

  async handleGetHighScoreFromSever() {
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "GET"
    });
    const report = await response.json();
    this.setState({
      highScoreBoard: report.items
    });
  }

  async handleDelete() {
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev/5c9b33bf998ee900044a0440`;
    const response = await fetch(url, {
      method: "DELETE"
    });
    const report = await response.json();
    console.log(report);
  }

  componentDidMount() {
    this.handleGetHighScoreFromSever();
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);
    const stepNumber = this.state.stepNumber;
    const score = this.state.score;
    const highScoreBoard = this.state.highScoreBoard;

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";

      return (
        <li key={move}>
          <Button
            className="btn-block mt-1"
            color={move === stepNumber ? "success" : "dark"}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </Button>
        </li>
      );
    });

    const highScoreBoardDisplay = highScoreBoard.map(x => {
      return (
        <ListGroupItem>
          <strong className="text-danger">Name: </strong>
          {x.player}, <strong className="text-danger">Score: </strong> {x.score}
          s
        </ListGroupItem>
      );
    });

    let status;
    if (winner && stepNumber !== 9) {
      status = "Winner: " + winner + ", Score: " + score + "s";
    } else if (!winner && stepNumber !== 9) {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    } else if (stepNumber === 9) {
      status = "Draw";
    }

    return (
      <div className="row container-fluid mt-2">
        <div className="col-md-4">
          <div>
            <img
              className="rounded-circle mr-2"
              src={this.state.userImg}
              width="50px"
              height="50px"
              alt=""
            />
            <strong>{this.state.name}</strong>
          </div>
          <FacebookLogin
            appId="308230356530404"
            autoLoad={true}
            fields="name,email,picture"
            callback={resp => this.responseFacebook(resp)}
            cssClass="my-facebook-button-class"
            icon="fa-facebook"
            textButton={this.state.name ? " Logged in" : " Login"}
            isDisabled={this.state.name}
          />
          <br />
          <div className="my-3">
            <Button
              color="success"
              className="mr-3"
              onClick={() => this.handlePostHighScore()}
            >
              Click to send high score
            </Button>
            <Button color="danger" onClick={() => this.handleDelete()}>
              Click to delete
            </Button>
          </div>
          <ListGroup>{highScoreBoardDisplay}</ListGroup>
        </div>
        <div className="game-board col-md-4">
          <h1 className="text-center">{status}</h1>
          <Board
            squares={current.squares}
            onClick={i => !winner && !current.squares[i] && this.handleClick(i)}
            winner={winner}
          />
        </div>
        <div className="game-info col-md-4 text-center">
          <h1>Past Step</h1>
          <ul style={{ marginTop: "60px" }} className="list-unstyled">
            {moves}
          </ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
