import Chat, {  useMessages } from "@chatui/core";
import { useState } from "react";
import Conversation from "./conversation";
import defaultSettings from "./characters";
import { Configuration, OpenAIApi } from "openai";
import Cookies from "js-cookie";
import GrammarChecker from "./grammarChecker";
import './App.css';
import {marked} from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'



const ChatArea = ({ setCurrent }: any) => {
    const storedApiKey = Cookies.get("apiKey");
    const { messages, appendMsg, setTyping } = useMessages([]);
    const [openai, setOpenai] = useState(new OpenAIApi(new Configuration({ apiKey: storedApiKey })));

    const [grammarChecker, setGrammarChecker] = useState(new GrammarChecker(Cookies.get("language") || defaultSettings.LANGUAGE, new Configuration({ apiKey: Cookies.get("apiKey") })));

    // Conversation hook
    const [conversation, setConversation] = useState(new Conversation(defaultSettings));

    function handleSend(type: any, val: string) {
        if (type === 'text' && val.trim()) {
            appendMsg({
                type: 'text',
                content: { text: val },
                position: 'right',
            });

            setTyping(true);
            let correction = new Promise<string>((resolve) => resolve(val))
            console.log("CorrectErrors: ", Cookies.get("correctErrors"))
            if (Cookies.get("correctErrors") === "true") {
                correction = grammarChecker.check(val)
            }

            correction.then((correction) => {
                console.log(correction)
                if (correction.trim() !== val.trim()) {
                    appendMsg({
                        type: 'text',
                        content: { text: "*" + correction },
                        position: 'right',
                    });
                }
                conversation.AddUserMessage(correction)

                if (Cookies.get("apiKey") === undefined || Cookies.get("apiKey") === "") {
                    console.log("NO API KEY")
                    appendMsg({
                        type: 'text',
                        content: { text: "Please set an API key in the settings. If you don't have one, you can get it at https://beta.openai.com/account/api-keys after creating an OpenAI account." },
                        position: 'left',
                    });
                }
                else {
                    openai.createChatCompletion({
                        max_tokens:1024,
                        temperature:1,
                        top_p:1,
                        presence_penalty:1,
                        model:'gpt-3.5-turbo',
                        messages:conversation.Messages,
                    }).then((completion)=>{
                        const responseText = completion.data.choices![0].message?.content!;
                        appendMsg({
                            type: 'text',
                            content: { text: responseText.trim() },
                        });
                        conversation.AddAssistanceMessage(responseText.trim())
                    });
                }
            })

        }
    }

    function renderMessageContent(msg: any) {
        
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function (code, _lang) {
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            pedantic: false,
            gfm: true,
            breaks: false,
            sanitize: false,
            smartypants: false,
            xhtml: false
          })
        const { content } = msg;

         let html = marked(content.text)
         return <div className="show-html" dangerouslySetInnerHTML={{ __html: html }}></div>
    }


    return (
        <>
            {
                storedApiKey ? (<Chat
                    navbar={{ title: 'Chatbot' }}
                    messages={messages}
                    renderMessageContent={renderMessageContent}
                    onSend={handleSend}
                    locale="en"
                    placeholder='Type a message'
                />) :
                    (<div className="noApiKeyLabel">We couldn't find an OpenAI API key. Please configure the chatbot in the&nbsp;
                        <span className="spanAsLink" onClick={() => { setCurrent('settings') }}>Settings</span>
                        &nbsp;to continue.</div>)
            }
        </>
    )
}

export default ChatArea;
