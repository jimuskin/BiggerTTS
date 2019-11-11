const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');

const TTS_PERMISSION = 'SEND_TTS_MESSAGES';                     // Permission for TTS messages from command issuer.
const MAX_CHARS = 175;                                          //This is the maximum character count in which the tts bot will actually use audio.

client.on('ready', () => {
    console.log(`Loaded ${config.bot_name}`);
});

//Read client messages.
client.on('message', (message) => {
    if(message.author.bot) return;                     

    //Only continue if the user has TTS.
    if(!message.member.permissions.has(TTS_PERMISSION))
    {
        message.reply("You do not have permission to send TTS messages.");
        return;
    }

    var messageSplit = message.content.split(' ');
    if(messageSplit.length > 0)
    {
        //First check biggerTTS command.
        if(messageSplit[0].toLowerCase() == config.command_name)
        {
            if(messageSplit.length <= 1)
            {
                message.reply(`Usage: ${config.command_name} {message}`);
                return;
            }
            
            //Someone issued TTS command. Read command to console.
            console.log (`${message.author.username} issued TTS command (${message})`); 

            //Break up the message and print out messages based on character limit.
            var splitmsg = message.content.substring(message.content.indexOf(' ') + 1, message.content.length).split(' ');
            var currMessage = "";
            for(var i = 0; i < splitmsg.length; ++i)
            {
                if(splitmsg[i].length + currMessage.length < MAX_CHARS)
                {
                    currMessage += splitmsg[i] + ' ';
                }
                else
                {
                    sendMessage(message.channel, currMessage);

                    currMessage = splitmsg[i] + ' ';
                }
            }
            
            //Print out the last message (won't be detected inside loop)
            if(currMessage != "")
            {
                sendMessage(message.channel, currMessage);
            }
        }
    }
})

//This function actually sends the TTS messages to the channel. 
function sendMessage(channel, message){

    //Sets bot nickname to unreadable character.
    if(config.change_bot_nickname)
        channel.guild.members.get(client.user.id).setNickname('`');                     

    channel.send(`${message} `, {tts: true}).then( (message) => {
        if(config.delete_messages) message.delete(); 
    }, config.delete_delay); 

    //Revert bot nickname to it's original name (specified in console).
    if(config.change_bot_nickname)
        channel.guild.members.get(client.user.id).setNickname(config.bot_name);         
}

client.login(config.discord_token);