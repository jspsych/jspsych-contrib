export class ChatLog {
  private conversationLog: { role: string; content: string }[]; // keeps track of prompt to send to GPT
  private chatLogs: { role: string; content: string; time: number; keyPressLog?: any }[]; // keeps track of all the chat logs
  private prompt: string;

  constructor() {
    this.conversationLog = [];
    this.chatLogs = [];
  }

  setPrompt(prompt) {
    this.prompt = prompt;
  }

  getPrompt() {
    const newElement = { role: "system", content: this.prompt };
    const tempConversationLog = [...this.conversationLog, newElement];
    return tempConversationLog;
  }

  getChatLogs() {
    return this.chatLogs;
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
    this.conversationLog.push(newPrompt);

    const newMessage = {
      role: role,
      content: content,
      time: time,
      ...(message ? { message: message } : {}),
      ...(keyPressLog ? { keyPressLog: keyPressLog } : {}),
    };
    this.chatLogs.push(newMessage);
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
    this.chatLogs.push(newMessage);
  }

  // Chain Condition -- have it be a list of the chain and what happens before and after
  // called when temporary chainPrompting
  cleanConversation(): {}[] {
    const res = this.conversationLog.filter((message: any, index: number, array: any[]) => {
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
    const res = this.conversationLog.filter((message: any) => {
      if ("role" in message && message["role"] === "system") {
        return false;
      }
      return true;
    });

    // sets the prompts equal to the new one
    this.conversationLog = res;
    // this.updateConversationLog(prompt, "system", undefined, message);
    this.prompt = prompt;

    return this.getPrompt();
  }
}
