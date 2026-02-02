import os
import sys
from pathlib import Path
from typing import List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

from langchain_community.vectorstores import FAISS
from langchain_core.tools import tool

from config import settings


class RAGService:
    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self._init_vector_store()

    def _init_vector_store(self):
        terms_file = Path(__file__).parent / "terms_of_service.txt"
        if not terms_file.exists():
            print("Warning: terms_of_service.txt not found. RAG will have limited functionality.")
            return

        try:
            loader = TextLoader(str(terms_file))
            documents = loader.load()

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            splits = text_splitter.split_documents(documents)

            config = settings.get_embedded_llm_config()

            if config.get("model_provider") == "nvidia":
                embeddings = NVIDIAEmbeddings(
                    model=config.get("model"),
                    api_key=config.get("api_key"),
                )
            else: 
                embeddings = OpenAIEmbeddings(
                model=config.get("model"),
                api_key=config.get("api_key"),
                base_url=config.get("base_url"),
            )

            self.vector_store = FAISS.from_documents(
                documents=splits,
                embedding=embeddings,
            )
            self.retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 4},
            )
            print(f"RAG Service initialized with {len(splits)} document chunks")
        except Exception as e:
            print(f"Warning: RAG Service initialization failed ({e}). RAG will have limited functionality.")

    def search(self, query: str) -> List[str]:
        if not self.retriever:
            return []
        docs = self.retriever.invoke(query)
        return [doc.page_content for doc in docs]


@tool
def search_rag_policy(query: str) -> str:
    """Search for airline policy information from the knowledge base."""
    rag_service = get_rag_service()
    results = rag_service.search(query)
    
    if not results:
        return "No relevant policy information found."
    return "\n\n".join(results)


_rag_service = None


def get_rag_service() -> RAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
