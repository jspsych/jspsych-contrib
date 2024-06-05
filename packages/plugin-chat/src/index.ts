import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
// import OpenAI from "openai"; archived backend server

const info = <const>{
  name: "chat",
  parameters: {
    // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX

    openai_key: {
      // unnecessary parameter because need to include within
      type: ParameterType.KEY,
      default: undefined,
    },
    ai_prompt: {
      type: ParameterType.STRING,
      default: "",
    },
    ai_model: {
      type: ParameterType.STRING,
      default: "gpt-3.5-turbo-16k",
    },
    subject_prompt: {
      type: ParameterType.STRING,
      default: "",
    },
    chat_field_placeholder: {
      type: ParameterType.STRING,
      default: "Type your message...",
    },
    additional_prompts: {
      // need to figure out how to implement this
      type: ParameterType.STRING,
      default: "",
    },
    additional_prompt_trigger: {
      type: ParameterType.INT,
      default: 10000,
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
  private messages: {}[];

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Setting up Variables
    let startTime = performance.now();
    let messages_sent = 0;
    this.messages = [{ role: "system", content: trial.ai_prompt }];

    // const openai = new OpenAI({ apiKey: trial.openai_key, dangerouslyAllowBrowser: true }); ARCHIVED - backend server
    // Setting up HTML
    // might want to fix the chat page backgrond to stay similar
    // include a prompting feature that displays a prompt in the middle of the page
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
        this.updatePrompt(message, "user");

        //resets startTime reference point for bot.
        startTime = performance.now();
        try {
          const response = await this.fetchGPT(this.messages, trial.ai_model);
          const responseContent = response.message.content;

          this.addMessage("chatbot", responseContent, chatBox);
          this.updatePrompt(responseContent, "assistant");
          //jumps over the finishTrial function to write data for each response for better readability.
          this.jsPsych.data.write(this.getResponseData(responseContent, "Bot", startTime));
        } catch (error) {
          console.error("Error:", error);
          this.addMessage("chatbot", "Error: Failed to get response from ChatGPT", chatBox);
        }

        messages_sent++; // testing one possible implementation, will need to adjust how this is implemented
        if (messages_sent === trial.additional_prompt_trigger) {
          this.addMessage("prompt", trial.additional_prompts, chatBox);
        }
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
    this.addMessage("prompt", trial.subject_prompt, chatBox);
  }

  updatePrompt(message, role): void {
    const newMessage = { role: role, content: message };
    this.messages.push(newMessage);
  }

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

  // user, chatbot, prompt
  addMessage(sender, message, chatBox) {
    const newMessage = document.createElement("div");
    newMessage.className = sender + "-message";
    newMessage.innerHTML = message.replace(/\n/g, "<br>"); // Replace newline characters with <br> tags
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight; // scroll a little bit higher
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
