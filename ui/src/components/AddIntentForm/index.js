import React from "react";
import { KnowledgeManagmentService } from "../KnowledgeManagmentService/index";
import RequiredInputBox from "../FormComponents/RequiredInputBox";
import { FormTable } from "../FormComponents/Components";

class AddIntentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      responses: props.response,
      intentId: props.intentId,
      errorMessage: "",
      messages: [""]
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateIntentId = this.updateIntentId.bind(this);
    this.updateResponses = this.updateResponses.bind(this);
    this.addNewInput = this.addNewInput.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
    this.doPost = this.doPost.bind(this);
    this.doPut = this.doPut.bind(this);
  }

  componentDidMount() {
    let val = [""];
    if (this.props.result && this.props.result.responses) {
      val = this.props.result.responses;
    }
    this.setState({
      messages: val
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.result);
    this.setState({
      messages: nextProps.result.responses
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.props.intentId === undefined) {
      this.doPost();
    } else {
      this.doPut();
    }
  }

  doPost() {
    KnowledgeManagmentService("/" + this.state.intentId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        responses: this.state.responses
      })
    })
      .then(res => {
        console.log("res :" + JSON.stringify(res));
        this.setState({ errorMessage: JSON.stringify(res.message) });
      })
      .catch(err => {
        console.log("error :" + JSON.stringify(err));
        this.setState({
          errorMessage:
            "Error: Knowledge cannot be added. Please contact admin."
        });
      });
  }

  doPut() {
    KnowledgeManagmentService("/" + this.state.intentId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        responses: this.state.messages
      })
    })
      .then(res => {
        console.log("res :" + JSON.stringify(res));
        this.setState({ errorMessage: JSON.stringify(res.message) });
      })
      .catch(err => {
        console.log("error :" + JSON.stringify(err));
        this.setState({
          errorMessage:
            "Error: Knowledge cannot be added. Please contact admin."
        });
      });
  }

  updateIntentId(event) {
    this.setState({ intentId: event.target.value });
  }

  updateResponses(event) {
    this.setState({ responses: event.target.value });
  }

  updateMessages(event, index) {
    let newResp = [].concat(this.state.messages);
    newResp[index] = event.target.value;
    this.setState({ messages: newResp });
  }

  addNewInput() {
    let newResp = [].concat(this.state.messages);
    newResp.push("");
    this.setState({ messages: newResp });
  }

  render() {
    var opts = {};
    if (this.props.intentId !== undefined) {
      opts["readOnly"] = "readOnly";
    }
    const { messages = [] } = this.state;
    return (
      <div>
        <div>
          <label name="errorMessage">
            <span style={{ color: "red" }}>
              {this.state.errorMessage}
            </span>
          </label>
        </div>
        <form onSubmit={this.handleSubmit} name="addIntentForm">
          <FormTable>
            <tr>
              <td>
                <label>
                  Intent ID: <span style={{ color: "red" }}>*</span>
                </label>
              </td>
              <td>
                <RequiredInputBox
                  value={this.state.intentId}
                  handleChange={this.updateIntentId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>
                  Responses: <span style={{ color: "red" }}>*</span>
                </label>
              </td>
              <td>
                <div>
                  <a onClick={this.addNewInput}>+ New </a>
                </div>
                {messages.map((value, index) =>
                  <textarea
                    key={index}
                    value={value}
                    name="message"
                    placeholder="Enter Message"
                    onChange={event => this.updateMessages(event, index)}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <input type="submit" value="Submit" />
              </td>
            </tr>
          </FormTable>
        </form>
      </div>
    );
  }
}

export default AddIntentForm;
