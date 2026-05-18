from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class VillageStreet(Base):
    __tablename__ = "village_streets"

    village_street_id = Column(Integer, primary_key=True, autoincrement=True)
    village_street_name = Column(String(200), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.ward_id", onupdate="CASCADE"), nullable=False)

    ward = relationship("Ward", back_populates="village_streets")
    schools = relationship("School", back_populates="village_street")
