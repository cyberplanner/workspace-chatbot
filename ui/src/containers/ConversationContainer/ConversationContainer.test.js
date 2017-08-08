import React from "react";
import ConversationContainer from "../ConversationContainer";
import ConversationNode from "../../model/conversationNode";

const testString = "You can find silhouette here:";

it("processConversationNodes is able to re-format a valid document structure correctly", () => {
  let container = new ConversationContainer();

  let nodes = [
    {
      responseText: testString,
      id: "f1ed1cdc1f497263f1847e2fb76d1878",
      key: "f1ed1cdc1f497263f1847e2fb76d1878",
      value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        _rev: "1-1758e0832da0471bdc9cb24c826c0583",
        children: [],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
        ],
        message: "silhouette"
      }
    },
    {
      responseText: testString,
      id: "root",
      key: "root",
      value: { rev: "3-886476295495680153e656056b202b4c" },
      doc: {
        _id: "root",
        _rev: "3-886476295495680153e656056b202b4c",
        children: [
          { intentId: "silhouette", nodeId: "f1ed1cdc1f497263f1847e2fb76d1878" }
        ],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way."
        ],
        message: "welcome"
      }
    }
  ];

  let childNode = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "silhouette",
    [
      "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
    ],
    []
  );
  childNode.parentId = "root";

  expect(container.processConversationNodes(nodes)).toEqual([
    {
      node: new ConversationNode(
        "root",
        "welcome",
        [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way."
        ],
        [{ intentId: "silhouette", nodeId: "f1ed1cdc1f497263f1847e2fb76d1878" }]
      ),
      conditions: undefined,
      title: "Welcome",
      subtitle: testString,
      children: [
        {
          node: childNode,
          conditions: undefined,
          title: "silhouette",
          subtitle: testString,
          children: []
        }
      ]
    }
  ]);
});

it("processSingleNode is able to re-format an individual node with no children", () => {
  let container = new ConversationContainer();

  let node = {
    responseText: testString,
    id: "f1ed1cdc1f497263f1847e2fb76d1878",
    key: "f1ed1cdc1f497263f1847e2fb76d1878",
    value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
    doc: {
      _id: "f1ed1cdc1f497263f1847e2fb76d1878",
      _rev: "1-1758e0832da0471bdc9cb24c826c0583",
      children: [],
      fallback: [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      message: "silhouette"
    }
  };
  expect(container.processSingleNode(node, {}, "silhouette")).toEqual({
    node: new ConversationNode(
      "f1ed1cdc1f497263f1847e2fb76d1878",
      "silhouette",
      [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      []
    ),
    conditions: undefined,
    title: "silhouette",
    subtitle: testString,
    children: []
  });
});

it("processSingleNode is able to re-format an individual node with single child", () => {
  let container = new ConversationContainer();

  let map = {
    aa1234: {
      responseText: testString,
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        children: [],
        fallback: ["Sorry. Try asking me in another way?"],
        message: "moveBase"
      }
    }
  };

  let node = {
    responseText: testString,
    id: "f1ed1cdc1f497263f1847e2fb76d1878",
    key: "f1ed1cdc1f497263f1847e2fb76d1878",
    value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
    doc: {
      _id: "f1ed1cdc1f497263f1847e2fb76d1878",
      _rev: "1-1758e0832da0471bdc9cb24c826c0583",
      children: [{ nodeId: "aa1234", intentId: "testIntent" }],
      fallback: [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      message: "silhouette"
    }
  };
  let child = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "moveBase",
    ["Sorry. Try asking me in another way?"],
    []
  );
  child.parentId = "f1ed1cdc1f497263f1847e2fb76d1878";
  expect(container.processSingleNode(node, map, "silhouette")).toEqual({
    node: new ConversationNode(
      "f1ed1cdc1f497263f1847e2fb76d1878",
      "silhouette",
      [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      [{ nodeId: "aa1234", intentId: "testIntent" }]
    ),
    title: "silhouette",
    subtitle: testString,
    conditions: undefined,
    children: [
      {
        node: child,
        title: "testIntent",
        subtitle: testString,
        conditions: undefined,
        children: []
      }
    ]
  });
});

it("processSingleNode is able to re-format an individual node with multiple children", () => {
  let container = new ConversationContainer();

  let map = {
    aa1234: {
      responseText: testString,
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        children: [],
        fallback: ["Sorry. Try asking me in another way?"],
        message: "moveBase"
      }
    },
    bb1234: {
      responseText: "Test123",
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        children: [],
        fallback: ["Sorry. I don't know what you mean?"],
        message: "raiseTicket"
      }
    }
  };

  let node = {
    responseText: testString,
    id: "f1ed1cdc1f497263f1847e2fb76d1878",
    key: "f1ed1cdc1f497263f1847e2fb76d1878",
    value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
    doc: {
      _id: "f1ed1cdc1f497263f1847e2fb76d1878",
      _rev: "1-1758e0832da0471bdc9cb24c826c0583",
      children: [
        { nodeId: "aa1234", intentId: "testIntent1" },
        { nodeId: "bb1234", intentId: "testIntent2" }
      ],
      fallback: [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      message: "silhouette"
    }
  };
  let nodea = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "moveBase",
    ["Sorry. Try asking me in another way?"],
    []
  );
  let nodeb = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "raiseTicket",
    ["Sorry. I don't know what you mean?"],
    []
  );
  nodea.parentId = "f1ed1cdc1f497263f1847e2fb76d1878";
  nodeb.parentId = "f1ed1cdc1f497263f1847e2fb76d1878";
  expect(container.processSingleNode(node, map, "root")).toEqual({
    node: new ConversationNode(
      "f1ed1cdc1f497263f1847e2fb76d1878",
      "silhouette",
      [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      [
        { nodeId: "aa1234", intentId: "testIntent1" },
        { nodeId: "bb1234", intentId: "testIntent2" }
      ]
    ),
    title: "root",
    subtitle: testString,
    conditions: undefined,
    children: [
      {
        node: nodea,
        title: "testIntent1",
        subtitle: testString,
        children: [],
        conditions: undefined
      },
      {
        node: nodeb,
        title: "testIntent2",
        subtitle: "Test123",
        children: [],
        conditions: undefined
      }
    ]
  });
});

it("processSingleNode is able to re-format an individual node with nested children", () => {
  let container = new ConversationContainer();

  let map = {
    aa1234: {
      responseText: "Test1234",
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        children: [{ nodeId: "bb1234", intentId: "test2" }],
        fallback: ["Sorry. Try asking me in another way?"],
        message: "moveBase"
      }
    },
    bb1234: {
      responseText: "Test1235",
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        children: [],
        fallback: ["Sorry. I don't know what you mean?"],
        message: "raiseTicket"
      }
    }
  };

  let node = {
    responseText: testString,
    id: "f1ed1cdc1f497263f1847e2fb76d1878",
    key: "f1ed1cdc1f497263f1847e2fb76d1878",
    value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
    doc: {
      _id: "f1ed1cdc1f497263f1847e2fb76d1878",
      _rev: "1-1758e0832da0471bdc9cb24c826c0583",
      children: [{ nodeId: "aa1234", intentId: "test1" }],
      fallback: [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      message: "silhouette"
    }
  };
  let nodea = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "moveBase",
    ["Sorry. Try asking me in another way?"],
    [{ nodeId: "bb1234", intentId: "test2" }]
  );
  let nodeb = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "raiseTicket",
    ["Sorry. I don't know what you mean?"],
    []
  );
  nodea.parentId = "f1ed1cdc1f497263f1847e2fb76d1878";
  nodeb.parentId = "f1ed1cdc1f497263f1847e2fb76d1878";

  expect(container.processSingleNode(node, map, "rootnode")).toEqual({
    node: new ConversationNode(
      "f1ed1cdc1f497263f1847e2fb76d1878",
      "silhouette",
      [
        "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
      ],
      [{ nodeId: "aa1234", intentId: "test1" }]
    ),
    title: "rootnode",
    subtitle: testString,
    conditions: undefined,
    children: [
      {
        node: nodea,
        title: "test1",
        subtitle: "Test1234",
        conditions: undefined,
        children: [
          {
            node: nodeb,
            title: "test2",
            subtitle: "Test1235",
            children: [],
            conditions: undefined
          }
        ]
      }
    ]
  });
});

it("Conversation nodes should be alphabetically ordered except for 'None' which should be at the bottom ", () => {
  let container = new ConversationContainer();

  let nodes = [
    {
      responseText: testString,
      id: "f1ed1cdc1f497263f1847e2fb76d1878",
      key: "f1ed1cdc1f497263f1847e2fb76d1878",
      value: { rev: "1-1758e0832da0471bdc9cb24c826c0583" },
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1878",
        _rev: "1-1758e0832da0471bdc9cb24c826c0583",
        children: [],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
        ],
        message: "bbbbb"
      }
    },
    {
      responseText: testString,
      id: "f1ed1cdc1f497263f1847e2fb76d1879",
      key: "f1ed1cdc1f497263f1847e2fb76d1879",
      value: { rev: "1-1758e0832da0471bdc9cb24c826c0584" },
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d1879",
        _rev: "1-1758e0832da0471bdc9cb24c826c0584",
        children: [],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
        ],
        message: "aaaaa"
      }
    },
    {
      responseText: testString,
      id: "f1ed1cdc1f497263f1847e2fb76d180",
      key: "f1ed1cdc1f497263f1847e2fb76d180",
      value: { rev: "1-1758e0832da0471bdc9cb24c826c0585" },
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d180",
        _rev: "1-1758e0832da0471bdc9cb24c826c0585",
        children: [],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
        ],
        message: "None"
      }
    },
    {
      responseText: testString,
      id: "f1ed1cdc1f497263f1847e2fb76d181",
      key: "f1ed1cdc1f497263f1847e2fb76d182",
      value: { rev: "1-1758e0832da0471bdc9cb24c826c0586" },
      doc: {
        _id: "f1ed1cdc1f497263f1847e2fb76d181",
        _rev: "1-1758e0832da0471bdc9cb24c826c0586",
        children: [],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
        ],
        message: "zzzzz"
      }
    },
    {
      responseText: testString,
      id: "root",
      key: "root",
      value: { rev: "3-886476295495680153e656056b202b4c" },
      doc: {
        _id: "root",
        _rev: "3-886476295495680153e656056b202b4c",
        children: [
          { intentId: "bbbbb", nodeId: "f1ed1cdc1f497263f1847e2fb76d1878" },
          { intentId: "aaaaa", nodeId: "f1ed1cdc1f497263f1847e2fb76d1879" },
          { intentId: "zzzzz", nodeId: "f1ed1cdc1f497263f1847e2fb76d181" },
          { intentId: "None", nodeId: "f1ed1cdc1f497263f1847e2fb76d180" }
        ],
        fallback: [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way."
        ],
        message: "welcome"
      }
    }
  ];

  let nodea = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1879",
    "aaaaa",
    [
      "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
    ],
    []
  );
  let nodeb = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d1878",
    "bbbbb",
    [
      "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
    ],
    []
  );
  let nodec = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d181",
    "zzzzz",
    [
      "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
    ],
    []
  );
  let noded = new ConversationNode(
    "f1ed1cdc1f497263f1847e2fb76d180",
    "None",
    [
      "Sorry, I'm not sure how exactly to help you. Try asking me in another way?"
    ],
    []
  );
  nodea.parentId = "root";
  nodeb.parentId = "root";
  nodec.parentId = "root";
  noded.parentId = "root";

  expect(container.processConversationNodes(nodes)).toEqual([
    {
      node: new ConversationNode(
        "root",
        "welcome",
        [
          "Sorry, I'm not sure how exactly to help you. Try asking me in another way."
        ],
        [
          { intentId: "aaaaa", nodeId: "f1ed1cdc1f497263f1847e2fb76d1879" },
          { intentId: "bbbbb", nodeId: "f1ed1cdc1f497263f1847e2fb76d1878" },
          { intentId: "zzzzz", nodeId: "f1ed1cdc1f497263f1847e2fb76d181" },
          { intentId: "None", nodeId: "f1ed1cdc1f497263f1847e2fb76d180" }
        ]
      ),
      title: "Welcome",
      subtitle: testString,
      conditions: undefined,
      children: [
        {
          node: nodea,
          title: "aaaaa",
          conditions: undefined,
          subtitle: testString,
          children: []
        },
        {
          node: nodeb,
          title: "bbbbb",
          conditions: undefined,
          subtitle: testString,
          children: []
        },
        {
          node: nodec,
          title: "zzzzz",
          conditions: undefined,
          subtitle: testString,
          children: []
        },
        {
          node: noded,
          title: "None",
          conditions: undefined,
          subtitle: testString,
          children: []
        }
      ]
    }
  ]);
});
