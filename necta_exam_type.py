"""
NECTA Exam Type Enum and Model
File: app/db/models/necta/necta_exam_type.py

Defines official NECTA examination types (different from ShuleYetu internal exam types).
These are the national examination types administered by NECTA.
"""

from sqlalchemy import Column, String, Boolean, DateTime, text, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.enums.necta.exam_types import NectaExamTypeEnum


class NectaExamType(Base):
    """
    NECTA Exam Type master table.
    
    Stores official NECTA examination types used for results analysis.
    These are different from ShuleYetu internal exam types (ANN, MOK, etc.).
    """
    __tablename__ = "necta_exam_types"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Exam type code (from enum)
    exam_type_code = Column(String(10), unique=True, nullable=False, index=True)
    
    # Display names
    exam_type_name = Column(String(100), nullable=False)
    exam_type_name_swahili = Column(String(100), nullable=True)
    
    # Description
    description = Column(String(500), nullable=True)
    
    # Educational level
    education_level = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), 
                       onupdate=text('CURRENT_TIMESTAMP'), nullable=False)
    
    # Relationships
    user_access = relationship("UserNectaAccess", back_populates="exam_type")
    
    def __repr__(self) -> str:
        return f"<NectaExamType(code={self.exam_type_code}, name={self.exam_type_name})>"
