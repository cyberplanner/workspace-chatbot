import React, { Component } from "react";
import AddIntentForm from "../../components/AddIntentForm/index";

class AddIntentContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: [""]
    };
  }

  componentDidMount() {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/knowledge/` +
        this.props.match.params.intentId
    )
      .then(result => {
        return new Promise((resolve, reject) => {
          result.text().then(text => {
            console.log(text);
            resolve(JSON.parse(text));
          });
        });
      })
      .then(jsonResult => {
        this.setState({ result: jsonResult });
      });
  }

  render() {
    return (
      <div>
        <AddIntentForm
          intentId={this.props.match.params.intentId}
          result={this.state.result}
        />
      </div>
    );
  }
}

export default AddIntentContainer;
