import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { ChatCompletionStream } from "openai/lib/ChatCompletionStream";

// thinking about using an enum to define
// -> system, user, bot
// naming convention a little weird because of chatGPT calling models "assistants"

const info = <const>{
  name: "chat",
  parameters: {
    // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
    ai_prompt: {
      type: ParameterType.STRING,
      default: undefined,
    },
    ai_model: {
      type: ParameterType.STRING,
      default: "gpt-3.5-turbo-16k",
    },
    chat_field_placeholder: {
      type: ParameterType.STRING,
      default: "Type your message here...",
    },
    continue_button: {
      type: ParameterType.COMPLEX,
      default: {},
      nested: {
        timer_trigger: {
          type: ParameterType.INT,
        },
        message_trigger: {
          type: ParameterType.INT,
        },
        prompt: {
          type: ParameterType.STRING,
        },
      },
    },
    additional_prompts: {
      type: ParameterType.COMPLEX,
      array: true,
      pretty_name: "Additional Prompts",
      default: undefined,
      nested: {
        // at one point used nested others used parameters
        prompt: {
          // prompt to pass into
          type: ParameterType.STRING,
          default: "",
        },
        role: {
          // "prompt", "chatbot", "chatbot-fetch"
          type: ParameterType.STRING,
          default: "prompt",
        },
        message_trigger: {
          type: ParameterType.INT,
          default: undefined,
        },
        timer_trigger: {
          type: ParameterType.INT,
          default: 1000000,
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
  private prompt: {}[]; // keeps track of prompt to send to GPT
  private researcher_prompts: {}[]; // keeps track of researcher's prompts that need to be displayed
  private messages_sent: number; // notes number of messages sent to calculate prompts
  private timer_start: number; // notes beginning of session in order to calculate prompts
  private ai_model: string; // keeps track of model

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.initializeTrialVariables(trial);

    var html =
      `<div class="chat-page">
      <div class="bot-title">
        <h1 class="bot-title-text">Adorabot</h1>
      </div>
      <div class="chat-container">
        <div class="chat-box" id="chat-box"></div>

        <div class="chat-fields"> 
          <textarea type="text" id="user-input" placeholder="` +
      trial.chat_field_placeholder +
      `"></textarea>
          <button id="send-btn">Send</button>
          <button id="continue-btn" style="display: none;">Continue</button>
        </div>
      </div>
    </div>`;

    display_element.innerHTML = html;
    const chatBox = display_element.querySelector("#chat-box") as HTMLElement;
    const userInput = display_element.querySelector("#user-input") as HTMLInputElement;
    const sendButton = display_element.querySelector("#send-btn") as HTMLButtonElement;
    const continueButton = display_element.querySelector("#continue-btn") as HTMLButtonElement;

    // Setting up Trial Logic
    // Function to handle logic of sending user message, and data collection
    const sendMessage = async () => {
      const message = userInput.value.trim();

      if (message !== "") {
        this.addMessage("user", message, chatBox);
        userInput.value = "";

        await this.updateAndProcessGPT(chatBox);
        // inc messages and check researcher prompts
        this.messages_sent += 1;
        this.checkResearcherPrompts(chatBox, continueButton);
      }
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

    continueButton.addEventListener("click", () => {
      this.jsPsych.finishTrial({ chatLogs: this.prompt });
    });

    // Setting up Trial
    this.checkResearcherPrompts(chatBox, continueButton);
  }

  initializeTrialVariables(trial: TrialType<Info>) {
    this.timer_start = performance.now();
    this.messages_sent = 0;
    this.ai_model = trial.ai_model;

    // sets prompt
    this.prompt = [];
    this.updatePrompt(trial.ai_prompt, "system");
    // sets researcher prompts and removes any that can't trigger
    this.researcher_prompts = trial.additional_prompts.filter((researcher_prompt) => {
      if (!("message_trigger" in researcher_prompt) && !("timer_trigger" in researcher_prompt)) {
        console.error("Missing required property in researcher prompt:", researcher_prompt);
        return false;
      }
      return true;
    });

    const continue_button = trial.continue_button;
    if (!("message_trigger" in continue_button) && !("timer_trigger" in continue_button)) {
      console.error("Missing required property in continue prompt, will never display");
    }
    continue_button["role"] = "continue";
    this.researcher_prompts.push(continue_button);
  }

  private waitForFiveSeconds() {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000); // Resolve the promise after 5 seconds
    });
  }

  // Call to backend
  async fetchGPT(messages) {
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, ai_model: this.ai_model }), // Corrected JSON structure
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const runner = ChatCompletionStream.fromReadableStream(response.body);
      console.log(runner);

      runner.on("content", (delta, snapshot) => {
        console.log(delta);
        // or, in a browser, you might display like this:
        // document.body.innerText += delta; // or:
        // document.body.innerText = snapshot;
      });
      await this.waitForFiveSeconds();
      console.log(runner);
      console.dir(await runner.finalChatCompletion(), { depth: null });

      // const data = await response.json();
      // return data;
      return "";
    } catch (error) {
      console.error("Error fetching GPT data:", error);
      throw error; // Rethrow the error after logging it
    }
  }

  // updates prompts behind the scenes when we add messages to the screen
  private updatePrompt(message, role): void {
    const time = Math.round(performance.now());
    const newMessage = { role: role, content: message, time: time };
    this.prompt.push(newMessage);
  }

  // Handles updates to system with the prompt and to the screen
  async addMessage(role, message, chatBox, continueButton?) {
    // Handles logic of updating prompts and error checking
    switch (role) {
      case "user":
        this.updatePrompt(message, "user");
        break;
      case "chatbot": // make this appear a bit at a time
        this.updatePrompt(message, "assistant");
        break;
      case "prompt": // same with this
        break;
      case "continue":
        if (!continueButton) {
          console.error("No continue button to display");
          return;
        }
        role = "prompt"; // use same style as promp
        continueButton.style.display = "block";
        break;
      default:
        console.error("Incorrect role");
        return;
    }

    await this.typeMessage(role, message, chatBox);
  }

  private typeMessage(role, message, chatBox): Promise<void> {
    return new Promise((resolve) => {
      const newMessage = document.createElement("div");
      newMessage.className = role + "-message";
      newMessage.innerHTML = "";
      chatBox.appendChild(newMessage);

      if (role === "continue" || role === "user" || role === "prompt") {
        newMessage.innerHTML = message.replace(/\n/g, "<br>");
        chatBox.scrollTop = chatBox.scrollHeight;
        resolve();
      } else {
        const sentences = message.split(/(?<=[.!?])\s+/); // Split message into sentences
        let index = 0;

        const interval = setInterval(() => {
          if (index < sentences.length) {
            newMessage.innerHTML +=
              (index > 0 ? " " : "") + sentences[index].replace(/\n/g, "<br>");
            chatBox.scrollTop = chatBox.scrollHeight;
            index++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 1000); // Adjust the interval time (in milliseconds) as needed
      }
    });
  }

  async updateAndProcessGPT(chatBox) {
    try {
      const response = await this.fetchGPT(this.prompt);
      console.log(response);
      // const responseContent = response.message.content;
      const responseContent = "filling while testing";
      await this.addMessage("chatbot", responseContent, chatBox);
      return responseContent;
    } catch (error) {
      await this.addMessage("chatbot", "error fetching bot response", chatBox);
      return "failing";
    }
  }

  checkResearcherPrompts(chatBox, continueButton): void {
    this.researcher_prompts = this.researcher_prompts.filter((researcher_prompt) => {
      // Checking conditions to trigger the prompt
      const time_elapsed = performance.now() - this.timer_start; // could instead keep subtracting from time_elapsed
      if (
        this.messages_sent >= researcher_prompt["message_trigger"] ||
        time_elapsed >= researcher_prompt["timer_trigger"]
      ) {
        // Checking with prompt to trigger
        switch (researcher_prompt["role"]) {
          case "chatbot":
          case "prompt": // want these cases to have the same functionality
            this.addMessage(researcher_prompt["role"], researcher_prompt["prompt"], chatBox);
            break;
          case "chatbot-fetch":
            this.addMessage("user", researcher_prompt["prompt"], chatBox);
            this.updateAndProcessGPT(chatBox);
            break;
          case "continue":
            this.addMessage("continue", researcher_prompt["prompt"], chatBox, continueButton);
            break;
          default:
            console.error("Incorrect role for prompting");
        }

        return false; // Remove this item from the array
      }
      return true; // Keep this item in the array
    });
  }
}

export default ChatPlugin;
