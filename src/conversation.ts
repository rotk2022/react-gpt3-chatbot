import Cookies from 'js-cookie';
import defaultSettings from './characters';
import{ChatCompletionRequestMessage,ChatCompletionRequestMessageRoleEnum} from "openai";


class Conversation {
    systemMessage:ChatCompletionRequestMessage;
    // conversation: string;
    // num_user_inputs: number;
    settings: any;
    Messages:Array<ChatCompletionRequestMessage>;
    

    constructor(settings: any) {
        // this.conversation = "";
        // this.num_user_inputs = 0;
        this.settings = settings;
        const tip='You are ChatGPT helping the User with coding. You are intelligent, helpful and an expert developer, who always gives the correct answer and only does what instructed. You always answer truthfully and do not make things up. When responding to the following prompt, please make sure to properly style your response using Github Flavored Markdown. Use markdown syntax for things like headings, lists, colored text, code blocks, highlights etc. Make sure not to mention markdown or styling in your actual response'
        this.systemMessage={role:ChatCompletionRequestMessageRoleEnum.System,content:tip}
        this.Messages=[this.systemMessage];

    }
    RefreshMessages(){
        this.Messages=[this.systemMessage]
    }
    AddUserMessage(content:string){
        const max=this.settings["MAX_NUM_MESSAGE_INPUTS"]
        if (this.Messages.length>max){
            this.RefreshMessages()
        }
        const role=ChatCompletionRequestMessageRoleEnum.User
        const message={role:role,content:content}
        this.Messages.push(message)
    }
    AddAssistanceMessage(content:string){
        const role=ChatCompletionRequestMessageRoleEnum.Assistant
        const message={role:role,content:content}
        this.Messages.push(message)
    }
}

export default Conversation;