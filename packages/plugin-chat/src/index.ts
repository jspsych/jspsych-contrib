import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "chat",
  parameters: {
    parameter_name: {
      type: ParameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
  },
};

type Info = typeof info;

/**
 * **chat**
 *
 * Chat interface for running experiments using LLMs
 *
 * @author Victor Zhang and Niranjan Baskaran
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-chat/README.md}}
 */
class ChatPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // data saving
    var trial_data = {
      parameter_name: "parameter value",
    };

    this.jsPsych.pluginAPI.setTimeout(() => {
      display_element.querySelector<HTMLElement>(
        "#jspsych-html-keyboard-response-stimulus"
      ).style.visibility = "hidden";
    }, 5000);

    var transcript = [];
    var html = `<div class="chat-container">
      <div class="chat-box" id="chat-box"></div>

      <div class="chat-fields">
        <textarea type="text" id="user-input" placeholder="Type your message..."></textarea>
        <button id="send-btn">Send</button>
        <button id="submit-btn">Submit</button>
      </div>
    </div>`;

    display_element.innerHTML = html;

    const chatBox = display_element.querySelector("#chat-box") as HTMLElement;
    const userInput = display_element.querySelector("#user-input") as HTMLInputElement;
    const sendButton = display_element.querySelector("#send-btn") as HTMLButtonElement;
    const submitButton = display_element.querySelector("#submit-btn") as HTMLButtonElement;

    // Function to add user message to the chat box
    function addUserMessage(message) {
      const userMessage = document.createElement("div");
      userMessage.className = "user-message";
      userMessage.innerHTML = message.replace(/\n/g, "<br>"); // Replace newline characters with <br> tags
      chatBox.appendChild(userMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to add chatbot message to the chat box
    function addChatbotMessage(message) {
      const chatbotMessage = document.createElement("div");
      chatbotMessage.className = "chatbot-message";
      chatbotMessage.innerHTML = message.replace(/\n/g, "<br>"); // Replace newline characters with <br> tags
      chatBox.appendChild(chatbotMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    // Function to handle sending user message
    function sendMessage() {
      const message = userInput.value.trim();
      if (message !== "") {
        addUserMessage(message);
        // Here you would typically send the user message to your backend server for processing
        // and receive a response from the chatbot, then call addChatbotMessage with the response
        // For demonstration purposes, let's just mimic a simple response from the chatbot
        setTimeout(function () {
          addChatbotMessage("This is a response from the chatbot.");
        }, 500);
        userInput.value = "";
      }
    }

    // Event listener for send button click
    sendButton.addEventListener("click", sendMessage);

    // Event listener for Enter key press
    userInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        if (!event.shiftKey) {
          event.preventDefault(); // Prevent default behavior of adding new line
          sendMessage();
        }
      }
    });

    submitButton.addEventListener("click", () => {
      this.jsPsych.finishTrial(trial_data);
    });
  }
}

export default ChatPlugin;
