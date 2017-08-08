import React, { Component } from "react";
import KnowledgeManagerTable from "../../components/KnowledgeManagerTable";
import { KnowledgeManagmentService } from "../../components/KnowledgeManagmentService";

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    KnowledgeManagmentService("")
      .then(res => {
        this.setState({
          data: res.rows
        });
      })
      .catch(err => {
        console.log("error :" + err);
      });
  }

  render() {
    if (this.state.data) {
      return (
        <div>
          <KnowledgeManagerTable data={this.state.data} />
        </div>
      );
    }

    return <div />;
  }
}

export default HomeContainer;
