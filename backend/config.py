import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


class Settings(BaseSettings):
    app_name: str = "Flight Booking AI Assistant"
    debug: bool = True
    
    llm_provider: str = os.getenv("LLM_PROVIDER", "openai")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_base_url: str = os.getenv("LLM_BASE_URL", "")
    llm_embedded_model: str = os.getenv("LLM_EMBEDDED_MODEL", "text-embedding-3-small")
    llm_embedded_provider: str = os.getenv("LLM_EMBEDDED_PROVIDER", "openai")

    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    port: int = int(os.getenv("PORT", "8000"))

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = 'ignore'

    def get_llm_config(self) -> dict:
        config = {
            "model": self.llm_model,
            "model_provider": self.llm_provider,
        }
        if self.llm_api_key:
            config["api_key"] = self.llm_api_key
        if self.llm_base_url:
            config["base_url"] = self.llm_base_url
        return config

    def get_embedded_llm_config(self) -> dict:
        config = {
            "model": self.llm_embedded_model,
            "model_provider": self.llm_embedded_provider,
        }
        if self.llm_api_key:
            config["api_key"] = self.llm_api_key
        if self.llm_base_url:
            config["base_url"] = self.llm_base_url
        return config

@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
