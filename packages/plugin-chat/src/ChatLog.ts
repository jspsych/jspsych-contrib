export class ChatLog {
  private prompt: { role: string; content: string }[]; // keeps track of prompt to send to GPT
  private chatLogs: { role: string; content: string; time: number; keyPressLog?: any }[]; // keeps track of all the chat logs

  constructor() {
    this.prompt = [];
    this.chatLogs = [];
  }

  getPrompt() {
    return this.prompt;
  }

  getChatLogs() {
    return this.chatLogs;
  }

  // replaces current update prompt, possibly replace to pass in objct
  updatePrompt(content, role, keyPressLog?, message?): void {
    const time = Math.round(performance.now());
    const newPrompt = { role: role, content: content };
    this.prompt.push(newPrompt);

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
    const res = this.prompt.filter((message: any, index: number, array: any[]) => {
      if ("role" in message && message["role"] === "system") {
        return false;
      }
      // Exclude the last message, why? - only called when needed
      if (index === array.length - 1) {
        return false;
      }
      return true;
    });

    return res;
  }

  // call when adding a new prompt
  cleanSystem(prompt, message?): {}[] {
    // cleans existing prompts
    const res = this.prompt.filter((message: any) => {
      if ("role" in message && message["role"] === "system") {
        return false;
      }
      return true;
    });

    // sets the prompts equal to the new one
    this.prompt = res;
    this.updatePrompt(prompt, "system", undefined, message);
    return this.prompt;
  }
}
