import React from "react";
import { Link } from "react-router-dom";
import Styled from "styled-components";
import editIcon from "./edit.svg";
import deleteIcon from "./delete.svg";

class TableRow extends React.Component {
  handleDeleteClick(intentId) {
    console.log("Intent : " + intentId + " : to be deleted");
  }

  render() {
    /* the ES6 version of const data = this.props.data */
    const { data } = this.props;
    /*
         use map to perform the same function on
         each element in the obj array
         */

    const StyledTh = Styled.th`
            text-align: left;
            padding: 8px;
            background-color: gray;
        `;

    const StyledTd = Styled.td`
            vertical-align: middle;
            padding: 8px;
        `;

    const StyledImg = Styled.img`
            width: 32px;
            height: 32px;
        `;

    const row = data.map(data => (
      <tr>
        <StyledTd key={data.doc._id}>{data.doc._id}</StyledTd>
        <StyledTd key={data.doc.responses}>{data.doc.responses}</StyledTd>
        <StyledTd>
          <Link to={`/addIntent/${data.doc._id}/${data.doc.responses}`}>
            <button>
              <StyledImg src={editIcon} />
            </button>
          </Link>
        </StyledTd>
        <StyledTd>
          <button>
            <StyledImg
              src={deleteIcon}
              onClick={this.handleDeleteClick.bind(this, data.doc._id)}
            />
          </button>
        </StyledTd>
      </tr>
    ));
    return (
      <div>
        <tr>
          <StyledTh>Intent</StyledTh>
          <StyledTh>Response</StyledTh>
          <StyledTh />
          <StyledTh />
        </tr>
        {row}
      </div>
    );
  }
}

export default TableRow;
