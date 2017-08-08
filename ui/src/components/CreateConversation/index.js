import React from "react";
import styled from "styled-components";
import AutoComplete from "react-autocomplete";
import * as LuisApi from "../../api/luisApi";

import EntityCondition from "../../model/EntityCondition";

//  language=SCSS
const SelectItem = styled.div`
  & {
    padding: 8px;
    background-color: ${({ isHighlighted }) =>
      isHighlighted ? "#CCC" : "white"};
  }
`;

//  language=SCSS
const StyledButton = styled.button`
  & {
    display: inline-block;
    background: white;
    border: 1px #bbb solid;
    border-radius: 50px;
    min-width: 48px;
    min-height: 48px;
    color: #00a0d7;
    font-size: 14px;
    padding: 10px;
    margin: 20px 0 0 0;
    outline: none;
    cursor: pointer;
  }

  &:hover,
  &:active,
  &:focus {
    background: #eee;
  }
`;

//  language=SCSS
const StyledTextInput = styled.input`
  & {
    min-height: 19px;
    display: inline-block;
    background: white;
    border: 0;
    border-bottom: 2px #bbb solid;
    width: 100px;
    flex: 1;
    max-width: 150px;
    height: 18px;
    color: #00a0d7;
    font-size: 14px;
    padding: 10px;
    outline: 0;
  }

  &:focus {
    border-bottom: 2px solid #00a0d7;
  }
`;

//  language=SCSS
const StyledTextArea = styled.textarea`
  & {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-height: 28px;
    border: 0;
    font-size: .8em;
    line-height: 1.6em;
    background-color: #f6f6f6;
    border-radius: 10px;
    outline: 0;
    margin-top: 10px;
    padding: 14px;
    resize: none;
  }
`;

//  language=SCSS
const StyledSelect = styled.select`
  & {
    display: inline-block;
    -webkit-appearance: none;
    background: #fff
      url(data:image/png;base64,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)
      no-repeat right;
    border: 0px #bbb solid;
    min-width: 40px;
    color: #00a0d7;
    font-size: 14px;
    padding: 11px;
    padding-right: 30px;
    border-radius: 0;
  }

  &:hover {
    background-color: #eee;
    cursor: pointer;
  }

  &:active {
    outline: none;
    background-color: #ddd;
  }

  &:focus {
    outline: none;
    border-bottom: 2px solid #00a0d7;
  }
`;

//  language=SCSS
const ButtonBar = styled.div`
  & {
    display: flex;
    min-height: 60px;
    margin-bottom: 30px;
  }
`;

const Wrapper = styled.div`
  background: rgba(0, 0, 0, 0.2);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

//  language=SCSS
const PopUp = styled.form`
  & {
    width: 95%;
    max-width: 550px;
    background: white;
    border-radius: 5px;
    height: 100%;
    padding: 1.25em;
    display: flex;
    flex-direction: column;
    overflow: auto;
    overflow-y: scroll;
  }

  h2 {
    text-align: center;
    font-size: 1.2em;
    color: #464646;
  }

  h3 {
    text-align: center;
    font-size: 1em;
    color: #464646;
  }

  input[name='intentId'] {
    & {
      min-height: 19px;
      display: inline-block;
      background: white;
      border: 0;
      border-bottom: 2px #bbb solid;
      width: 100px;
      flex: 1;
      max-width: 200px;
      height: 18px;
      color: #00a0d7;
      font-size: 14px;
      padding: 10px;
      outline: 0;
    }

    &:focus {
      border-bottom: 2px solid #00a0d7;
    }
  }
`;

//  language=SCSS
const InputContainer = styled.div`
  & {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    min-height: 50px;
  }

  label {
    color: #bbb;
    padding-right: 8px;
    font-weight: bold;
    margin-top: 20px;
  }

  input {
    font-weight: bold;
    min-width: 60%;
    margin-top: 20px;
  }

  input::placeholder {
    font-weight: normal;
  }
`;

const StyledLabel = styled.label`
  text-align: center;
  line-height: 1.4em;
`;

//  language=SCSS
const SubmitButton = styled.input`
  & {
    margin-top: 20px;
    margin-right: 20px;
    background: #00a0d7;
    border: none;
    border-radius: 20px;
    width: 80%;
    min-height: 48px;
    color: white;
    font-size: 16px;
    padding: 15px;
    outline: none;
    align-self: flex-end;
    cursor: pointer;
  }

  &:active,
  &:hover,
  &:focus {
    background: #0080ac;
  }
`;

//  language=SCSS
const ItemWrapper = styled.div`
  & {
    width: 100%;
    margin-top: 30px;
    display: block;
  }
`;

export default class ConversationForm extends React.Component {
  state = {
    fields: {},
    responses: [""],
    entityConditions: [],
    superchargerParameters: []
  };

  constructor() {
    super();
    this.formSubmission = this.formSubmission.bind(this);
    this.updateField = this.updateField.bind(this);
    this.updateResponses = this.updateResponses.bind(this);
    this.addNewInput = this.addNewInput.bind(this);
    this.addNewEntityCondition = this.addNewEntityCondition.bind(this);
    this.updateEntityCondition = this.updateEntityCondition.bind(this);
    this.removeEntityCondition = this.removeEntityCondition.bind(this);
    this.updateSuperchargerParam = this.updateSuperchargerParam.bind(this);
    this.selectSupercharger = this.selectSupercharger.bind(this);
  }

  formSubmission(event) {
    if (this.props.onSubmit) {
      this.props.onSubmit(
        Object.assign({}, this.state.fields, {
          responses: this.state.responses,
          conditions: this.state.entityConditions,
          superchargerParameters: this.state.superchargerParameters
        })
      );
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  updateField(event) {
    let newFields = Object.assign({}, this.state.fields);
    newFields[event.target.name] = event.target.value;
    this.setState({ fields: newFields });
  }

  updateIntent(value) {
    let fields = Object.assign({}, this.state.fields);
    fields.intentId = value;
    this.setState({ fields });
  }

  updateResponses(event, index) {
    let newResp = [].concat(this.state.responses);
    newResp[index] = event.target.value;
    this.setState({ responses: newResp });
  }

  addNewInput() {
    let newResp = [].concat(this.state.responses);
    newResp.push("");
    this.setState({ responses: newResp });
  }

  updateEntityCondition(event, index) {
    let newConditions = [].concat(this.state.entityConditions);
    newConditions[index][event.target.name] = event.target.value;
    this.setState({ entityConditions: newConditions });
  }

  removeEntityCondition(event, index) {
    event.preventDefault();
    event.stopPropagation();
    let newConditions = [].concat(this.state.entityConditions);
    newConditions.splice(index, 1);
    this.setState({ entityConditions: newConditions });
    return false;
  }

  addNewEntityCondition(event) {
    event.preventDefault();
    event.stopPropagation();
    let newConditions = [].concat(this.state.entityConditions);
    newConditions.push(new EntityCondition(null, false, "EQUALS", null));
    this.setState({ entityConditions: newConditions });
    return false;
  }

  updateSuperchargerParam(event, index) {
    let newArray = [].concat(this.state.superchargerParameters);
    newArray[index] = Object.assign({}, newArray[index], {
      value: event.target.value
    });
    this.setState({
      superchargerParameters: newArray
    });
  }

  selectSupercharger(event) {
    this.updateField(event);
    let supercharger = this.props.superchargers[event.target.value];
    const superchargerParameters = supercharger
      ? supercharger.doc.arguments
      : [];
    this.setState({
      superchargerParameters
    });
  }

  componentDidMount() {
    LuisApi.getIntents().then(intents => {
      this.setState({ intents });
    });
    /*
     If we've been provided with information useful when editing
     prepopulate the appropriate fields by updating values in state
     */
    let node = this.props.editingData.node;
    if (this.props.editingData.editMode) {
      this.setState({
        // store the editing data in state
        editingData: this.props.editingData,
        // Update "fields" in state
        fields: {
          // Fields should include supercharger id (if applicable)
          // and include the intentId (mandatory)
          supercharger: node.node.supercharger && node.node.supercharger.id,
          intentId: this.props.editingData.node.title
        },
        // Add in our entity conditions
        entityConditions: [].concat(node.conditions),
        // Add in the responses (as according to the KM item)
        responses: [].concat(this.props.editingData.messages),
        // If we have a supercharger... (and it has an ID)
        superchargerParameters:
          node.node.supercharger &&
          node.node.supercharger.id &&
          // Store our supercharger parameters, in the format of an
          // Object - with name + value fields.
          this.props.superchargers[
            node.node.supercharger.id
          ].doc.arguments.map(param =>
            Object.assign(param, {
              value: node.node.supercharger.arguments[param.name]
            })
          )
      });
    }
  }

  render() {
    const {
      superchargerParameters = [],
      entityConditions = [],
      responses = [],
      intents = []
    } = this.state;
    return (
      <Wrapper>
        <PopUp onSubmit={this.formSubmission}>
          <h2>
            {this.props.editingData.editMode ? "Update" : "Create"} a node
          </h2>
          <InputContainer>
            <StyledLabel htmlFor="intentId" title="Intent Id">
              #
            </StyledLabel>
            <AutoComplete
              inputProps={{
                id: "intentId",
                name: "intentId",
                style: { width: "100%" }
              }}
              wrapperStyle={{ flexGrow: 2 }}
              id="intentId"
              name="intentId"
              value={this.state.fields.intentId}
              onChange={this.updateField}
              onSelect={this.updateIntent.bind(this)}
              items={intents}
              shouldItemRender={(item, value) => {
                return (
                  item.name.toUpperCase().indexOf(value.toUpperCase()) !== -1
                );
              }}
              getItemValue={item => item.name}
              renderItem={(item, isHighlighted) =>
                <SelectItem isHighlighted={isHighlighted}>
                  {item.name}
                </SelectItem>}
            />
          </InputContainer>
          <InputContainer>
            <span>⚡ Supercharger: </span>
            <StyledSelect
              name="supercharger"
              value={this.state.fields.supercharger}
              placeholder="Select Supercharger"
              onChange={this.selectSupercharger}
            >
              <option value={null}> None</option>
              {Object.keys(this.props.superchargers).map(key => {
                return (
                  <option key={key} value={key}>
                    {this.props.superchargers[key].doc.displayName}
                  </option>
                );
              })}
            </StyledSelect>
          </InputContainer>
          <ItemWrapper>
            {superchargerParameters.map((value, index) => {
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between"
                  }}
                >
                  <StyledTextInput
                    type="text"
                    name={value.name}
                    placeholder={value.name}
                    value={value.value}
                    onChange={event =>
                      this.updateSuperchargerParam(event, index)}
                  />
                  <p>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </ItemWrapper>
          <ItemWrapper>
            {entityConditions.map((value, index) => {
              if (!value) {
                return <div />;
              }
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between"
                  }}
                >
                  <StyledTextInput
                    type="text"
                    value={value.entityId}
                    name="entityId"
                    placeholder="Entity ID"
                    onChange={event => this.updateEntityCondition(event, index)}
                  />
                  <StyledSelect
                    name="not"
                    value={value.not}
                    placeholder="Is/Is Not"
                    onChange={event => this.updateEntityCondition(event, index)}
                  >
                    <option value={false}>is</option>
                    <option value={true}>is not</option>
                  </StyledSelect>
                  <StyledSelect
                    name="comparator"
                    value={value.comparator}
                    placeholder="Comparator"
                    onChange={event => this.updateEntityCondition(event, index)}
                  >
                    <option value="EQUALS">equal to</option>
                    <option value="CONTAINS">containing</option>
                    <option value="REGEX_MATCH">a match for Regex</option>
                  </StyledSelect>
                  <StyledTextInput
                    type="text"
                    name="value"
                    value={value.value}
                    placeholder="Value"
                    onChange={event => this.updateEntityCondition(event, index)}
                  />
                  <StyledButton
                    type="button"
                    onClick={event => this.removeEntityCondition(event, index)}
                  >
                    {" "}X{" "}
                  </StyledButton>
                </div>
              );
            })}
            <StyledButton
              type="button"
              onClick={this.addNewEntityCondition}
              style={{ width: "100%" }}
            >
              {" "}Add new condition{" "}
            </StyledButton>
          </ItemWrapper>
          <ItemWrapper>
            {responses.map((value, index) => {
              return (
                <div key={index}>
                  <StyledTextArea
                    name="message"
                    placeholder="Type response"
                    value={value}
                    onChange={event => this.updateResponses(event, index)}
                  />
                </div>
              );
            })}
            <StyledButton
              type="button"
              onClick={this.addNewInput}
              style={{ width: "100%" }}
            >
              Add another response
            </StyledButton>
          </ItemWrapper>
          <ButtonBar>
            <SubmitButton
              type="submit"
              value={this.props.editingData.editMode ? "Update" : "Create"}
            />
            <StyledButton type="button" onClick={this.props.handleClose}>
              Cancel
            </StyledButton>
          </ButtonBar>
        </PopUp>
      </Wrapper>
    );
  }
}
