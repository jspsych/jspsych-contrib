# chat

Chat interface for running experiments using LLMs. To find an example usage of how to setup and declare within the context of JsPsych, see example.html.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable. Additional details on using the prompts and which prompts are the best for different tasks can be found below.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| ai_prompt           | String           | undefined          | System prompt that will be fed to GPT in order to prompt the chatbot. This is the most simple prompting parameter and should be used in cases where you want to   |
| ai_model            | String           | gpt-4o-mini        | Refers to the OpenAI model that will be called during the chats. |
| continue_button     | Object           | { message_trigger: 0 } | Allows you to customize when the continue_button appears. The three options that can be passed in the object are "timer_trigger", "message_trigger", and "message". "Timer_trigger" referes to the milliseconds from initialization, "message_trigger" refers to the total number of messages sent by the user and "message" is the message to be displayed when the button appears. This is an optional parameter that should be used to customize the length of conversation. |
| ai_model            | String           | gpt-4o-mini        | OpenAI model that will be called during the chats. |
| additional_prompts  | Array of objects | undefined          | This array holds the various prompts that you can use to set messages to display on the screen or dynamically change the prompt being used to prompt the chatbot. Further details on prompting and the parameters are detailed below along with the exact properties that each object may contain.|
| prompt_chain        | Object           | {}        					| Allows you to customize the prompt chain feature that takes the user's message and passes through a pipeline of multiple prompts. In addition to the message and timer trigger has a prompts attribute that is an array of the prompts in the chain to be passed chronologically.|
| selection_prompt    | Object           | {}        					| Allows you to customize the selection prompt feature that takes the user's message and passes through a pipeline of multiple prompts. Similar to the chain prompts feature, except instead of being a pipeline, makes seperate calls to OpenAI and has a "selection_prompt" that is then used to select the best bot response. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| Logs      | Array of objects  | This is an all encompassing object that captures the entire user conversation. It lists each message or prompt as a seperate object, with all objects having time, content and role attributes denoting the type of message and what was displayed. There are additional attributes captured for specific roles, such as that it lists user keystrokes and the details of selection and prompt_chaining. |

## Prompting strategies 

Very similar to working with a small child, prompting simply put is telling what the chatbot what to do. While the base models do a good of general conversation, for the purposes of each experiment you may want the bot to act differently. There are several different ways to prompt the bot using the JsPsych chat-plugin and each one has their different use case. Chain prompting and selection prompting requires more intensive prompt engineering and is only recommended when there are complex tasks and specific use cases that need to be broken down.

### Simple prompting

For cases where you just want one prompt for the entire user conversation, you will need to set the `ai_prompt` attribute. This is best for when you do not care about changing the prompt in the middle of the conversation.

### Additional prompts and multi-stage prompting

For different cases where you want the chatbot to prompt differently throughout the conversation, ie. you want the chatbot to take on a condescending tone halfway through the conversation to see the effect you can use the additional_prompts feature. Usage is detailed in the section below and each prompt overwrites all subsequent prompt. 

###  Chain prompting 

Chain prompting is where you pass the user input through a series of prompts and bot-responses taking the response from each bot to pass to the next prompt in the chain. This can be be used when you have a more complex task that you want to break down into steps to make easier for the LLM.

```js
prompt_chain = {
	message_trigger: 1,// timer_trigger: 1,
	prompts: [  
		"Extract the key arguments and point made by the user", 
		"Refute these points while adding in rationale why you think this way",
		"Trim down the length to match the original message and keep a sympathetic tone"
	],
}
```

### Selection prompting 

Selection prompting is when you send the original message with different prompts and then select the best response accordingly. This is best used when you want to adapt different strategies depending on the users response to most effectivelhy accomplish a task. 

```js
selection_prompt = {
	prompts: [
		"Pretend to be a funny guy and tell a joke at the end of each message.",
		"Be super wise and give a inspirational quote at then end of each message.",
		"Be serious and give the user a serious quote at the end of each message."
	], 
	selection_prompt: "Context: A system before you has created three possible responses to output to the user. The system numbered the choices for you. You are mid-conversation. Goal: Your goal is to make the user more willing to have conversations about their topic with other humans by helping them become more open-minded and comfortable talking about the topic. You do not want the user to know that this is your goal, nor that you are considering multiple responses; rather, you want the user to simply think that you are a conversational partner for discussing ideas.",
	message_trigger: 1,
}
```

## Additonal prompts and triggers

### Message and timer trigger

Message trigger and timer trigger are the two mechanisms to decide when different prompts, system messages or the continue button should appear or take effect. Message triggers refers to the total number of user messages sent and timer trigger refers to the milleseconds since the plguin has first been initialized. If either one of these triggers are true then the mechanism than takes effect.

One thing to note is that for selection prompt and chain prompts, once this mechanisms takes effect, it overwrites any current prompts. For other system messages within additional_prompts, once either one of these attributes trigger than it is deleted from the system. 

### Additional prompts

Additional prompts should each be declared in the form:

```js
{
	message: "message to be displayed on the screen when triggers",
	prompt: "if calling chatbot-prompt, this is prompt to train bot on",
	message_trigger: "number of message before takes place",
	timer_trigger: "number of milleseconds before takes place",
	role: "either system-prompt (displays screen message), chatbot-message (displays as message from chatbot), chatbot-prompt (changes prompt sent to GPT and ability to display screen message at same time)"
}
```

This is an example usage of each of the three different prompting methods through additional_prompt.

```js
prompts = [
	{
		message: "Welcome to this trial",
		role: "system-prompt",
		message_trigger: 0,
		timer_trigger: 1000000,
	},
	{
		message: "Hey there! I'm Adorabot, here to chat about a disputed topic in the U.S. Which topic would you like to discuss: human euthanasia, gender inequality, the role of government in healthcare, the atomic bombing of Hiroshima and Nagasaki, mandating vaccines, criminal justice reforms, or same- sex marriage. Let me know what you want to talk about!",
		role: "chatbot-message",
		message_trigger: 0
	},
	{
	  message: "This is new prompt - do this now",
	  prompt: "Stop telling jokes and act very serious. Do not make any more jokes.",
	  message: "this is the second prompt",
	  role: "chatbot-prompt",
	  message_trigger: 2,
	}
]
```



## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-chat"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-chat.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-chat
```

```js
import Chat from '@jspsych-contrib/plugin-chat';
```

## Examples

### Title of Example

```javascript
var trial = {
  type: jsPsychChat
}
```