from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Generator

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health_vault.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def utc_now() -> datetime:
    """Return a timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def ensure_utc(dt: datetime | None) -> datetime | None:
    """Normalize SQLite naive datetimes back to UTC-aware datetimes."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class Base(DeclarativeBase):
    pass


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    date_of_birth: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blood_type: Mapped[str | None] = mapped_column(String(10), nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)

    # PIN security (salted PBKDF2-HMAC-SHA256 hash)
    pin_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    pin_salt: Mapped[str] = mapped_column(String(64), nullable=False)
    failed_pin_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Biometric verification (device-bound public key)
    biometric_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    biometric_device_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    biometric_public_key_pem: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    vault_records: Mapped[list[HealthVaultRecord]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    triage_logs: Mapped[list[TriageLog]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    biometric_challenges: Mapped[list[BiometricChallenge]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class HealthVaultRecord(Base):
    __tablename__ = "health_vault_records"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # e.g., allergy, medication, condition, immunization, vital, document
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    details_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    recorded_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    user: Mapped[UserProfile] = relationship(back_populates="vault_records")


class TriageLog(Base):
    __tablename__ = "triage_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    session_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)

    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    ai_response: Mapped[str] = mapped_column(Text, nullable=False)
    urgency_level: Mapped[str] = mapped_column(
        String(20), index=True, nullable=False
    )  # LOW, MODERATE, HIGH, EMERGENCY
    red_flags_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    recommended_facilities_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    care_advice_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    model_used: Mapped[str] = mapped_column(String(80), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    user: Mapped[UserProfile] = relationship(back_populates="triage_logs")


class BiometricChallenge(Base):
    __tablename__ = "biometric_challenges"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    nonce: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    user: Mapped[UserProfile] = relationship(back_populates="biometric_challenges")


def init_db() -> None:
    """Create all database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
