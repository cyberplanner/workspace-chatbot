import React, { Component } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

//  language=SCSS
const LabelContainer = styled.span`
  & {
    display: flex;
    flex-direction: column;
    height: 130px;
  }
`;

//  language=SCSS
const ConditionBadgeWrapper = styled.div`
  & {
    position: relative;
    display: inline-block;
  }
`;

//  language=SCSS
const ConditionBadge = styled.button`
  & {
    background-color: #aaa;
    color: #fff;
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 0.8em;
    margin-right: 5px;
    border: 1px #bbb solid;
    cursor: pointer;
    outline: 0;
  }
`;

//  language=SCSS
const ConditionList = styled.div`
  & {
    position: absolute;
    top: 35px;
    left: 0;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 0.8em;
  }

  &:after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 0 15px 15px;
    border-color: #fff transparent;
    display: block;
    width: 0;
    z-index: 1;
    top: -15px;
    left: 24px;
  }

  &:before {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 0 15px 15px;
    border-color: #ccc transparent;
    display: block;
    width: 0;
    z-index: 0;
    top: -16px;
    left: 24px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    padding: 10px;
  }
`;

//  language=SCSS
const ExpandCollapseButton = styled.button`
  & {
    position: absolute;
    width: 31px;
    height: 31px;
    background-color: #fff;
    border: 3px dashed #ccc;
    font-size: 1.05em;
    border-radius: 50%;
  }

  &.collapse::before {
    content: "-";
  }

  &.expand::before {
    content: "+";
  }
`;

//  language=SCSS
const SuperchargerBullet = styled.span`
  & {
    position: absolute;
    border-radius: 20px;
    width: auto;
    height: 20px;
    text-align: center;
    background: #00a0d7;
    color: white;
    font-size: 12px;
    padding: 3px 5px;
    bottom: 10px;
    right: 15px;
    padding-top: 0;
  }
  &::before {
    content: "⚡";
    margin-left: -20px;
    margin-right: 10px;
  }
`;

const getSearchProps = ({ isSearchMatch, isSearchFocus }) => {
  if (isSearchFocus) {
    return "4px dashed #295669";
  }
  if (isSearchMatch) {
    return "4px dotted #0080AD";
  }
  return "1px solid rgba(0, 0, 0, 0.2)";
};

//  language=SCSS
const ConversationItem = styled.div`
  & {
    padding: 10px;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 4px 4px 10px 0px rgba(0, 0, 0, 0.1);
    min-height: 128px;
    min-width: 440px;
    border: ${props => getSearchProps(props)};
  }

  .toolbar {
    display: inline-block;
    float: right;
    padding-top: 5px;
    margin-left: 40px;

    .btn {
      display: inline-block;
    }
  }

  .title {
    display: inline-block;
    color: #00a0d7;
    font-weight: bold;
    padding: 12px 0;
    text-transform: uppercase;
    font-size: 0.8em;

    &:before {
      content: "#";
      color: #bbb;
      padding-right: 8px;
    }
  }

  .subtitle {
    display: block;
    background-color: #f6f6f6;
    border-radius: 10px;
    padding: 14px;
    font-size: 0.8em;
    line-height: 1.6em;
    max-width: 600px;
    white-space: normal;
  }
`;

//  language=SCSS
const ResponseWrapper = styled.div`
  & {
    padding: 10px 0;
  }
`;

class NodeRendererDefault extends Component {
  state = {
    showConditions: false
  };

  showConditions() {
    this.setState(prev => ({
      showConditions: !prev.showConditions
    }));
  }

  renderConditionList(conditions) {
    return (
      <ConditionList>
        <ul>
          {conditions.map((cond, index) => (
            <li key={index}>
              "{cond.entityId}" {cond.not ? "NOT " : ""} {cond.comparator} "{cond.value}"
            </li>
          ))}
        </ul>
      </ConditionList>
    );
  }

  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      node,
      path,
      treeIndex,
      buttons
    } = this.props;

    const { showConditions } = this.state;

    return (
      <div style={{ height: "100%" }}>
        {toggleChildrenVisibility &&
          node.children &&
          node.children.length > 0 && (
            <div>
              <ExpandCollapseButton
                type="button"
                aria-label={node.expanded ? "Collapse" : "Expand"}
                className={node.expanded ? "collapse" : "expand"}
                style={{ left: -0.85 * scaffoldBlockPxWidth, top: "65px" }}
                onClick={() =>
                  toggleChildrenVisibility({ node, path, treeIndex })}
              />

              {node.expanded && <div style={{ width: scaffoldBlockPxWidth }} />}
            </div>
          )}

        <ResponseWrapper>
          <ConversationItem {...this.props}>
            <LabelContainer className="label">
              <div>
                <span className="title">
                  {typeof node.title === "function"
                    ? node.title({
                        node,
                        path,
                        treeIndex
                      })
                    : node.title}
                </span>
                <span className="toolbar">
                  {node.conditions ? (
                    <ConditionBadgeWrapper>
                      <ConditionBadge onClick={this.showConditions.bind(this)}>
                        {node.conditions.length} conditions
                      </ConditionBadge>
                      {showConditions
                        ? this.renderConditionList(node.conditions)
                        : null}
                    </ConditionBadgeWrapper>
                  ) : null}
                  {buttons.map((btn, index) => (
                    <div
                      key={index} // eslint-disable-line react/no-array-index-key
                      className="btn"
                    >
                      {btn}
                    </div>
                  ))}
                </span>
              </div>
              {node.subtitle && (
                <span className="subtitle">
                  {typeof node.subtitle === "function"
                    ? node.subtitle({
                        node,
                        path,
                        treeIndex
                      })
                    : node.subtitle}
                </span>
              )}
              {node.superchargerTitle && (
                <SuperchargerBullet class>
                  {node.superchargerTitle}
                </SuperchargerBullet>
              )}
            </LabelContainer>
          </ConversationItem>
        </ResponseWrapper>
      </div>
    );
  }
}

NodeRendererDefault.defaultProps = {
  isSearchMatch: false,
  isSearchFocus: false,
  toggleChildrenVisibility: null,
  buttons: [],
  parentNode: null,
  canDrop: false
};

NodeRendererDefault.propTypes = {
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  treeIndex: PropTypes.number.isRequired,
  isSearchMatch: PropTypes.bool,
  isSearchFocus: PropTypes.bool,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  toggleChildrenVisibility: PropTypes.func,
  buttons: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  style: PropTypes.shape({}),

  // Drag and drop API functions
  // Drag source
  parentNode: PropTypes.shape({}) // Needed for drag-and-drop utils
};

export default NodeRendererDefault;
