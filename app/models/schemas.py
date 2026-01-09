"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, List
import re


class TikTokDownloadRequest(BaseModel):
    """Request model for TikTok video download."""
    
    url: str = Field(
        ...,
        description="TikTok video URL",
        examples=["https://www.tiktok.com/@username/video/1234567890"]
    )
    
    @field_validator('url')
    @classmethod
    def validate_tiktok_url(cls, v: str) -> str:
        """Validate that URL is a proper TikTok video URL."""
        patterns = [
            r'https?://(?:www\.)?tiktok\.com/@[\w\.-]+/video/\d+',
            r'https?://(?:vm|vt)\.tiktok\.com/[\w\d]+',
            r'https?://(?:www\.)?tiktok\.com/t/[\w\d]+',
        ]
        
        if not any(re.match(pattern, v) for pattern in patterns):
            raise ValueError(
                "Invalid TikTok URL. Must be a valid TikTok video link "
                "(e.g., https://www.tiktok.com/@user/video/123456)"
            )
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://www.tiktok.com/@zachking/video/7123456789012345678"
            }
        }


class VideoData(BaseModel):
    """Video metadata and download information."""
    
    video_id: str = Field(..., description="TikTok video ID")
    mp4_url: str = Field(..., description="Direct video download URL")
    alternative_urls: Optional[List[str]] = Field(default=[], description="Alternative download URLs")
    author: str = Field(..., description="Username of the video creator")
    caption: Optional[str] = Field(None, description="Video caption/description")
    music: Optional[str] = Field(None, description="Background music title")
    duration: Optional[int] = Field(None, description="Video duration in seconds")
    play_count: Optional[int] = Field(None, description="Number of plays")
    like_count: Optional[int] = Field(None, description="Number of likes")
    comment_count: Optional[int] = Field(None, description="Number of comments")
    share_count: Optional[int] = Field(None, description="Number of shares")
    created_at: Optional[int] = Field(None, description="Creation timestamp")
    cookies: Optional[str] = Field(None, description="Session cookies for proxy")


class TikTokDownloadResponse(BaseModel):
    """Successful response model."""
    
    status: str = Field(default="success", description="Response status")
    video: VideoData = Field(..., description="Video data and metadata")
    cached: bool = Field(default=False, description="Whether result was cached")


class ErrorResponse(BaseModel):
    """Error response model."""
    
    status: str = Field(default="error", description="Response status")
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[dict] = Field(None, description="Additional error details")
