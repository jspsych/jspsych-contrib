import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

// thinking about using an enum to define
// -> system, user, bot

const info = <const>{
  name: "chat",
  parameters: {
    // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
    ai_prompt: {
      type: ParameterType.STRING,
      default: "",
    },
    ai_model: {
      type: ParameterType.STRING,
      default: "gpt-3.5-turbo-16k",
    },
    chat_field_placeholder: {
      type: ParameterType.STRING,
      default: "Type your message...",
    },
    additional_prompts: {
      type: ParameterType.COMPLEX,
      array: true,
      pretty_name: "Additional Prompts",
      default: undefined,
      nested: {
        prompt: {
          // prompt to pass into
          type: ParameterType.STRING,
          default: "",
        },
        role: {
          // "prompt", "bot", "bot-fetch"
          type: ParameterType.STRING,
          default: "prompt",
        },
        message_trigger: {
          type: ParameterType.INT,
          default: undefined,
        },
        timer_trigger: {
          type: ParameterType.INT,
          default: undefined,
        },
      },
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
  private prompt: {}[];
  private researcher_prompts: {}[];
  private messages_sent: number;
  private timer_start: number;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Setting up Variables
    let startTime = performance.now();
    this.timer_start = performance.now();
    this.prompt = [{ role: "system", content: trial.ai_prompt }];
    this.researcher_prompts = trial.additional_prompts;
    this.messages_sent = 0;

    // Setting up HTML
    // might want to fix the chat page backgrond to stay similar
    // create a chat buble around the other message from bot
    var html =
      `<div class="chat-page">
      <div class="chat-container">
        <div class="chat-box" id="chat-box"></div>

        <div class="chat-fields">
          <textarea type="text" id="user-input" placeholder="` +
      trial.chat_field_placeholder +
      `"></textarea>
          <button id="send-btn">Send</button>
          <button id="submit-btn">Submit</button>
        </div>
      </div>
    </div>`;

    display_element.innerHTML = html;
    const chatBox = display_element.querySelector("#chat-box") as HTMLElement;
    const userInput = display_element.querySelector("#user-input") as HTMLInputElement;
    const sendButton = display_element.querySelector("#send-btn") as HTMLButtonElement;
    const submitButton = display_element.querySelector("#submit-btn") as HTMLButtonElement;

    // Setting up Trial Logic
    // Function to handle logic of sending user message, and data collection
    const sendMessage = async () => {
      const message = userInput.value.trim();

      //jumps over the finishTrial function to write data for each response for better readability.
      this.jsPsych.data.write(this.getResponseData(message, "Participant", startTime));

      if (message !== "") {
        this.addMessage("user", message, chatBox);
        userInput.value = "";

        //resets startTime reference point for bot.
        startTime = performance.now();

        // Error catching for chatGPT response
        try {
          const response = await this.fetchGPT(this.prompt, trial.ai_model);
          const responseContent = response.message.content;

          this.addMessage("chatbot", responseContent, chatBox);
          //jumps over the finishTrial function to write data for each response for better readability.
          this.jsPsych.data.write(this.getResponseData(responseContent, "Bot", startTime));
        } catch (error) {
          console.error("Error:", error);
          this.addMessage("chatbot", "Error: Failed to get response from ChatGPT", chatBox);
        }

        // inc messages and check researcher prompts
        this.messages_sent += 1;
        this.checkResearcherPrompts(chatBox);
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

    // Setting up Trial
    this.checkResearcherPrompts(chatBox);
  }

  // Call to backend
  async fetchGPT(messages, ai_model) {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, ai_model }),
    });

    const data = await response.json();
    return data;
  }

  // updates prompts behind the scenes when we add messages to the screen
  private updatePrompt(message, role): void {
    const newMessage = { role: role, content: message };
    this.prompt.push(newMessage);
  }

  // Handles updates to system with the prompt and to the screen
  addMessage(role, message, chatBox) {
    const newMessage = document.createElement("div");

    // Handles logic of updating prompts and error checking
    switch (role) {
      case "user":
        this.updatePrompt(message, "user");
        break;
      case "chatbot":
        this.updatePrompt(message, "assistant");
        break;
      case "prompt": // no need to update prompt
        break;
      default:
        console.error("Incorrect role");
        return;
    }

    // Handles shared logic of printing to screen
    newMessage.className = role + "-message";
    newMessage.innerHTML = message.replace(/\n/g, "<br>");
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  checkResearcherPrompts(chatBox): void {
    this.researcher_prompts = this.researcher_prompts.filter((researcher_prompt) => {
      const time_elapsed = performance.now() - this.timer_start;
      if (!("message_trigger" in researcher_prompt) && !("timer_trigger" in researcher_prompt)) {
        console.error("Missing required property in researcher prompt:", researcher_prompt);
        return false; // Remove this item from the array to prevent future errors
      }

      if (
        this.messages_sent >= researcher_prompt["message_trigger"] ||
        time_elapsed >= researcher_prompt["timer_trigger"]
      ) {
        // if case to check if it's equal to bot or prompt or bot_fetch
        this.addMessage(researcher_prompt["role"], researcher_prompt["prompt"], chatBox);
        return false; // Remove this item from the array
      }
      return true; // Keep this item in the array
    });
  }

  getResponseData(message, interlocutorName, startTimeData) {
    return {
      interlocutor: interlocutorName,
      response: message,
      rt: Math.round(performance.now() - startTimeData),
    };
  }
}

export default ChatPlugin;
