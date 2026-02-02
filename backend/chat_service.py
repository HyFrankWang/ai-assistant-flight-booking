import os
import sys
from typing import Iterator, Optional, Union, Dict, Any
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from langchain.chat_models import init_chat_model
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage
from langchain.agents import create_agent

from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.runnables import RunnableConfig

from config import settings
from rag_service import get_rag_service, search_rag_policy
from tools import get_booking_tools

SYSTEM_PROMPT = """You are a customer chat support agent of an airline named "Funnair".
Respond in a friendly, helpful, and joyful manner.
You are interacting with customers through an online chat system.

You have access to the following tools:
1. Booking tools (get_booking_details, change_booking, cancel_booking) - for managing customer bookings
2. search_rag_policy - for answering questions about airline policies, fees, terms of service, etc.

When a customer asks about:
- Booking status/details: Use get_booking_details
- Changing a booking: Use change_booking
- Cancelling a booking: Use cancel_booking
- Policies, fees, terms, refunds, baggage: Use search_rag_policy

Before answering questions about bookings or cancelling, you MUST get: booking number, customer first name and last name.
If I can not retrieve the status of my flight, please just say "I am sorry, I can not find the booking details".

For policy questions, always use the search_rag_policy tool to provide accurate information.

You have access to the conversation history. Use this context to understand references like "my previous booking" or "that flight" without requiring the user to repeat information already provided.

Remember the context of the conversation. If the user refers to "my booking" or similar without specifying, refer to previous messages in the conversation.

Use the appropriate tool based on the customer's request.
Always be polite, professional, and helpful."""


class ChatService:
    def __init__(self):
        try:
            config = settings.get_llm_config()
            config["streaming"] = True
            if config.get("model_provider") == "nvidia":
                self.llm = ChatNVIDIA(
                    model=config.get("model"),
                    api_key=config.get("api_key"),
                    streaming=True,
                )
            else:
                self.llm = init_chat_model(**config)

        except Exception as e:
            raise RuntimeError(f"Failed to initialize LLM: {str(e)}")
        self.checkpointer = InMemorySaver()
        self._init_agent()

    def _init_agent(self):
        tools = get_booking_tools()
        tools.append(search_rag_policy)

        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            system_prompt=SYSTEM_PROMPT,
            checkpointer=self.checkpointer,
        )

    def chat_stream(self, message: str, chat_id: str) -> Iterator[str]:
        try:
            config: RunnableConfig = {"configurable": {"thread_id": chat_id}}
            inputs = {"messages": [HumanMessage(content=message)]}

            for chunk in self.agent.stream(inputs, config=config, stream_mode="updates"):
                if isinstance(chunk, dict):
                    if "agent" in chunk:
                        msg = chunk["agent"]["messages"][-1]
                        if hasattr(msg, "content") and msg.content:
                            yield msg.content
                    elif "model" in chunk:
                        msg = chunk["model"]["messages"][-1]
                        if hasattr(msg, "content") and msg.content:
                            yield msg.content
                    elif "tools" in chunk:
                        pass
        except Exception as e:
            error_msg = f"I apologize, but I'm having trouble connecting to the AI service right now. Please try again later. (Error: {str(e)[:200]})"
            yield error_msg

    def clear_chat_history(self, chat_id: str) -> None:
        pass

    def get_chat_history_length(self, chat_id: str) -> int:
        return 0


_chat_service: Optional[ChatService] = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
