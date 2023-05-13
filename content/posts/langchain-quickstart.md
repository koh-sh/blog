---
title: "LangChain Quickstartをやったメモ"
date: 2023-05-13T21:00:11+09:00
draft: false
tags: ["Python", "LLM", "LangChain"]
---

業務でLangChainを触る機会があったんですが、知識0でガチャガチャやっても埒が明かなかったので[QuickStart][Link1]をやってみたメモです。

内容は2023/05/13時点のものです。

バージョン

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% python --version
Python 3.9.1
[koh@Kohs-MacBook-Pro-M1-387] ~
% pip list | grep -e langchain -e openai
langchain                0.0.165
openai                   0.27.6
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

# Quickstart Guide

## Installation / Environment Setup

ライブラリのインストールとOpenAIのAPI Key設定

OpenAIのAPI Keyは[ここ][Link2]で発行

```bash
pip install langchain
pip install openai

export OPENAI_API_KEY="..."
```

## Building a Language Model Application: LLMs

LLM(Large Language Models)が動くアプリを作っていきます。

### LLMs: Get predictions from a language model

まずは`LLM`に質問に答えてもらいます。ものに応じてそれを作る会社名を提案してもらう例。

```python
In [1]: from langchain.llms import OpenAI

In [2]: llm = OpenAI(temperature=0.9)

In [3]: text = "What would be a good company name for a company that makes colorful socks?"

In [4]: print(llm(text))


Rainbow Sox.

In [5]:
```

### Prompt Templates: Manage prompts for LLMs

上の例だとLLMに投げるテキストがベタ書きだったけど、実際のアプリではユーザ入力と事前に用意したプロンプトを組み合わせてLLMに投げることがほとんど。

そのための機能として`Prompt Templates`を使う。

```python
In [1]: from langchain.prompts import PromptTemplate
   ...:
   ...: prompt = PromptTemplate(
   ...:     input_variables=["product"],
   ...:     template="What is a good name for a company that makes {product}?",
   ...: )

In [2]: print(prompt.format(product="colorful socks"))
What is a good name for a company that makes colorful socks?

In [3]:
```

### Chains: Combine LLMs and prompts in multi-step workflows

`Chain`: `Prompt Templates`と`LLM`を組み合わせて動かす。

```python
In [1]: from langchain.prompts import PromptTemplate
   ...: from langchain.llms import OpenAI
   ...:
   ...: llm = OpenAI(temperature=0.9)
   ...: prompt = PromptTemplate(
   ...:     input_variables=["product"],
   ...:     template="What is a good name for a company that makes {product}?",
   ...: )

In [2]: from langchain.chains import LLMChain
   ...: chain = LLMChain(llm=llm, prompt=prompt)

In [3]: chain.run("colorful socks")
Out[3]: '\n\nColorfulCo Socks.'

In [4]:
```

### Agents: Dynamically Call Chains Based on User Input

`Agents`はLLMを使ってどういうアクションをどういう順序で実施するかを考える。

以下の3つのコンセプトが関係する。

- `Tool`: タスクを実施するfunction (Google Search, Database lookupなど)
- `LLM`: Agentが使用するLLM
- `Agent`: 実際に振る舞うAgent。(多分モデルによって振る舞いが変わる?)

サンプルでは[SerpApi][Link3]を使用するのでAPI keyを取得しておく。

```bash
pip install google-search-results
export SERPAPI_API_KEY="..."
```

```python
In [1]: from langchain.agents import load_tools
   ...: from langchain.agents import initialize_agent
   ...: from langchain.agents import AgentType
   ...: from langchain.llms import OpenAI

In [2]: llm = OpenAI(temperature=0)

In [3]: tools = load_tools(["serpapi", "llm-math"], llm=llm)

In [4]: agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

In [5]: agent.run("What was the high temperature in SF yesterday in Fahrenheit? What is that number raised to the .023 power?")


> Entering new AgentExecutor chain...
 I need to find the temperature first, then use the calculator to raise it to the .023 power.
Action: Search
Action Input: "High temperature in SF yesterday"
Observation: High: 62.6ºf @11:45 AM Low: 53.6ºf @4:40 AM Approx.
Thought: I now need to use the calculator to raise 62.6 to the .023 power
Action: Calculator
Action Input: 62.6^.023
Observation: Answer: 1.0998189786478374
Thought: I now know the final answer
Final Answer: 1.0998189786478374

> Finished chain.
Out[5]: '1.0998189786478374'

In [6]:
```

「サンフランシスコの昨日の最高気温を0.23乗した値は？」という問いに対してAgentは

- 昨日の最高気温の検索
- 取得した最高気温に0.23乗

というプロセスで回答しているのがわかる。面白い。

### Memory: Add State to Chains and Agents

`Memory`: 単純な一問一答だけでなく、過去の会話を短期的に記憶してよりよい回答を出す仕組み。

```python
In [1]: from langchain import OpenAI, ConversationChain

In [2]: llm = OpenAI(temperature=0)
   ...: conversation = ConversationChain(llm=llm, verbose=True)

In [3]: output = conversation.predict(input="Hi there!")
   ...: print(output)


> Entering new ConversationChain chain...
Prompt after formatting:
The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI:

> Finished chain.
 Hi there! It's nice to meet you. How can I help you today?

In [4]: output = conversation.predict(input="I'm doing well! Just having a conversation with an AI.")
   ...: print(output)


> Entering new ConversationChain chain...
Prompt after formatting:
The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
Human: Hi there!
AI:  Hi there! It's nice to meet you. How can I help you today?
Human: I'm doing well! Just having a conversation with an AI.
AI:

> Finished chain.
 That's great! It's always nice to have a conversation with someone new. What would you like to talk about?

In [5]:
```

2個目のOutputには会話のやり取りが記録されている。

## Building a Language Model Application: Chat Models

LLMを使ったChatアプリを作っていきます。  
これまでの単純な一問一答ではなくinput/outputが１セットとなるIFとなります。

### Get Message Completions from a Chat Model

Chatの形でLLMを使うパターン。`ChatMessage`は以下の3つで構成される。

- `AIMessage`: AI(LLM)からのメッセージ
- `HumanMessage`: 人間(ユーザ)からのメッセージ
- `SystemMessage`: システム(Chat)に渡す前提となるメッセージ

```python
In [1]: from langchain.chat_models import ChatOpenAI
   ...: from langchain.schema import (
   ...:     AIMessage,
   ...:     HumanMessage,
   ...:     SystemMessage
   ...: )
   ...:
   ...: chat = ChatOpenAI(temperature=0)

In [2]: chat([HumanMessage(content="Translate this sentence from English to French. I love programming.")])
Out[2]: AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)

In [3]: messages = [
   ...:     SystemMessage(content="You are a helpful assistant that translates English to French."),
   ...:     HumanMessage(content="I love programming.")
   ...: ]
   ...: chat(messages)
Out[3]: AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)

In [4]: batch_messages = [
   ...:     [
   ...:         SystemMessage(content="You are a helpful assistant that translates English to French."),
   ...:         HumanMessage(content="I love programming.")
   ...:     ],
   ...:     [
   ...:         SystemMessage(content="You are a helpful assistant that translates English to French."),
   ...:         HumanMessage(content="I love artificial intelligence.")
   ...:     ],
   ...: ]
   ...: result = chat.generate(batch_messages)

In [5]: result
Out[5]: LLMResult(generations=[[ChatGeneration(text="J'adore la programmation.", generation_info=None, message=AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False))], [ChatGeneration(text="J'adore l'intelligence artificielle.", generation_info=None, message=AIMessage(content="J'adore l'intelligence artificielle.", additional_kwargs={}, example=False))]], llm_output={'token_usage': {'prompt_tokens': 57, 'completion_tokens': 20, 'total_tokens': 77}, 'model_name': 'gpt-3.5-turbo'})

In [6]: result.llm_output['token_usage']
Out[6]: {'prompt_tokens': 57, 'completion_tokens': 20, 'total_tokens': 77}

In [7]:
```

- HumanMessageを渡すとAIMessageが返ってくる。
- 一緒にSystemMessageを渡すとどのように振る舞って欲しいかの指示が出せる。
- 複数のmessageを同時に渡せる。
- 結果(LLMResult)にはtokenどのくらい使ったかなどのメタデータも含まれる

### Chat Prompt Templates

ChatにもPrompt Templatesがあります。

SystemMessage用とHumanMessage用それぞれにTemplateを使えます。

```python
In [1]: from langchain.chat_models import ChatOpenAI
   ...: from langchain.prompts.chat import (
   ...:     ChatPromptTemplate,
   ...:     SystemMessagePromptTemplate,
   ...:     HumanMessagePromptTemplate,
   ...: )

In [2]: chat = ChatOpenAI(temperature=0)

In [3]: template = "You are a helpful assistant that translates {input_language} to {output_language}."
   ...: system_message_prompt = SystemMessagePromptTemplate.from_template(template)
   ...: human_template = "{text}"
   ...: human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

In [4]: chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

In [5]: chat(chat_prompt.format_prompt(input_language="English", output_language="French", text="I love programming.").to_messages())
Out[5]: AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)

In [6]:
```

### Chains with Chat Models

ChatでもChain(LLMとPrompt Templateの組み合わせ)を使えます。

```python
In [1]: from langchain.chat_models import ChatOpenAI
   ...: from langchain import LLMChain
   ...: from langchain.prompts.chat import (
   ...:     ChatPromptTemplate,
   ...:     SystemMessagePromptTemplate,
   ...:     HumanMessagePromptTemplate,
   ...: )

In [2]: chat = ChatOpenAI(temperature=0)

In [3]: template = "You are a helpful assistant that translates {input_language} to {output_language}."
   ...: system_message_prompt = SystemMessagePromptTemplate.from_template(template)
   ...: human_template = "{text}"
   ...: human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
   ...: chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

In [4]: chain = LLMChain(llm=chat, prompt=chat_prompt)

In [5]: chain.run(input_language="English", output_language="French", text="I love programming.")
   ...:
Out[5]: "J'adore la programmation."

In [6]:
```

### Agents with Chat Models

ChatにもAgentsが使えます。

```python
In [1]: from langchain.agents import load_tools
   ...: from langchain.agents import initialize_agent
   ...: from langchain.agents import AgentType
   ...: from langchain.chat_models import ChatOpenAI
   ...: from langchain.llms import OpenAI

In [2]: chat = ChatOpenAI(temperature=0)

In [3]: llm = OpenAI(temperature=0)
   ...: tools = load_tools(["serpapi", "llm-math"], llm=llm)

In [4]: agent = initialize_agent(tools, chat, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

In [5]: agent.run("Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?")


> Entering new AgentExecutor chain...
Thought: I need to use a search engine to find Olivia Wilde's boyfriend and a calculator to raise his age to the 0.23 power.
Action:
\```
{
  "action": "Search",
  "action_input": "Olivia Wilde boyfriend"
}
\```

Observation: Sudeikis and Wilde's relationship ended in November 2020. Wilde was publicly served with court documents regarding child custody while she was presenting Don't Worry Darling at CinemaCon 2022. In January 2021, Wilde began dating singer Harry Styles after meeting during the filming of Don't Worry Darling.
Thought:I need to use a search engine to find Harry Styles' current age.
Action:
\```
{
  "action": "Search",
  "action_input": "Harry Styles age"
}
\```

Observation: 29 years
Thought:Now I need to calculate 29 raised to the 0.23 power.
Action:
\```
{
  "action": "Calculator",
  "action_input": "29^0.23"
}
\```


Observation: Answer: 2.169459462491557
I now know the final answer.
Final Answer: 2.169459462491557

> Finished chain.
Out[5]: '2.169459462491557'

In [6]:
```

ちなみにOpenAIのアカウントが無料枠だとAPIの実行制限に引っ掛かります。(3 times/min)

```text
Retrying langchain.chat_models.openai.ChatOpenAI.completion_with_retry.<locals>._completion_with_retry in 2.0 seconds as it raised RateLimitError: Rate limit reached for default-gpt-3.5-turbo in organization org-xxx on requests per min. Limit: 3 / min. Please try again in 20s. Contact us through our help center at help.openai.com if you continue to have issues. Please add a payment method to your account to increase your rate limit. Visit https://platform.openai.com/account/billing to add a payment method..
```

### Memory: Add State to Chains and Agents

ChatにもMemoryが使えます。

```python
In [1]: from langchain.prompts import (
   ...:     ChatPromptTemplate,
   ...:     MessagesPlaceholder,
   ...:     SystemMessagePromptTemplate,
   ...:     HumanMessagePromptTemplate
   ...: )
   ...: from langchain.chains import ConversationChain
   ...: from langchain.chat_models import ChatOpenAI
   ...: from langchain.memory import ConversationBufferMemory

In [2]: prompt = ChatPromptTemplate.from_messages([
   ...:     SystemMessagePromptTemplate.from_template("The following is a friendly conversation between a human and an AI. The AI is ta
   ...: lkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully
   ...:  says it does not know."),
   ...:     MessagesPlaceholder(variable_name="history"),
   ...:     HumanMessagePromptTemplate.from_template("{input}")
   ...: ])

In [3]: llm = ChatOpenAI(temperature=0)
   ...: memory = ConversationBufferMemory(return_messages=True)
   ...: conversation = ConversationChain(memory=memory, prompt=prompt, llm=llm)

In [4]: conversation.predict(input="Hi there!")
Out[4]: 'Hello! How can I assist you today?'

In [5]: conversation.predict(input="I'm doing well! Just having a conversation with an AI.")
Out[5]: "That sounds like fun! I'm happy to chat with you. Is there anything specific you'd like to talk about?"

In [6]: conversation.predict(input="Tell me about yourself.")
Out[6]: "Sure! I am an AI language model created by OpenAI. I was trained on a large dataset of text from the internet, which allows me to understand and generate human-like language. I can answer questions, provide information, and even have conversations like this one. Is there anything else you'd like to know about me?"

In [7]:
```

# まとめ

量はそこまで多くないが、LangChainの基本的な用語や概念がわかってよかった。  
ただ真面目に色々やろうとすると結構複雑でもうちょい理解が必要そう。。

[Link1]: https://python.langchain.com/en/latest/getting_started/getting_started.html
[Link2]: https://platform.openai.com/account/api-keys
[Link3]: https://serpapi.com
