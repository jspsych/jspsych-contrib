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

    let startTime = performance.now();

    /*function getResponseTime(){
      if (startTime) {
        var endTime = performance.now();
        var difference = endTime - startTime;
        return difference;
      }
      else {
        startTime = performance.now();
      }
    }*/

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
      return message;
    }

    function getResponseData(message, interlocutorName, startTimeData) {
      return {
        interlocutor: interlocutorName,
        response: message,
        rt: Math.round(performance.now() - startTimeData),
      };
    }

    // Function to handle sending user message, and recording times
    const sendMessage = () => {
      const message = userInput.value.trim();

      //jumps over the finishTrial function to write data for each response for better readability.
      this.jsPsych.data.write(getResponseData(message, "Participant", startTime));

      if (message !== "") {
        addUserMessage(message);

        //resets startTime reference point for bot.
        startTime = performance.now();

        //updates html text while also returning the bot message
        var botMessage = addChatbotMessage(`I reject ${message}! You are wrong!`);

        //jumps over the finishTrial function to write data for each response for better readability.
        this.jsPsych.data.write(getResponseData(botMessage, "Bot", startTime));

        userInput.value = "";
      }

      //resets startTime reference point to mark the beginning of the participant's next response period.
      startTime = performance.now();
    };

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
      this.jsPsych.finishTrial({ endOfTrial: true });
    });
  }
}

export default ChatPlugin;
