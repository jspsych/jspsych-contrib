export class ChatLog {
  private conversation_log: { role: string; content: string }[]; // keeps track of previous conversation to send to GPT
  private final_data: { role: string; content: string; time: number; keyPressLog?: any }[]; // keeps track of data to print
  private prompt: string;

  constructor() {
    this.conversation_log = [];
    this.final_data = [];
  }

  setPrompt(prompt) {
    const time = Math.round(performance.now());

    const newMessage = {
      role: "system",
      content: prompt,
      time: time,
    };

    this.final_data.push(newMessage);
    this.prompt = prompt;
  }

  getPrompt() {
    const newElement = { role: "system", content: this.prompt };
    const tempConversationLog = [...this.conversation_log, newElement];
    return tempConversationLog;
  }

  getChatLogs() {
    return this.final_data;
  }

  // replaces current update prompt, possibly replace to pass in objct
  updateConversationLog(content, role, keyPressLog?, message?): void {
    if (role === "system")
      console.log(
        "WARNING: this case is not caught and is incorrectly trigerring outadated method",
        "content:",
        content,
        "role:",
        role
      );

    const time = Math.round(performance.now());
    const newPrompt = { role: role, content: content };
    this.conversation_log.push(newPrompt);

    const newMessage = {
      role: role,
      content: content,
      time: time,
      ...(message ? { message: message } : {}),
      ...(keyPressLog ? { keyPressLog: keyPressLog } : {}),
    };
    this.final_data.push(newMessage);
  }

  // addMessage, can ahve this replace updatePrompt
  // work in functionaltiy to tie it in
  logMessage(message, role) {
    const time = Math.round(performance.now());

    const newMessage = {
      role: role,
      content: message,
      time: time,
    };
    this.final_data.push(newMessage);
  }

  // Chain Condition -- have it be a list of the chain and what happens before and after
  // called when temporary chainPrompting
  cleanConversation(): {}[] {
    const res = this.conversation_log.filter((message: any, index: number, array: any[]) => {
      if ("role" in message && message["role"] === "system") {
        return false;
      }
      // Exclude the last message because will be user message - only want existing conversation
      if (index === array.length - 1) {
        return false;
      }
      return true;
    });

    return res;
  }

  // call when adding a new prompt
  cleanSystem(prompt, message?) {
    // cleans existing prompts
    const res = this.conversation_log.filter((message: any) => {
      if ("role" in message && message["role"] === "system") {
        return false;
      }
      return true;
    });

    this.conversation_log = res;

    this.setPrompt(prompt);
    return this.getPrompt();
  }
}
