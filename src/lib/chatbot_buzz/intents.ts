export type IntentTag =
  | "greeting"
  | "goodbye"
  | "help"
  | "report-lost"
  | "report-found"
  | "check-status"
  | "account"
  | "default";

export interface Intent {
  tag: IntentTag;
  patterns: string[];
  responses: string[];
}

export const intents: Intent[] = [
  {
    tag: "greeting",
    patterns: [
      "hi",
      "hello",
      "hey",
      "yo",
      "what's up",
      "good morning",
      "good afternoon",
      "good evening"
    ],
    responses: [
      "Hey! I'm BuzzBot 🐝. I can help you with lost & found on BuzzFinder.",
      "Hi there! Ask me how to report or find an item on BuzzFinder.",
      "Hello! Need help posting a lost or found item?"
    ]
  },
  {
    tag: "help",
    patterns: [
      "help",
      "how does this work",
      "what can you do",
      "how to use buzzfinder",
      "how to use this",
      "i need help"
    ],
    responses: [
      "I can explain how to report lost items, post found items, check item status, and basic account questions.",
      "Ask me things like “How do I report a lost item?” or “How do I post something I found?”"
    ]
  },
  {
    tag: "report-lost",
    patterns: [
      "report lost item",
      "i lost something",
      "i lost my",
      "how do i report a lost item",
      "where do i report a lost item",
      "lost and found report",
      "submit lost item"
    ],
    responses: [
      "To report a lost item, go to the **Report Item** page (or visit `/report-item`) and fill in the item details and where you lost it.",
      "You can report a lost item by clicking on **Report Item** in the menu and submitting the form with a description, location, and contact info."
    ]
  },
  {
    tag: "report-found",
    patterns: [
      "i found something",
      "post found item",
      "found item",
      "how do i post a found item",
      "where do i post a found item"
    ],
    responses: [
      "Nice! To post a found item, use the **Post Item** page (or visit `/post`) and include where you found it so the owner can reach you.",
      "You can post a found item from the **Post Item** section. Add a short description, location, and how the owner can contact you."
    ]
  },
  {
    tag: "check-status",
    patterns: [
      "check status",
      "has anyone found my item",
      "track my item",
      "did someone claim",
      "how to see my posts",
      "where is my post",
      "my lost item post"
    ],
    responses: [
      "To check the status of your posts, go to your **Dashboard** or **User** page and look at your active lost/found items.",
      "You can see your lost & found posts under your account page. From there you can edit or close a listing if the item is found."
    ]
  },
  {
    tag: "account",
    patterns: [
      "sign up",
      "login",
      "log in",
      "sign in",
      "create account",
      "forgot password"
    ],
    responses: [
      "You can sign up or log in from the **Sign Up / Login** button in the header. BuzzFinder uses your GT email to keep things safe.",
      "To create an account, go to the signup page, fill in your details, and then you can post or manage items."
    ]
  },
  {
    tag: "goodbye",
    patterns: [
      "bye",
      "goodbye",
      "see you",
      "thanks, bye",
      "talk to you later"
    ],
    responses: [
      "Bye! Hope you find what you’re looking for 🐝",
      "See you later! Come back if you need help with another item.",
      "Goodbye! BuzzFinder is here whenever you need it."
    ]
  },
  {
    tag: "default",
    patterns: [],
    responses: [
      "Hmm, I’m not sure I understood that. Try asking about reporting a lost item, posting a found one, or checking your posts.",
      "I might not know that yet 😅. Ask me something like “How do I report a lost item?” or “How do I post something I found?”"
    ]
  }
];
