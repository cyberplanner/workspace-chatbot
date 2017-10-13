import React, { Component } from "react";
import SortableTree, { toggleExpandedForAll } from "react-sortable-tree";
import { addNodeUnderParent } from "./utils.js";
import ConversationNodeView from "./ConversationNode";
import {
  bulkDeleteConversationNodes,
  retrieveAllConversationNodes,
  retrieveConversationNode,
  createNewConversationNode,
  deleteConversationNode,
  updateConversationNode,
  addNewChildToNode,
  updateChildOfNode,
  deleteChildOfNode
} from "../../api/conversationApi";
import { retrieveAllSuperchargers } from "../../api/superchargerApi";
import { getKnowledgeById, bulkDeleteKnowledge } from "../../api/knowledgeApi";
import ConversationNode from "../../model/conversationNode";
import CreateConversation from "../../components/CreateConversation";
import { KnowledgeManagmentService } from "../../components/KnowledgeManagmentService";
import styled from "styled-components";

const StyledButton = styled.button`
  background: white;
  border: 1px #bbbbbb solid;
  border-radius: 20px;
  min-width: 40px;
  color: #00a0d7;
  font-size: 14px;
  padding: 5px 15px;
  margin-right: 5px;
  &:hover {
    background: #eeeeee;
    cursor: pointer;
  }
  &:active {
    outline: none;
    background: #dddddd;
  }
  &:focus {
    outline: none;
  }
`;

//  language=SCSS
const StyledTreeView = styled.div`
  & {
    flex: 1;
  }
`;

//  language=SCSS
const SearchContainer = styled.div`
  & {
    color: #fff;
    padding: 30px 30px 20px;
    background-color: #295669;
    border-bottom: 3px solid rgba(255, 255, 255, 0.2);
  }

  .search-bar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .search-bar-toolbar {
    margin-top: 10px;
  }

  .search-bar-toolbar button:first-of-type {
    margin-left: 0;
  }

  input {
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    font-size: 1em;
    border: 3px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    outline: 0;
    flex-grow: 2;
  }

  input:focus,
  button:focus {
    border: 3px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.2);
  }

  button {
    outline: 0;
    padding: 13px;
    border-radius: 4px;
    color: #fff;
    font-weight: bold;
    background-color: rgba(255, 255, 255, 0.3);
    margin-left: 5px;
    border: 3px solid rgba(255, 255, 255, 0.5);
  }

  button[disabled] {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .item-count {
    margin-left: 8px;
    margin-right: 8px;
  }
`;

class ConversationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      editingData: false,
      superchargers: {}
    };
    this.deleteCallback = this.deleteCallback.bind(this);
    this.walkNodesForChildren = this.walkNodesForChildren.bind(this);
    this.processConversationNodes = this.processConversationNodes.bind(this);
    this.createCallback = this.createCallback.bind(this);
    this.updateFromServer = this.updateFromServer.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.searchFinishCallback = this.searchFinishCallback.bind(this);
  }

  componentDidMount() {
    this.updateFromServer();
  }

  updateFromServer() {
    let knowledgeMap = {};
    let promises = [];
    let results = [];
    promises.push(retrieveAllConversationNodes());
    promises.push(KnowledgeManagmentService(""));
    promises.push(retrieveAllSuperchargers());
    Promise.all(promises)
      .then(responses => {
        let conversation = responses[0];
        let knowledge = responses[1].rows;
        let superchargers = responses[2].reduce((result, item) => {
          result[item.id] = item;
          return result;
        }, {});
        this.setState({ superchargers: superchargers });
        knowledge.forEach(item => {
          knowledgeMap[item.id] = item.doc.responses;
        });

        conversation.forEach(node => {
          if (node.doc.supercharger && node.doc.supercharger.id) {
            results.push(
              Object.assign({}, node, {
                superchargerData: superchargers[node.doc.supercharger.id],
                responseText: knowledgeMap[node.doc.message][0]
              })
            );
          } else {
            results.push(
              Object.assign({}, node, {
                responseText: knowledgeMap[node.doc.message][0]
              })
            );
          }
        });
        return results;
      })
      .then(results => {
        this.setState({
          treeData: this.processConversationNodes(results)
        });
      });
  }

  truncate(string) {
    if (string.length < 148) {
      return string;
    } else {
      return string.substring(0, 148) + "...";
    }
  }

  superchargerExists(formData) {
    return (
      formData.supercharger &&
      formData.supercharger.toLowerCase() !== "none" &&
      formData.superchargerParameters
    );
  }

  processSingleNode(node, map, intentId, conditions, parentId) {
    let children = node.doc.children.sort(function(node1, node2) {
      let intent1 = node1.intentId.toLowerCase();
      let intent2 = node2.intentId.toLowerCase();
      if (intent1 === "none") {
        return 1;
      } else if (intent2 === "none") {
        return -1;
      }
      return intent1 < intent2 ? -1 : intent1 > intent2 ? 1 : 0;
    });
    let newNode = new ConversationNode(
      node.doc._id,
      node.doc.message,
      node.doc.fallback,
      children,
      node.doc.supercharger
    );
    if (parentId) {
      newNode.parentId = parentId;
    }
    let item = {
      node: newNode,
      title: intentId,
      conditions: conditions,
      subtitle: this.truncate(node.responseText),
      children: children.map(child =>
        this.processSingleNode(
          map[child.nodeId],
          map,
          child.intentId,
          child.conditions,
          node.doc._id
        )
      )
    };

    if (node.superchargerData) {
      item.superchargerTitle = node.superchargerData.doc.displayName;
    }
    return item;
  }

  processConversationNodes(nodes) {
    let map = {};
    nodes.forEach(node => {
      map[node.id] = node;
    });
    let treeData = [];
    treeData.push(this.processSingleNode(map.root, map, "Welcome"));
    return treeData;
  }

  createCallback({ node, path, treeIndex }) {
    this.setState({
      editingData: {
        node,
        path,
        treeIndex,
        editMode: false
      }
    });
  }

  deleteCallback({ node, parentNode }) {
    let affectedNodes = this.walkNodesForChildren(node);
    let nodeIDs = affectedNodes.map(node => node.id);
    let knowledgeIDs = affectedNodes.map(node => node.message);

    Promise.all([
      bulkDeleteKnowledge(knowledgeIDs),
      bulkDeleteConversationNodes(nodeIDs),
      deleteChildOfNode(parentNode.node.id, node.node.id)
    ])
      .then(results => {
        this.updateFromServer();
      })
      .catch(error => {
        this.setState({
          error
        });
        this.updateFromServer();
      });
  }

  walkNodesForChildren(node) {
    let results = [].concat(node.node);
    node.children
      .map(this.walkNodesForChildren)
      .forEach(array => (results = results.concat(array)));
    return results;
  }

  editNode({ node, path, treeIndex }) {
    getKnowledgeById(node.node.message).then(res => {
      this.setState({
        editingData: {
          node,
          path,
          treeIndex,
          editMode: true,
          messages: res.responses
        }
      });
    });
  }

  closePopup() {
    this.setState({ editingData: false });
  }

  handleCreate(formData) {
    // If we're editing not creating, drop out.
    if (this.state.editingData.editMode) {
      return this.handleUpdate(
        formData,
        this.state.editingData.node.node.id,
        this.state.editingData.node.node.parentId
      );
    } else {
      this.handleCreateNode(formData);
    }
  }

  handleCreateNode(formData) {
    // Get the ID of the parent node
    let parentId = this.state.editingData.node.node.id;
    // Generate a knowledge management ID.
    let id = Date.now() + "_";
    // Create knowledge in KM
    KnowledgeManagmentService("/" + id, {
      method: "POST",
      body: JSON.stringify({
        // Use messages from form.
        responses: formData.responses
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        // If that was successful, start building up the
        // content of the new conversation node.
        let req = {
          children: [],
          fallback: ["I'm sorry - I can't help with that."],
          message: id
        };
        // If we have a supercharger
        if (this.superchargerExists(formData)) {
          console.log("Creating supercharger");
          // Add in all the appropriate fields
          req.supercharger = {};
          req.supercharger.id = formData.supercharger;
          // And make the params an object, not an array.
          req.supercharger.arguments = formData.superchargerParameters.reduce(
            (result, item) => {
              result[item.name] = item.value;
              return result;
            },
            {}
          );
        }
        // Now - add that node into the DB.
        createNewConversationNode(req)
          .then(response => {
            // Now - add the child to the parent...
            return addNewChildToNode(parentId, {
              intentId: formData.intentId,
              nodeId: response.id,
              conditions: formData.conditions
            }).catch(error => {
              // As the new node has been created - delete it.
              // We failed to add it as a child to the parent.
              deleteConversationNode(response.id);
              throw new Error("Failed to add to parent.");
            });
          })
          .then(done => {
            // Grab latest tree
            this.updateFromServer();
            this.closePopup();
          });
      })
      .catch(error => {
        // Remove knowledge - as an error occurred.
        KnowledgeManagmentService("/" + id, {
          method: "DELETE"
        });
      });
  }

  handleUpdate(formData, nodeId, parentId) {
    // Get existing value for node
    retrieveConversationNode(nodeId).then(nodeDetail => {
      // Send a PUT to knowledge management to update the responses
      KnowledgeManagmentService("/" + nodeDetail.message, {
        method: "PUT",
        body: JSON.stringify({
          responses: formData.responses
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        // Build up Node Update Request
        let req = {
          // Keep existing children, we're not editing those here.
          children: [].concat(nodeDetail.children),
          fallback: ["I'm sorry - I can't help with that."],
          message: nodeDetail.message
        };
        // Check that we have a valid supercharger.
        if (this.superchargerExists(formData)) {
          // We do. Add it to the request
          console.log("Creating supercharger");
          req.supercharger = {};
          req.supercharger.id = formData.supercharger;
          req.supercharger.arguments = formData.superchargerParameters.reduce(
            (result, item) => {
              result[item.name] = item.value;
              return result;
            },
            {}
          );
        }
        // Call update on that node.
        // This will update any supercharger changes
        updateConversationNode(nodeId, req)
          .then(response => {
            // Then update the child of the parent node, to add
            // any changes to the intentId or conditions.
            return updateChildOfNode(parentId, {
              intentId: formData.intentId,
              nodeId: nodeId,
              conditions: formData.conditions
            });
          })
          .then(done => {
            // Finished! Update our tree and close the edit window.
            this.updateFromServer();
            this.closePopup();
          })
          .catch(error => {
            console.error(error);
          });
      });
    });
  }

  updateSearch(e) {
    this.setState({ searchQuery: e.target.value });
  }

  searchFinishCallback(matches) {
    this.setState({
      searchFoundCount: matches.length,
      searchFocusIndex:
        matches.length > 0 ? this.state.searchFocusIndex % matches.length : 0
    });
  }

  changeFocus(by) {
    this.setState(prev => {
      let count = prev.searchFocusIndex + by;
      if (count >= prev.searchFoundCount) {
        count = prev.searchFoundCount - 1;
      }
      if (count < 0) {
        count = 0;
      }
      return { searchFocusIndex: count };
    });
  }

  expandAll(expanded) {
    this.setState(prev => ({
      treeData: toggleExpandedForAll({
        treeData: prev.treeData,
        expanded
      })
    }));
  }

  render() {
    const {
      searchQuery,
      searchFocusIndex = 0,
      searchFoundCount = 0
    } = this.state;
    return (
      <StyledTreeView>
        <SearchContainer>
          <div className="search-bar-container">
            <input type="search" onChange={this.updateSearch.bind(this)} />
            <button
              disabled={!searchFoundCount}
              onClick={this.changeFocus.bind(this, -1)}
            >
              &lt;
            </button>
            <div className="item-count">
              {searchFoundCount ? searchFocusIndex + 1 : 0} / {searchFoundCount}
            </div>
            <button
              disabled={!searchFoundCount}
              onClick={this.changeFocus.bind(this, 1)}
            >
              &gt;
            </button>
          </div>
          <div className="search-bar-toolbar">
            <button onClick={this.expandAll.bind(this, false)}>
              Collapse All
            </button>
            <button onClick={this.expandAll.bind(this, true)}>
              Expand All
            </button>
          </div>
        </SearchContainer>
        {this.state.editingData && (
          <CreateConversation
            editingData={this.state.editingData}
            superchargers={this.state.superchargers}
            onSubmit={this.handleCreate}
            handleClose={this.closePopup}
          />
        )}
        <SortableTree
          searchQuery={searchQuery}
          searchFocusOffset={searchFocusIndex}
          searchFinishCallback={this.searchFinishCallback}
          rowHeight={162}
          canDrag={false}
          style={{ height: "calc(100% - 70px)" }}
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          getNodeKey={node => {
            return node.node.node.id;
          }}
          nodeContentRenderer={ConversationNodeView}
          generateNodeProps={rowInfo => {
            let props = {
              buttons: [
                <StyledButton
                  style={{
                    verticalAlign: "middle"
                  }}
                  onClick={() => this.editNode(rowInfo)}
                >
                  <svg
                    fill="#00a0d7"
                    height="12"
                    viewBox="0 0 24 24"
                    width="12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                  </svg>
                </StyledButton>,
                <StyledButton
                  style={{
                    verticalAlign: "middle"
                  }}
                  onClick={() => this.createCallback(rowInfo)}
                >
                  +
                </StyledButton>
              ]
            };

            if (rowInfo.path.length > 1) {
              props.buttons.push(
                <StyledButton
                  style={{
                    verticalAlign: "middle"
                  }}
                  onClick={() => this.deleteCallback(rowInfo)}
                >
                  x
                </StyledButton>
              );
            }

            return props;
          }}
        />
      </StyledTreeView>
    );
  }
}

export default ConversationContainer;
