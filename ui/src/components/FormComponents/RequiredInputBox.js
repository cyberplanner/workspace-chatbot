import React from "react";

class RequiredInputBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorMessage: "" };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    var fieldValue = event.target.value;
    if (fieldValue.trim() === "") {
      this.setState({ errorMessage: "Field cannot be blank" });
    } else {
      this.setState({ errorMessage: "" });
    }
    this.props.handleChange(event);
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.props.value}
          onChange={this.handleChange}
        />
        <label name="errorMessage">
          <span style={{ color: "red" }}>
            {this.state.errorMessage}
          </span>
        </label>
      </div>
    );
  }
}
export default RequiredInputBox;
