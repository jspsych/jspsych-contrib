We will implement plugin-heat-common-resources with jspsych standards and jspsych tools and functions. Use jspsych tools as a first resort if possible before defaulting to html or anything else. For example, use jspsych.randomization when you need to randomize lists or get numbers etc. Remember, plugins should be self contained pages of experiments. 

See examples:
I have asked you to read plugin-image-hotspots as its a well implemented example plugin. Go also read spatial-nback as well as that has a css file, and we will want to implement a css file for heat-common that works across all devices. I am not asking you to necessarily copy the exact style of any of these plugins, but they can be decent examples to keep in mind in terms of code structure. At any point 
in our coding, feel free to reread these plugins OR/AND ASK ME QUESTIONS if you need to make important implementation decisions.

Another thing about our plugin is that it might need multiple pages for when cooling isnt achieved or for when cooling is achieved or when another player burns etc... But the idea for plugins is that one "task" or experiment should be self contained. This should not have the ability to run a full experiment on its own. That is not how jspsych implements plugins.

Here is the message we received for this task development, this will include things that should not be in the plugin but in the experiment itself (such as the instruction to the player before the task itself, which again arent part of plugins per jspsych.).
//
There is one other task that we have come up with to represent a Common Resource dilemma in a heat context. 

Basic Setup
Participants: 1 human participant per session (others are simulated). Group size: 5 players total (participant + 4 simulated players)

Each player receives: 10 cooling tokens

Each "round" is independent, i.e. it's a one-time decision and then the 10 tokens are recovered fully. I think 3 repetitions would be sufficient. 
Simulated players would optimally behave randomly giving 4-6 tokens. 
Token Allocation: 
The participant decides how many of their 10 tokens to:  
Keep for themselves (go into Personal Cooling Pot)  OR  Contribute to a Group Cooling Pot
Survival Thresholds:
If Group Cooling Pot ≥ 25 tokens:

Mobile cooling station is deployed

Player survives if they kept at least 2 tokens

If Group Cooling Pot < 25 tokens:

No station

Player survives if they kept at least 6 tokens

This is the current draft of the instruction to the players: 

-------------------------

We now ask you to participate in the following game. You are part of a group of players (5 in total), and you are all currently facing a dangerous heatwave, which you all want to survive undamaged.
Each of you have 10 cooling tokens. They represent your personal ability to stay cool, such as using fans/AC, cold showers etc.

To take no damage from the heat, you can  use your personal cooling: this requires you to keep 6 cooling tokens in your Personal Cooling pot. 

Alternatively, you can contribute to a common Group Cooling Pot: if your group contributes 25 tokens or more in total to your Group Pot, a mobile cooling station is deployed. This reduces the heat exposure for everyone, and each person then only needs 2 tokens to stay safe.

How many of your 10 cooling tokens would you like to contribute to the shared Group Cooling Pot?

-------------------------

I was wondering if there might be a fun way to display this task that's not just a slider, but actually put sort of 5 meeple type symbols with their 10 tokens and a pot in the middle that the Human Player can fill up and then also sort of turn red those players that get overwhelmed by the heat. Sort of like below the graph, but it doesnt have to look like that, I just imaged it like that.
//

While this message contains specific numbers, remember that a plugin must be generic and have no hardcoded values for it to be reused in different experiements, and we will do this through good parameter design. However, we also want to try to not to overengineer this.
I think some important parameters to include would be: # of players, # of tokens to start, # of tokens to achieve cooling, # required to stay cool with and without cooling

VISUALS:
Now, for some diagrams, examine the two hotcognition pictures in the plugin-heat-common-resources directory. We want the players around the pot and for them to turn into red if they burn etc (generally, make html tags for this type of stuff so it is editable in CSS). Then, the player should be able to click on the pot itself to contribute (they keep clicking it to contribute one token per click, and when they are done they can hit done.) (should not have words, should be a language-less understandable symbol so we dont need to translate it) Every player should look like a general person emoji (kind of like this 👤), and on the task-taker's player it should say "you." (this should be a parameter). Under the task-takers name, it should display a number (the number of tokens the player has). Under the other simulated players, it should be either ? or the number of tokens based on a parameter (show players tokens or somethign like this, find good short names for these). Additionally, there should be an optional parameter array to input custom names for the players. If provided less names than number of players, then name the unnamed players anonymous. right under the pot should be the "done" button.

DESIGN:
after the player hits the contribute button however many times until they run out of tokens, they may hit done. Once they hit done, show another page with the feedback of who has burned and if the cooling pot has cooled? (blue?) and what people are cool? Idk I havent thought about the feedback part very much and what it should look like, but what do you think would be a good simple way to show feedback?

Additionally, while the diagram sketch looks like a mobile version, we do not want that to be in the default css. We want the default css to be targeted at desktop and give a generic jspsych-y feel. You can look through other packages to see what that may look like. Then, we want to make a css file, we want it to look a little nicer and work with mobile. For this, we want the pot and the button DONE to look nice and centered right above each other with the players around them. We kind of want things to be dark gray themed like in C:\Users\abood\Desktop\URSI2\jspsych-timelines\packages\go-nogo\src\css\styles.css. You may go through this package also, BUT THIS IS NOT A PLUGIN. THIS IS A TIMELINE. THIS IS A FULL IMPLEMENTATION OF A FULL FLEDGED EXPERIMENT AND THIS IS NOT WHAT WE ARE DEVELOPING HERE.

make a simple.html and index.html with the css file 

ask me if you have any questions, no matter how little they may be, if you are confused ask me!


///////////////////
ADDITIONAL PROMPTS IN IMPLEMENTATION:

I dont want an instructions phase in any of our html files. And I just said to make two files index and simple. index has css and simple does not.

Also, our plugin should be by default look like I described: Players AROUND the pot. the pot should not be an emoji but maybe an html image like a square or something. Two swquares inside of each other: one outer blue square (not clickable) and inside that a smaller square dark gray that has a water symbol or something idfk be creative. The players should be AROUND this square. Our player should be randomized in one of the players' positions to make it seem like we have a different position every time and that it seems like an actual multiplayer lobby

simple html looks WAY too basic. I know I said we should give it generic html feel, but this is completely undeployable and looks horrible. We need it to look like a fully fledged experiment, but without crazy styling is the point. The plugin should have some default styling to make the players go around the pot and the pot whole two squares thing and the done button being under the squares should be there by default too. The CSS should just be changing colors, sizes, etc and not adding new shapes and stuff. The css is onl to make stuff nicer and not change what already should be there.