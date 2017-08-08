import React from "react";
import TableRow from "./TableRow";
import Styled from "styled-components";

const StyledTable = Styled.table`
    border-collapse: collapse;
    width:100%;
`;

const StyledDiv = Styled.div`
    margin: auto;
    padding: 20px; 
    width: 100%;
`;

class KnowledgeManagerTable extends React.Component {
  render() {
    return (
      <StyledDiv>
        <h1>Knowledge Manager</h1>
        <StyledTable>
          <TableRow data={this.props.data} />
        </StyledTable>
      </StyledDiv>
    );
  }
}

export default KnowledgeManagerTable;
